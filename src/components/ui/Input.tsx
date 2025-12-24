import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Input({
    label,
    error,
    icon,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="w-full space-y-2">
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
            <div className="relative">
                {icon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}
                <input
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${icon ? 'pl-11' : ''
                        } ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    className = '',
    ...props
}: TextareaProps) {
    return (
        <div className="w-full space-y-2">
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
            <textarea
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[120px] resize-none ${error ? 'border-red-500 focus:ring-red-500/50' : ''
                    } ${className}`}
                {...props}
            />
            {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
    );
}
