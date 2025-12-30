import React from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showStatus?: boolean;
    status?: 'online' | 'offline' | 'busy';
}

const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

const statusColors = {
    online: 'bg-success',
    offline: 'bg-neutral-400',
    busy: 'bg-danger',
};

const statusSizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getColorFromName(name: string): string {
    const colors = [
        'bg-primary-100 text-primary-700',
        'bg-secondary/20 text-secondary',
        'bg-success-light text-success-dark',
        'bg-warning-light text-warning-dark',
        'bg-blue-100 text-blue-700',
        'bg-purple-100 text-purple-700',
        'bg-pink-100 text-pink-700',
        'bg-orange-100 text-orange-700',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
    src,
    alt,
    name = '',
    size = 'md',
    className = '',
    showStatus = false,
    status = 'online',
}: AvatarProps) {
    const initials = name ? getInitials(name) : '?';
    const colorClass = name ? getColorFromName(name) : 'bg-surface-200 text-neutral-600';

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold`}
                >
                    {initials}
                </div>
            )}

            {showStatus && (
                <span
                    className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full border-white`}
                />
            )}
        </div>
    );
}

// Avatar Group component for showing multiple avatars
interface AvatarGroupProps {
    avatars: Array<{ src?: string; name?: string }>;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AvatarGroup({
    avatars,
    max = 4,
    size = 'md',
    className = '',
}: AvatarGroupProps) {
    const visible = avatars.slice(0, max);
    const remaining = avatars.length - max;

    const overlapClasses = {
        sm: '-ml-2',
        md: '-ml-3',
        lg: '-ml-4',
    };

    return (
        <div className={`flex items-center ${className}`}>
            {visible.map((avatar, index) => (
                <div
                    key={index}
                    className={`${index > 0 ? overlapClasses[size] : ''} ring-2 ring-white rounded-full`}
                >
                    <Avatar
                        src={avatar.src}
                        name={avatar.name}
                        size={size}
                    />
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className={`${overlapClasses[size]} flex items-center justify-center ${sizeClasses[size]} bg-surface-200 text-neutral-600 font-semibold rounded-full ring-2 ring-white`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
