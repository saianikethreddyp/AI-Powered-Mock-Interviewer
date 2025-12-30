import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'stat' | 'interactive';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    accentColor?: 'primary' | 'success' | 'warning' | 'danger' | 'none';
}

const accentColors = {
    primary: 'before:bg-primary',
    success: 'before:bg-success',
    warning: 'before:bg-warning',
    danger: 'before:bg-danger',
    none: '',
};

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'md',
    accentColor = 'none',
}: CardProps) {
    const baseStyles = 'relative overflow-hidden rounded-2xl';

    const variants = {
        default: 'bg-white border border-neutral-200 shadow-card',
        glass: 'bg-white/70 backdrop-blur-xl border border-neutral-200/50 shadow-card',
        gradient: 'bg-gradient-to-br from-white to-surface-50 border border-neutral-200 shadow-card',
        stat: 'bg-white border border-neutral-200 shadow-card',
        interactive: 'bg-white border border-neutral-200 shadow-card cursor-pointer',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    const hoverEffects = hover || variant === 'interactive'
        ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20'
        : '';

    // Add accent stripe for stat cards
    const accentClass = (variant === 'stat' && accentColor !== 'none')
        ? `before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:rounded-l-2xl ${accentColors[accentColor]}`
        : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverEffects} ${accentClass} ${className}`}
        >
            {children}
        </div>
    );
}

// Stat Card component for dashboard metrics
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease';
    };
    color?: 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

const iconColors = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
};

export function StatCard({
    icon,
    label,
    value,
    change,
    color = 'primary',
    className = '',
}: StatCardProps) {
    return (
        <Card variant="stat" accentColor={color} className={className}>
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-neutral-900 font-heading">
                            {value}
                        </span>
                        {change && (
                            <span className={`text-sm font-semibold ${change.type === 'increase' ? 'text-success' : 'text-danger'
                                }`}>
                                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Feature Card for landing page
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}

export function FeatureCard({
    icon,
    title,
    description,
    className = '',
}: FeatureCardProps) {
    return (
        <Card variant="interactive" padding="lg" className={className}>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-5 transition-transform group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
        </Card>
    );
}
