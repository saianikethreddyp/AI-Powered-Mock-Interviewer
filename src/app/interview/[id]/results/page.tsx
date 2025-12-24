'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Interview, InterviewAnalysis } from '@/types';
import {
    ArrowLeft,
    Award,
    TrendingUp,
    TrendingDown,
    Target,
    MessageSquare,
    Lightbulb,
    CheckCircle,
    AlertCircle,
    Download,
    Share2,
    RotateCcw,
    Home,
} from 'lucide-react';
import styles from './page.module.css';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout;

        const fetchData = async () => {
            if (!id) return;

            try {
                // Fetch interview details (only once)
                if (!interview) {
                    const { data: interviewData, error: interviewError } = await supabase
                        .from('interviews')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (interviewError) throw interviewError;
                    if (isMounted) setInterview(interviewData);
                }

                // Fetch analysis
                const fetchAnalysis = async () => {
                    const { data: analysisData, error: analysisError } = await supabase
                        .from('analysis')
                        .select('*')
                        .eq('interview_id', id)
                        .single();

                    if (!analysisError && analysisData) {
                        if (isMounted) {
                            setAnalysis(analysisData);
                            setLoading(false);
                            return true; // Found it
                        }
                    }
                    return false; // Not found
                };

                const found = await fetchAnalysis();

                if (!found) {
                    // Start polling if not found
                    setLoading(false); // Show the pending state
                    pollInterval = setInterval(async () => {
                        const success = await fetchAnalysis();
                        if (success) {
                            clearInterval(pollInterval);
                        }
                    }, 3000); // Check every 3 seconds
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                if (isMounted) setError('Failed to load results');
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [id, interview]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900 flex-col gap-4">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Loading your results...</p>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    if (error || !interview) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-center p-6">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Results Not Found</h2>
                <p className="text-slate-400 mb-6">{error || 'Interview results not available'}</p>
                <Link href="/dashboard">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getRecommendationColor = (rec: string) => {
        if (rec === 'Strong Hire') return '#22c55e';
        if (rec === 'Hire') return '#10b981';
        if (rec === 'Maybe') return '#f59e0b';
        return '#ef4444';
    };

    // Use mock data if no analysis exists yet
    const displayAnalysis = analysis || {
        overall_score: 0,
        category_scores: {
            communication: 0,
            technicalKnowledge: 0,
            problemSolving: 0,
            cultureFit: 0,
            confidence: 0,
            relevantExperience: 0,
        },
        strengths: ['Analysis pending...'],
        areas_for_improvement: ['Analysis pending...'],
        detailed_feedback: 'Your interview analysis is being processed. Please check back shortly.',
        hiring_recommendation: 'Pending',
        interview_tips: ['Keep practicing!'],
    };

    const categories = [
        { key: 'communication', label: 'Communication', icon: <MessageSquare size={18} /> },
        { key: 'technicalKnowledge', label: 'Technical Knowledge', icon: <Target size={18} /> },
        { key: 'problemSolving', label: 'Problem Solving', icon: <Lightbulb size={18} /> },
        { key: 'cultureFit', label: 'Culture Fit', icon: <CheckCircle size={18} /> },
        { key: 'confidence', label: 'Confidence', icon: <TrendingUp size={18} /> },
        { key: 'relevantExperience', label: 'Relevant Experience', icon: <Award size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-dark-900 pb-20 text-slate-200">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
                <Link href="/interview/setup">
                    <Button variant="secondary" size="sm">
                        <RotateCcw size={16} />
                        New Interview
                    </Button>
                </Link>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 relative z-10 space-y-8 animate-enter">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Interview Results</h1>
                    <p className="text-xl text-primary font-medium mb-1">{interview.job_role}</p>
                    <p className="text-sm text-slate-500">
                        Completed on {new Date(interview.completed_at || interview.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Overall Score */}
                <Card variant="gradient" padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                        {(!analysis) ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                            </div>
                        ) : (
                            <>
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" className="text-white/10 fill-none" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        strokeWidth="8"
                                        className="fill-none transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                        style={{
                                            strokeDasharray: `${displayAnalysis.overall_score * 2.83} 283`,
                                            stroke: getScoreColor(displayAnalysis.overall_score),
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-4xl font-bold text-white font-heading">{displayAnalysis.overall_score}</span>
                                    <span className="text-sm font-medium text-slate-300">/ 100</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {(!analysis) ? 'Analyzing Interview...' : 'Overall Performance'}
                        </h2>
                        {(!analysis) ? (
                            <div className="space-y-2">
                                <p className="text-slate-300 leading-relaxed max-w-xl animate-pulse">
                                    Our AI represents your conversation and generates detailed feedback.
                                    This usually takes about 10-20 seconds.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="inline-block px-6 py-3 rounded-xl border font-bold text-lg"
                                    style={{
                                        backgroundColor: `${getRecommendationColor(displayAnalysis.hiring_recommendation)}15`,
                                        borderColor: `${getRecommendationColor(displayAnalysis.hiring_recommendation)}30`,
                                        color: getRecommendationColor(displayAnalysis.hiring_recommendation)
                                    }}>
                                    {displayAnalysis.hiring_recommendation.toUpperCase()}
                                </div>
                                <p className="mt-4 text-slate-300 leading-relaxed max-w-xl">
                                    {displayAnalysis.hiring_recommendation === 'Strong Hire'
                                        ? "Excellent work! You demonstrated strong capability across all key areas."
                                        : displayAnalysis.hiring_recommendation === 'Hire'
                                            ? "Great job. You showed solid skills, though there are a few areas for polish."
                                            : "Good effort. Focus on the improvement areas highlighted below to reach the next level."}
                                </p>
                            </>
                        )}
                    </div>
                </Card>

                {/* Category Scores */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Target size={20} className="text-slate-400" />
                        Performance by Category
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => {
                            const score = displayAnalysis.category_scores?.[cat.key as keyof typeof displayAnalysis.category_scores] || 0;
                            return (
                                <Card key={cat.key} variant="glass" padding="md" className="flex flex-col gap-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                                                {cat.icon}
                                            </div>
                                            <span className="font-medium text-white">{cat.label}</span>
                                        </div>
                                        <span className="font-bold" style={{ color: getScoreColor(score) }}>{score}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${score}%`,
                                                backgroundColor: getScoreColor(score),
                                            }}
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Strengths</h3>
                        </div>
                        <ul className="space-y-4">
                            {displayAnalysis.strengths?.map((strength: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                <TrendingDown size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Areas for Improvement</h3>
                        </div>
                        <ul className="space-y-4">
                            {displayAnalysis.areas_for_improvement?.map((area: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                    <span>{area}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Detailed Feedback */}
                <Card variant="glass" padding="lg">
                    <h3 className="text-lg font-bold text-white mb-4">Detailed Feedback</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{displayAnalysis.detailed_feedback}</p>
                </Card>

                {/* Tips */}
                {displayAnalysis.interview_tips && displayAnalysis.interview_tips.length > 0 && (
                    <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <Lightbulb size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Tips for Next Time</h3>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayAnalysis.interview_tips.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl text-slate-300">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link href="/interview/setup" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto">
                            <RotateCcw size={20} />
                            Practice Again
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            <Home size={20} />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
