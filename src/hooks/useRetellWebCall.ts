'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

interface TranscriptItem {
    role: 'agent' | 'user';
    content: string;
}

interface UseRetellWebCallOptions {
    onCallStarted?: () => void;
    onCallEnded?: (transcript: TranscriptItem[]) => void;
    onAgentStartTalking?: () => void;
    onAgentStopTalking?: () => void;
    onError?: (error: Error) => void;
}

interface UseRetellWebCallReturn {
    isCallActive: boolean;
    isAgentSpeaking: boolean;
    isConnecting: boolean;
    transcript: TranscriptItem[];
    error: string | null;
    startCall: (accessToken: string) => Promise<void>;
    endCall: () => void;
}

export function useRetellWebCall(options: UseRetellWebCallOptions = {}): UseRetellWebCallReturn {
    const {
        onCallStarted,
        onCallEnded,
        onAgentStartTalking,
        onAgentStopTalking,
        onError,
    } = options;

    const [isCallActive, setIsCallActive] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const transcriptRef = useRef<TranscriptItem[]>([]);
    const retellClientRef = useRef<RetellWebClient | null>(null);
    const hasEndedRef = useRef(false);

    // Store callbacks in refs so they can be accessed in event handlers
    const callbacksRef = useRef({
        onCallStarted,
        onCallEnded,
        onAgentStartTalking,
        onAgentStopTalking,
        onError,
    });

    // Update callback refs when props change
    useEffect(() => {
        callbacksRef.current = {
            onCallStarted,
            onCallEnded,
            onAgentStartTalking,
            onAgentStopTalking,
            onError,
        };
    }, [onCallStarted, onCallEnded, onAgentStartTalking, onAgentStopTalking, onError]);

    // Setup event handlers for a client
    const setupClientEventHandlers = useCallback((client: RetellWebClient) => {
        client.on('call_started', () => {
            console.log('Retell call started');
            hasEndedRef.current = false;
            setIsCallActive(true);
            setIsConnecting(false);
            setError(null);
            callbacksRef.current.onCallStarted?.();
        });

        client.on('call_ended', () => {
            console.log('Retell call ended event received');
            if (!hasEndedRef.current) {
                hasEndedRef.current = true;
                setIsCallActive(false);
                setIsAgentSpeaking(false);
                setIsConnecting(false);
                // Call the callback with current transcript
                callbacksRef.current.onCallEnded?.(transcriptRef.current);
            }
        });

        client.on('agent_start_talking', () => {
            setIsAgentSpeaking(true);
            callbacksRef.current.onAgentStartTalking?.();
        });

        client.on('agent_stop_talking', () => {
            setIsAgentSpeaking(false);
            callbacksRef.current.onAgentStopTalking?.();
        });

        client.on('update', (update: { transcript?: Array<{ role: string; content: string }> }) => {
            if (update.transcript) {
                const formattedTranscript: TranscriptItem[] = update.transcript.map(item => ({
                    role: item.role === 'agent' ? 'agent' : 'user',
                    content: item.content,
                }));
                setTranscript(formattedTranscript);
                transcriptRef.current = formattedTranscript;
            }
        });

        client.on('error', (err: Error) => {
            console.error('Retell error:', err);
            setError(err.message || 'An error occurred during the call');
            setIsConnecting(false);
            callbacksRef.current.onError?.(err);
        });
    }, []);

    // Initialize the Retell client once on mount
    useEffect(() => {
        const client = new RetellWebClient();
        retellClientRef.current = client;
        setupClientEventHandlers(client);

        // Cleanup on unmount
        return () => {
            if (retellClientRef.current) {
                try {
                    retellClientRef.current.stopCall();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, [setupClientEventHandlers]);

    const startCall = useCallback(async (accessToken: string) => {
        // Reset state
        hasEndedRef.current = false;
        setIsConnecting(true);
        setError(null);
        setTranscript([]);
        transcriptRef.current = [];

        // Create fresh client for each call to avoid stale state
        if (retellClientRef.current) {
            try {
                retellClientRef.current.stopCall();
            } catch (e) {
                // Ignore
            }
        }

        const client = new RetellWebClient();
        retellClientRef.current = client;
        setupClientEventHandlers(client);

        try {
            await client.startCall({
                accessToken,
                sampleRate: 24000,
            });
        } catch (err) {
            console.error('Failed to start Retell call:', err);
            setError('Failed to start call. Please check your microphone permissions.');
            setIsConnecting(false);
            throw err;
        }
    }, [setupClientEventHandlers]);

    const endCall = useCallback(() => {
        console.log('Manually ending Retell call...');

        if (retellClientRef.current) {
            try {
                // stopCall() should trigger the 'call_ended' event
                retellClientRef.current.stopCall();
            } catch (e) {
                console.error('Error stopping Retell call:', e);
            }
        }

        // Fallback: if call_ended event doesn't fire within 500ms, force completion
        setTimeout(() => {
            if (!hasEndedRef.current) {
                console.log('call_ended event did not fire, forcing completion...');
                hasEndedRef.current = true;
                setIsCallActive(false);
                setIsAgentSpeaking(false);
                setIsConnecting(false);
                callbacksRef.current.onCallEnded?.(transcriptRef.current);
            }
        }, 500);
    }, []);

    // Cleanup on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (retellClientRef.current) {
                try {
                    retellClientRef.current.stopCall();
                } catch (e) {
                    // Ignore
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return {
        isCallActive,
        isAgentSpeaking,
        isConnecting,
        transcript,
        error,
        startCall,
        endCall,
    };
}
