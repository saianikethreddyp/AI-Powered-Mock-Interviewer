'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Interview } from '@/types';
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
    ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loadingInterviews, setLoadingInterviews] = useState(true);
    const [averageScore, setAverageScore] = useState<number>(0);

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

    // Fetch actual average scores from completed interviews
    useEffect(() => {
        const fetchAverageScore = async () => {
            if (!user || interviews.length === 0) return;

            const completedIds = interviews
                .filter(i => i.status === 'completed')
                .map(i => i.id);

            if (completedIds.length === 0) return;

            try {
                const { data, error } = await supabase
                    .from('analysis')
                    .select('overall_score')
                    .in('interview_id', completedIds);

                if (!error && data && data.length > 0) {
                    const totalScore = data.reduce((sum, a) => sum + (a.overall_score || 0), 0);
                    setAverageScore(Math.round(totalScore / data.length));
                }
            } catch (err) {
                console.error('Error fetching average score:', err);
            }
        };
        fetchAverageScore();
    }, [user, interviews]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const completedInterviews = interviews.filter(i => i.status === 'completed');

    const stats = [
        { icon: <Target size={24} />, label: 'Total Interviews', value: interviews.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { icon: <CheckCircle size={24} />, label: 'Completed', value: completedInterviews.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { icon: <TrendingUp size={24} />, label: 'Avg Score', value: averageScore > 0 ? `${averageScore}%` : '-', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            setup: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        };
        return styles[status as keyof typeof styles] || 'bg-slate-800 text-slate-400';
    };

    return (
        <div className="min-h-screen bg-dark-900 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
                        <Sparkles size={24} className="text-primary" />
                        <span>InterviewAI</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-slate-400 font-medium hidden sm:block">
                            {user.user_metadata?.full_name || user.email}
                        </span>
                        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-enter">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
                        </h1>
                        <p className="text-slate-400 text-lg">Ready to practice your next interview?</p>
                    </div>
                    <Link href="/interview/setup">
                        <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            <Plus size={20} />
                            New Interview
                        </Button>
                    </Link>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="glass-card p-6 rounded-2xl flex items-center gap-5 transition-transform hover:-translate-y-1">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white font-heading leading-tight">{stat.value}</div>
                                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Quick Actions */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-amber-400" />
                        Quick Start
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link href="/interview/setup" className="group block">
                            <div className="relative overflow-hidden rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent hover:from-primary/50 transition-colors">
                                <div className="relative bg-dark-800/80 backdrop-blur-xl p-6 rounded-[15px] h-full group-hover:bg-dark-800/60 transition-colors">
                                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <PlayCircle size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">Start Practice Interview</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">Begin a new voice-based mock interview sessions with real-time feedback.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Recent Interviews */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        Recent Interviews
                    </h2>
                    {loadingInterviews ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : interviews.length === 0 ? (
                        <div className="glass-card p-12 rounded-2xl text-center">
                            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No interviews yet</h3>
                            <p className="text-slate-400 mb-6">Start your first practice interview to improve your skills</p>
                            <Link href="/interview/setup">
                                <Button>Start Your First Interview</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {interviews.map((interview) => (
                                <div key={interview.id} className="group glass-card p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white/10 hover:border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                            <BarChart3 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{interview.job_role}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(interview.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(interview.status)}`}>
                                            {interview.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        {interview.status === 'completed' && (
                                            <Link href={`/interview/${interview.id}/results`}>
                                                <Button variant="ghost" size="sm" className="hidden md:flex">
                                                    View Results
                                                    <ArrowRight size={16} />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
