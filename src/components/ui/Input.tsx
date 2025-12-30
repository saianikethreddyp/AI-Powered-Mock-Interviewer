import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    variant?: 'light' | 'dark';
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    variant?: 'light' | 'dark';
}

export function Input({
    label,
    error,
    icon,
    variant = 'light',
    className = '',
    ...props
}: InputProps) {
    const baseInput = variant === 'light'
        ? 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-primary/20 focus:border-primary'
        : 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:ring-primary/50 focus:border-primary';

    const labelColor = variant === 'light' ? 'text-neutral-700' : 'text-neutral-300';

    return (
        <div className="w-full space-y-2">
            {label && <label className={`block text-sm font-medium ${labelColor}`}>{label}</label>}
            <div className="relative">
                {icon && (
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {icon}
                    </span>
                )}
                <input
                    className={`
                        w-full border rounded-xl px-4 py-3 
                        focus:outline-none focus:ring-2 transition-all
                        ${baseInput}
                        ${icon ? 'pl-11' : ''} 
                        ${error ? 'border-danger focus:ring-danger/20' : ''} 
                        ${className}
                    `.replace(/\s+/g, ' ').trim()}
                    {...props}
                />
            </div>
            {error && <span className="text-sm text-danger">{error}</span>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    variant = 'light',
    className = '',
    ...props
}: TextareaProps) {
    const baseTextarea = variant === 'light'
        ? 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-primary/20 focus:border-primary'
        : 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:ring-primary/50 focus:border-primary';

    const labelColor = variant === 'light' ? 'text-neutral-700' : 'text-neutral-300';

    return (
        <div className="w-full space-y-2">
            {label && <label className={`block text-sm font-medium ${labelColor}`}>{label}</label>}
            <textarea
                className={`
                    w-full border rounded-xl px-4 py-3 
                    focus:outline-none focus:ring-2 transition-all 
                    min-h-[120px] resize-none
                    ${baseTextarea}
                    ${error ? 'border-danger focus:ring-danger/20' : ''} 
                    ${className}
                `.replace(/\s+/g, ' ').trim()}
                {...props}
            />
            {error && <span className="text-sm text-danger">{error}</span>}
        </div>
    );
}

// Select component for dropdowns
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    variant?: 'light' | 'dark';
    options: Array<{ value: string; label: string }>;
}

export function Select({
    label,
    error,
    variant = 'light',
    options,
    className = '',
    ...props
}: SelectProps) {
    const baseSelect = variant === 'light'
        ? 'bg-white border-neutral-200 text-neutral-900 focus:ring-primary/20 focus:border-primary'
        : 'bg-white/5 border-white/10 text-white focus:ring-primary/50 focus:border-primary';

    const labelColor = variant === 'light' ? 'text-neutral-700' : 'text-neutral-300';

    return (
        <div className="w-full space-y-2">
            {label && <label className={`block text-sm font-medium ${labelColor}`}>{label}</label>}
            <select
                className={`
                    w-full border rounded-xl px-4 py-3 
                    focus:outline-none focus:ring-2 transition-all
                    appearance-none cursor-pointer
                    ${baseSelect}
                    ${error ? 'border-danger focus:ring-danger/20' : ''} 
                    ${className}
                `.replace(/\s+/g, ' ').trim()}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-sm text-danger">{error}</span>}
        </div>
    );
}
