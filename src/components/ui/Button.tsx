import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
    size?: 'xs' | 'sm' | 'md' | 'lg';
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
    const baseStyles = `
        relative inline-flex items-center justify-center font-semibold rounded-xl 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
        primary: `
            bg-gradient-to-r from-primary to-primary-500 hover:from-primary-hover hover:to-primary-600
            text-white shadow-soft hover:shadow-glow-primary focus:ring-primary
        `,
        secondary: `
            bg-surface-100 hover:bg-surface-200 text-neutral-700 
            border border-neutral-200 focus:ring-neutral-300
        `,
        ghost: `
            bg-transparent hover:bg-surface-100 text-neutral-600 hover:text-neutral-900 
            focus:ring-neutral-300
        `,
        danger: `
            bg-danger-light hover:bg-danger/20 text-danger-dark 
            border border-danger/20 focus:ring-danger
        `,
        soft: `
            bg-primary-50 hover:bg-primary-100 text-primary-700 
            focus:ring-primary/30
        `,
    };

    const sizes = {
        xs: 'px-2.5 py-1 text-xs gap-1',
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-8 py-4 text-base gap-3',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`.replace(/\s+/g, ' ').trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12" cy="12" r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </span>
            ) : null}
            <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </span>
        </button>
    );
}

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function IconButton({
    variant = 'ghost',
    size = 'md',
    children,
    className = '',
    ...props
}: IconButtonProps) {
    const baseStyles = `
        inline-flex items-center justify-center rounded-xl 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary',
        secondary: 'bg-surface-100 hover:bg-surface-200 text-neutral-600 focus:ring-neutral-300',
        ghost: 'bg-transparent hover:bg-surface-100 text-neutral-500 hover:text-neutral-700 focus:ring-neutral-300',
        danger: 'bg-danger-light hover:bg-danger/20 text-danger focus:ring-danger',
    };

    const sizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.replace(/\s+/g, ' ').trim()}
            {...props}
        >
            {children}
        </button>
    );
}
