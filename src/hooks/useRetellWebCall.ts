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

    // Initialize the Retell client
    useEffect(() => {
        retellClientRef.current = new RetellWebClient();
        const client = retellClientRef.current;

        // Set up event listeners
        client.on('call_started', () => {
            console.log('Retell call started');
            setIsCallActive(true);
            setIsConnecting(false);
            setError(null);
            onCallStarted?.();
        });

        client.on('call_ended', () => {
            console.log('Retell call ended');
            setIsCallActive(false);
            setIsAgentSpeaking(false);
            setIsConnecting(false);
            onCallEnded?.(transcriptRef.current);
        });

        client.on('agent_start_talking', () => {
            setIsAgentSpeaking(true);
            onAgentStartTalking?.();
        });

        client.on('agent_stop_talking', () => {
            setIsAgentSpeaking(false);
            onAgentStopTalking?.();
        });

        client.on('update', (update: { transcript?: Array<{ role: string; content: string }> }) => {
            if (update.transcript) {
                // Convert transcript to our format
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
            onError?.(err);
        });

        // Cleanup on unmount
        return () => {
            if (retellClientRef.current) {
                try {
                    retellClientRef.current.stopCall();
                    // Explicitly cleanup any audio elements if exposed by the SDK, 
                    // though stopCall() should handle it.
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, [onCallStarted, onCallEnded, onAgentStartTalking, onAgentStopTalking, onError]);

    const startCall = useCallback(async (accessToken: string) => {
        if (!retellClientRef.current) {
            setError('Retell client not initialized');
            return;
        }

        setIsConnecting(true);
        setError(null);
        setTranscript([]);

        try {
            await retellClientRef.current.startCall({
                accessToken,
                sampleRate: 24000,
            });
        } catch (err) {
            console.error('Failed to start Retell call:', err);
            setError('Failed to start call. Please check your microphone permissions.');
            setIsConnecting(false);
            throw err;
        }
    }, []);

    const endCall = useCallback(() => {
        if (retellClientRef.current) {
            retellClientRef.current.stopCall();
        }
        setIsCallActive(false);
        setIsAgentSpeaking(false);
        setIsConnecting(false);
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
