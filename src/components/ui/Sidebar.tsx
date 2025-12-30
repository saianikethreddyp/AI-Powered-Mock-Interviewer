'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Mic,
    BarChart3,
    Settings,
    HelpCircle,
    ChevronDown,
    Star,
    Clock,
    FileText,
    Sparkles,
    Plus
} from 'lucide-react';

interface SidebarProps {
    className?: string;
}

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
}

export function Sidebar({ className = '' }: SidebarProps) {
    const pathname = usePathname();

    const mainNav: NavItem[] = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard' },
        { icon: <Mic size={20} />, label: 'Interviews', href: '/interview/setup' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/analytics' },
    ];

    const secondaryNav: NavItem[] = [
        { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
        { icon: <HelpCircle size={20} />, label: 'Help', href: '/help' },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <aside className={`sidebar ${className}`}>
            {/* Logo */}
            <div className="p-6 border-b border-neutral-100">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <span className="font-heading font-bold text-xl text-neutral-900">InterviewAI</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Primary Nav */}
                <div className="space-y-1">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item'}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-4 divider" />

                {/* Quick Access */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <Star size={14} />
                        <span>Starred</span>
                        <ChevronDown size={14} className="ml-auto" />
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <Clock size={14} />
                        <span>Recent</span>
                        <ChevronDown size={14} className="ml-auto" />
                    </button>
                </div>

                {/* Divider */}
                <div className="my-4 divider" />

                {/* Reports Section */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <FileText size={14} />
                        <span>My Reports</span>
                        <ChevronDown size={14} className="ml-auto" />
                    </button>
                </div>
            </nav>

            {/* New Interview CTA */}
            <div className="p-4 border-t border-neutral-100">
                <Link
                    href="/interview/setup"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-primary text-white font-semibold rounded-xl shadow-soft hover:shadow-glow-primary transition-all duration-200"
                >
                    <Plus size={20} />
                    <span>New Interview</span>
                </Link>
            </div>

            {/* Secondary Nav */}
            <div className="p-4 border-t border-neutral-100 space-y-1">
                {secondaryNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item'}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
