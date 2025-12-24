'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
    silenceTimeout?: number; // milliseconds of silence before auto-submit
    onSilenceDetected?: () => void; // callback when silence is detected
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;
    hasSpoken: boolean; // true if user has spoken at least once
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
    const { silenceTimeout = 2000, onSilenceDetected } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const onSilenceDetectedRef = useRef(onSilenceDetected);
    const isListeningRef = useRef(false); // Track actual listening state
    const shouldBeListeningRef = useRef(false); // Track desired state

    // Keep the callback ref updated
    useEffect(() => {
        onSilenceDetectedRef.current = onSilenceDetected;
    }, [onSilenceDetected]);

    // Clear silence timer
    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    // Reset silence timer - called when speech is detected
    const resetSilenceTimer = useCallback(() => {
        clearSilenceTimer();

        silenceTimerRef.current = setTimeout(() => {
            // Check if we have spoken and callback exists
            if (onSilenceDetectedRef.current) {
                console.log('Silence detected, triggering callback');
                onSilenceDetectedRef.current();
            }
        }, silenceTimeout);
    }, [clearSilenceTimer, silenceTimeout]);

    // Initialize speech recognition once
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        setIsSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + ' ';
                } else {
                    interim += result[0].transcript;
                }
            }

            // User is speaking - reset silence timer
            if (finalTranscript || interim) {
                setHasSpoken(true);
                resetSilenceTimer();
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Don't log expected errors
            const ignoredErrors = ['no-speech', 'aborted'];
            if (ignoredErrors.includes(event.error)) {
                return;
            }

            console.error('Speech recognition error:', event.error);

            if (event.error === 'audio-capture') {
                setError('No microphone found. Please check your audio settings.');
                isListeningRef.current = false;
                setIsListening(false);
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
                isListeningRef.current = false;
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            isListeningRef.current = false;

            // Restart if we should still be listening
            if (shouldBeListeningRef.current) {
                setTimeout(() => {
                    if (shouldBeListeningRef.current && recognitionRef.current && !isListeningRef.current) {
                        try {
                            recognitionRef.current.start();
                            isListeningRef.current = true;
                        } catch (e) {
                            // Silently ignore - might already be starting
                        }
                    }
                }, 100);
            } else {
                setIsListening(false);
            }
        };

        recognition.onstart = () => {
            isListeningRef.current = true;
        };

        return () => {
            clearSilenceTimer();
            shouldBeListeningRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [resetSilenceTimer, clearSilenceTimer]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) return;

        // If already listening, don't try to start again
        if (isListeningRef.current) {
            setIsListening(true);
            return;
        }

        setError(null);
        setInterimTranscript('');
        setHasSpoken(false);
        clearSilenceTimer();
        shouldBeListeningRef.current = true;

        try {
            recognitionRef.current.start();
            isListeningRef.current = true;
            setIsListening(true);
        } catch (e) {
            // If already started, just update state
            if ((e as Error).message?.includes('already started')) {
                isListeningRef.current = true;
                setIsListening(true);
            } else {
                console.error('Failed to start recognition:', e);
                // Try to abort and restart
                try {
                    recognitionRef.current.abort();
                } catch (abortErr) {
                    // Ignore
                }
                setTimeout(() => {
                    if (shouldBeListeningRef.current && recognitionRef.current && !isListeningRef.current) {
                        try {
                            recognitionRef.current.start();
                            isListeningRef.current = true;
                            setIsListening(true);
                        } catch (retryErr) {
                            setError('Failed to start speech recognition');
                        }
                    }
                }, 200);
            }
        }
    }, [clearSilenceTimer, isSupported]);

    const stopListening = useCallback(() => {
        shouldBeListeningRef.current = false;
        clearSilenceTimer();
        setIsListening(false);
        setInterimTranscript('');

        if (recognitionRef.current && isListeningRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
            isListeningRef.current = false;
        }
    }, [clearSilenceTimer]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setHasSpoken(false);
        clearSilenceTimer();
    }, [clearSilenceTimer]);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        hasSpoken,
        startListening,
        stopListening,
        resetTranscript,
    };
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}
