'use client';

import React from 'react';

interface AIAvatarProps {
    isSpeaking: boolean;
    isListening: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function AIAvatar({ isSpeaking, isListening, size = 'md' }: AIAvatarProps) {
    const sizeClasses = {
        sm: "w-24 h-24",
        md: "w-48 h-48",
        lg: "w-64 h-64",
    };

    const containerSize = {
        sm: "w-32 h-32",
        md: "w-64 h-64",
        lg: "w-80 h-80",
    };

    const statusMap = {
        speaking: { text: "Speaking...", color: "text-primary", dot: "bg-primary animate-pulse" },
        listening: { text: "Listening...", color: "text-purple-400", dot: "bg-purple-400" },
        idle: { text: "Ready", color: "text-slate-400", dot: "bg-slate-500" },
    };

    const currentStatus = isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';
    const status = statusMap[currentStatus];

    return (
        <div className={`relative flex flex-col items-center justify-center ${containerSize[size]}`}>
            {/* Waves/Glow */}
            {(isSpeaking || isListening) && (
                <>
                    <div className={`absolute inset-0 rounded-full ${isSpeaking ? 'bg-primary/20 animate-pulse-slow' : 'bg-purple-500/10'}`} />
                    <div className={`absolute inset-4 rounded-full ${isSpeaking ? 'bg-primary/30 animate-pulse' : 'bg-purple-500/20'}`} style={{ animationDelay: '0.5s' }} />
                </>
            )}

            {/* Main Avatar */}
            <div className={`relative z-10 rounded-full bg-dark-800 border-4 border-dark-900 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${sizeClasses[size]} ${isSpeaking ? 'shadow-primary/50 scale-105' : 'shadow-black/50'} ${isListening ? 'shadow-purple-500/30' : ''}`}>
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-black">
                    {/* Face */}
                    <div className="flex flex-col items-center gap-4 transition-transform duration-300">
                        {/* Eyes */}
                        <div className="flex gap-8">
                            <div className="w-4 h-8 bg-dark-900 rounded-full relative overflow-hidden">
                                <div className={`absolute w-full h-2/3 bg-white/90 rounded-full top-1 transition-all duration-300 ${isSpeaking ? 'scale-y-90' : 'scale-y-100'}`} />
                            </div>
                            <div className="w-4 h-8 bg-dark-900 rounded-full relative overflow-hidden">
                                <div className={`absolute w-full h-2/3 bg-white/90 rounded-full top-1 transition-all duration-300 ${isSpeaking ? 'scale-y-90' : 'scale-y-100'}`} />
                            </div>
                        </div>

                        {/* Mouth */}
                        <div className={`w-12 h-2 bg-slate-700/50 rounded-full transition-all duration-150 relative overflow-hidden ${isSpeaking ? 'h-6 scale-y-100 bg-primary/20' : 'scale-y-50'}`}>
                            {isSpeaking && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-white/20 rounded-full animate-pulse" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute -bottom-8 flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800/80 backdrop-blur border border-white/5 shadow-lg">
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className={`text-xs font-medium ${status.color}`}>
                    {status.text}
                </span>
            </div>
        </div>
    );
}
