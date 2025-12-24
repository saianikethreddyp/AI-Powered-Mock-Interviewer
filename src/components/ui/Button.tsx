import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 focus:ring-primary",
        secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 focus:ring-white/50",
        ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white focus:ring-white/50",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 focus:ring-red-500",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-5 py-2.5 text-base gap-2",
        lg: "px-8 py-4 text-lg gap-3",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </span>
            ) : null}
            <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </span>
        </button>
    );
}
