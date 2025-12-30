'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Sidebar } from '@/components/ui/Sidebar';
import { Avatar } from '@/components/ui/Avatar';
import { StatProgress } from '@/components/ui/ProgressRing';
import { Interview } from '@/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Plus,
    Sparkles,
    LogOut,
    Clock,
    BarChart3,
    CheckCircle,
    PlayCircle,
    TrendingUp,
    Target,
    Calendar,
    Zap,
    ArrowRight,
    Search,
    Bell,
    ChevronDown,
    ExternalLink,
    Mic,
    Award
} from 'lucide-react';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loadingInterviews, setLoadingInterviews] = useState(true);
    const [averageScore, setAverageScore] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('interviews')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (!error && data) setInterviews(data);
            } catch (err) {
                console.error('Error fetching interviews:', err);
            } finally {
                setLoadingInterviews(false);
            }
        };
        if (user) fetchInterviews();
    }, [user]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user || interviews.length === 0) return;

            const completedIds = interviews
                .filter(i => i.status === 'completed')
                .map(i => i.id);

            if (completedIds.length === 0) return;

            try {
                const { data, error } = await supabase
                    .from('analysis')
                    .select('interview_id, overall_score, created_at')
                    .in('interview_id', completedIds)
                    .order('created_at', { ascending: true });

                if (!error && data && data.length > 0) {
                    // Calc average
                    const totalScore = data.reduce((sum, a) => sum + (a.overall_score || 0), 0);
                    setAverageScore(Math.round(totalScore / data.length));

                    // Prep chart data
                    const formattedChartData = data.map((item, index) => ({
                        name: `Interview ${index + 1}`,
                        score: item.overall_score,
                        date: new Date(item.created_at).toLocaleDateString(),
                    }));
                    setChartData(formattedChartData);
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
            }
        };
        fetchAnalytics();
    }, [user, interviews]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const inProgressInterviews = interviews.filter(i => i.status === 'in_progress');

    const stats = [
        {
            icon: <Target size={24} />,
            label: 'Total Interviews',
            value: interviews.length,
            color: 'primary' as const,
            change: interviews.length > 0 ? { value: interviews.length, type: 'increase' as const } : undefined
        },
        {
            icon: <CheckCircle size={24} />,
            label: 'Completed',
            value: completedInterviews.length,
            color: 'success' as const
        },
        {
            icon: <TrendingUp size={24} />,
            label: 'Avg Score',
            value: averageScore > 0 ? `${averageScore}%` : '-',
            color: 'warning' as const
        },
        {
            icon: <Award size={24} />,
            label: 'Best Score',
            value: chartData.length > 0 ? `${Math.max(...chartData.map(d => d.score))}%` : '-',
            color: 'success' as const
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'badge-success',
            in_progress: 'badge-warning',
            setup: 'badge-primary',
        };
        return styles[status] || 'badge bg-neutral-100 text-neutral-600';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const ChartData = chartData;

    return (
        <div className="min-h-screen bg-surface-50 text-neutral-900 font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-[280px]">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
                    <div className="px-8 h-16 flex items-center justify-between">
                        {/* Search */}
                        <div className="relative w-80">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Try searching 'insights'"
                                className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-xl hover:bg-surface-100 transition-colors">
                                <Bell size={20} className="text-neutral-500" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                            </button>

                            {/* User Menu */}
                            <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-100 transition-colors">
                                <Avatar
                                    name={user.user_metadata?.full_name || user.email || ''}
                                    size="sm"
                                />
                                <span className="text-sm font-medium text-neutral-700">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                                </span>
                                <ChevronDown size={16} className="text-neutral-400" />
                            </button>

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-xl hover:bg-danger-light text-neutral-500 hover:text-danger transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {/* Welcome Section */}
                    <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 animate-enter">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold font-heading text-neutral-900 mb-2">
                                Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
                            </h1>
                            <p className="text-neutral-500">Ready to practice your next interview?</p>
                        </div>
                        <Link href="/interview/setup">
                            <Button size="lg" variant="primary">
                                <Plus size={20} />
                                New Interview
                            </Button>
                        </Link>
                    </section>

                    {/* Charts & Stats Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Stats Grid */}
                        <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={stat.value}
                                    color={stat.color}
                                    change={stat.change}
                                />
                            ))}
                        </div>

                        {/* Chart */}
                        <Card variant="default" padding="lg" className="lg:col-span-2 min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-neutral-900">Performance Trend</h2>
                                <select className="text-sm border-none bg-surface-100 rounded-lg px-3 py-1 font-medium text-neutral-600 focus:ring-0">
                                    <option>Last 7 Days</option>
                                    <option>Last Month</option>
                                </select>
                            </div>
                            {ChartData.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={ChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#737373', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#737373', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#e11d48"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center text-neutral-400">
                                    <BarChart3 size={48} className="mb-4 opacity-20" />
                                    <p>Complete interviews to see your progress trend</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                <Zap size={20} className="text-warning" />
                                Quick Start
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link href="/interview/setup" className="group block">
                                <Card variant="interactive" padding="lg" className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <PlayCircle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                                                Mock Interview
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Simulate a real interview environment.
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className="text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/interview/setup" className="group block">
                                <Card variant="interactive" padding="lg" className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                            <Mic size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-neutral-900 mb-1 group-hover:text-secondary transition-colors">
                                                Technical Deep-Dive
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Focus on system design and coding.
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className="text-neutral-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/interview/setup" className="group block">
                                <Card variant="interactive" padding="lg" className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-neutral-900 mb-1 group-hover:text-success transition-colors">
                                                Behavioral Check
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Refine your soft skills and culture fit.
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className="text-neutral-300 group-hover:text-success group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </section>

                    {/* Recent Interviews */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                <Clock size={20} className="text-neutral-400" />
                                Recent Interviews
                            </h2>
                            {interviews.length > 0 && (
                                <Button variant="ghost" size="sm">
                                    View All
                                    <ArrowRight size={16} />
                                </Button>
                            )}
                        </div>

                        {loadingInterviews ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-white rounded-2xl border border-neutral-200 shimmer" />
                                ))}
                            </div>
                        ) : interviews.length === 0 ? (
                            <Card variant="default" padding="lg" className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                                    <Calendar size={32} className="text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No interviews yet</h3>
                                <p className="text-neutral-500 mb-6">Start your first practice interview to improve your skills.</p>
                                <Link href="/interview/setup">
                                    <Button variant="primary">
                                        <Plus size={18} />
                                        Start Your First Interview
                                    </Button>
                                </Link>
                            </Card>
                        ) : (
                            <Card variant="default" padding="none" className="overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-50 border-b border-neutral-100 text-sm font-medium text-neutral-500">
                                    <div className="col-span-4">Interview</div>
                                    <div className="col-span-2">Level</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2">Score</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-neutral-100">
                                    {interviews.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-50 transition-colors group cursor-pointer"
                                            onClick={() => router.push(interview.status === 'completed' ? `/interview/${interview.id}/results` : `/interview/${interview.id}`)}
                                        >
                                            {/* Interview Info */}
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                                                    <Mic size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
                                                        {interview.job_role}
                                                    </h4>
                                                    <p className="text-sm text-neutral-500 truncate">
                                                        {interview.focus_area || 'General Practice'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Level */}
                                            <div className="col-span-2">
                                                <span className="px-2 py-1 rounded-md bg-surface-200 text-xs font-medium text-neutral-600">
                                                    {interview.experience_level || 'Mid Level'}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2 text-sm text-neutral-600">
                                                {formatDate(interview.created_at)}
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2">
                                                <span className={getStatusBadge(interview.status)}>
                                                    {interview.status.replace('_', ' ').charAt(0).toUpperCase() + interview.status.replace('_', ' ').slice(1)}
                                                </span>
                                            </div>

                                            {/* Score */}
                                            <div className="col-span-2">
                                                {interview.status === 'completed' ? (
                                                    <div className="flex items-center gap-2">
                                                        <StatProgress
                                                            value={75} // We need to fetch individual scores properly in a real app, mock for list
                                                            color="success"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium text-neutral-700">
                                                            View
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-neutral-400">-</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
