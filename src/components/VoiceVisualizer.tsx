'use client';

import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
    isActive: boolean;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function VoiceVisualizer({ isActive, color = '#6366f1', size = 'md' }: VoiceVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let audioContext: AudioContext | null = null;

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;

                audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;
            } catch (error) {
                console.error('Failed to initialize audio:', error);
            }
        };

        if (isActive) {
            initAudio();
        }

        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContext) {
                audioContext.close();
            }
        };
    }, [isActive]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            if (isActive && analyserRef.current) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(dataArray);

                const barCount = 20;
                const barWidth = width / barCount - 4;
                const centerY = height / 2;

                for (let i = 0; i < barCount; i++) {
                    const index = Math.floor((i / barCount) * bufferLength);
                    const value = dataArray[index];
                    const barHeight = (value / 255) * (height * 0.8);

                    const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(0.5, `${color}cc`);
                    gradient.addColorStop(1, color);

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.roundRect(
                        i * (barWidth + 4) + 2,
                        centerY - barHeight / 2,
                        barWidth,
                        barHeight,
                        barWidth / 2
                    );
                    ctx.fill();
                }
            } else {
                // Idle animation
                const barCount = 20;
                const barWidth = width / barCount - 4;
                const centerY = height / 2;
                const time = Date.now() / 1000;

                for (let i = 0; i < barCount; i++) {
                    const barHeight = Math.sin(time * 2 + i * 0.3) * 10 + 15;

                    ctx.fillStyle = `${color}80`;
                    ctx.beginPath();
                    ctx.roundRect(
                        i * (barWidth + 4) + 2,
                        centerY - barHeight / 2,
                        barWidth,
                        barHeight,
                        barWidth / 2
                    );
                    ctx.fill();
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, color]);

    const sizeMap = {
        sm: { width: 150, height: 40 },
        md: { width: 250, height: 60 },
        lg: { width: 350, height: 80 },
    };

    return (
        <div className="flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={sizeMap[size].width}
                height={sizeMap[size].height}
                className="rounded-lg"
            />
        </div>
    );
}
