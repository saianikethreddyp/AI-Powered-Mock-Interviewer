'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechReturn {
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
    speak: (text: string) => Promise<void>;
    pause: () => void;
    resume: () => void;
    cancel: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const resolveRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // We support TTS either via API or browser
        setIsSupported(true);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const speak = useCallback(async (text: string): Promise<void> => {
        return new Promise(async (resolve) => {
            resolveRef.current = resolve;
            setIsSpeaking(true);
            setIsPaused(false);

            try {
                // Try to use OpenAI TTS API first
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        voice: 'nova' // Natural female voice good for interviews
                    }),
                });

                const data = await response.json();

                if (data.audio) {
                    // Use high-quality OpenAI audio
                    const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
                    audioRef.current = audio;

                    audio.onended = () => {
                        setIsSpeaking(false);
                        setIsPaused(false);
                        resolveRef.current?.();
                    };

                    audio.onerror = () => {
                        console.error('Audio playback error, falling back to browser TTS');
                        useBrowserTTS(text, resolve);
                    };

                    audio.onpause = () => {
                        setIsPaused(true);
                    };

                    audio.onplay = () => {
                        setIsPaused(false);
                    };

                    await audio.play();
                } else {
                    // Fallback to browser TTS
                    useBrowserTTS(text, resolve);
                }
            } catch (error) {
                console.error('TTS API error, using browser fallback:', error);
                useBrowserTTS(text, resolve);
            }
        });
    }, []);

    // Fallback browser TTS
    const useBrowserTTS = useCallback((text: string, resolve: () => void) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setIsSpeaking(false);
            resolve();
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const preferredVoice = englishVoices.find(v =>
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('natural')
        ) || englishVoices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            resolve();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.pause();
        }
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }
        setIsPaused(false);
    }, []);

    const cancel = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsPaused(false);
        resolveRef.current?.();
    }, []);

    return {
        isSpeaking,
        isPaused,
        isSupported,
        speak,
        pause,
        resume,
        cancel,
    };
}
