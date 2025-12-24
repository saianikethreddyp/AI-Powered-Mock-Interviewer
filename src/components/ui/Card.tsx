import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'md',
}: CardProps) {
    const baseStyles = "relative overflow-hidden";

    const variants = {
        default: "bg-dark-800 border border-white/5 text-white",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-xl",
        gradient: "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 text-white",
    };

    const paddings = {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    const hoverEffects = hover
        ? "transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20"
        : "";

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverEffects} rounded-2xl ${className}`}
        >
            {children}
        </div>
    );
}
