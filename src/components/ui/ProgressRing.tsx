'use client';

import React from 'react';

interface ProgressRingProps {
    value: number; // 0-100
    size?: 'sm' | 'md' | 'lg' | 'xl';
    strokeWidth?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    showValue?: boolean;
    label?: string;
    className?: string;
}

const sizes = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 120,
};

const colors = {
    primary: {
        stroke: '#e11d48',
        bg: '#ffe4e6',
    },
    success: {
        stroke: '#10b981',
        bg: '#d1fae5',
    },
    warning: {
        stroke: '#f59e0b',
        bg: '#fef3c7',
    },
    danger: {
        stroke: '#ef4444',
        bg: '#fee2e2',
    },
};

export function ProgressRing({
    value,
    size = 'md',
    strokeWidth = 4,
    color = 'primary',
    showValue = true,
    label,
    className = '',
}: ProgressRingProps) {
    const sizeValue = sizes[size];
    const radius = (sizeValue - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    const colorSet = colors[color];

    return (
        <div className={`progress-ring ${className}`} style={{ width: sizeValue, height: sizeValue }}>
            <svg
                width={sizeValue}
                height={sizeValue}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    fill="none"
                    stroke={colorSet.bg}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    fill="none"
                    stroke={colorSet.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {(showValue || label) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {showValue && (
                        <span className="font-bold text-neutral-900" style={{ fontSize: sizeValue / 4 }}>
                            {value}%
                        </span>
                    )}
                    {label && (
                        <span className="text-neutral-500" style={{ fontSize: sizeValue / 6 }}>
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// Stat with mini progress bar
interface StatProgressProps {
    value: number;
    max?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

export function StatProgress({
    value,
    max = 100,
    color = 'primary',
    className = '',
}: StatProgressProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const colorSet = colors[color];

    return (
        <div className={`w-full h-2 rounded-full overflow-hidden ${className}`} style={{ background: colorSet.bg }}>
            <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                    width: `${percentage}%`,
                    background: colorSet.stroke,
                }}
            />
        </div>
    );
}
