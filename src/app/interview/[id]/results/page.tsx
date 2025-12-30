'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Sidebar } from '@/components/ui/Sidebar';
import { ProgressRing, StatProgress } from '@/components/ui/ProgressRing';
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
    Sparkles,
    BarChart3
} from 'lucide-react';

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
            <div className="min-h-screen flex items-center justify-center bg-surface-50 flex-col gap-4">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-neutral-500">Loading your results...</p>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    if (error || !interview) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-6">
                    <AlertCircle size={32} className="text-danger" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Results Not Found</h2>
                <p className="text-neutral-500 mb-6">{error || 'Interview results not available'}</p>
                <Link href="/dashboard">
                    <Button variant="primary">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // Success
        if (score >= 60) return '#f59e0b'; // Warning
        return '#ef4444'; // Danger
    };

    const getScoreVariant = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    const getRecommendationColor = (rec: string) => {
        if (rec === 'Strong Hire') return 'text-success bg-success-light border-success/20';
        if (rec === 'Hire') return 'text-primary bg-primary-50 border-primary/20';
        if (rec === 'Maybe') return 'text-warning bg-warning-light border-warning/20';
        return 'text-danger bg-danger-light border-danger/20';
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
        <div className="min-h-screen bg-surface-50 text-neutral-900 font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-[280px]">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
                    <div className="px-8 h-16 flex items-center justify-between">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                <Share2 size={16} />
                                Share
                            </Button>
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                <Download size={16} />
                                Export
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto space-y-8 animate-enter">
                    {/* Title Section */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold font-heading text-neutral-900">Result Analysis</h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-surface-200 text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                                    {interview.status === 'completed' ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                            <p className="text-lg text-primary font-medium">{interview.job_role}</p>
                            <p className="text-sm text-neutral-500 mt-1">
                                Completed on {new Date(interview.completed_at || interview.created_at).toLocaleDateString('en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <Link href="/interview/setup">
                                <Button variant="primary">
                                    <RotateCcw size={18} />
                                    Practice Again
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Overall Score Card */}
                    <Card variant="default" padding="xl" className="relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center relative z-10">
                            {/* Score Circle */}
                            <div className="flex flex-col items-center justify-center">
                                <ProgressRing
                                    value={displayAnalysis.overall_score}
                                    size="xl"
                                    color={getScoreVariant(displayAnalysis.overall_score)}
                                />
                                <div className="mt-4 text-center">
                                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Overall Score</span>
                                </div>
                            </div>

                            {/* Recommendation & Summary */}
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                        {!analysis ? 'Analyzing Interview...' : 'Performance Summary'}
                                    </h2>
                                    {!analysis ? (
                                        <p className="text-neutral-500 animate-pulse">
                                            Generating detailed feedback... (~10s)
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className={`px-4 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-wider ${getRecommendationColor(displayAnalysis.hiring_recommendation)}`}>
                                                {displayAnalysis.hiring_recommendation}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-neutral-600 leading-relaxed text-lg">
                                        {!analysis
                                            ? "Our AI represents your conversation and generates detailed feedback. "
                                            : displayAnalysis.hiring_recommendation === 'Strong Hire'
                                                ? "Excellent work! You demonstrated strong capability across key areas. Your responses were clear, structured, and showed great depth."
                                                : displayAnalysis.hiring_recommendation === 'Hire'
                                                    ? "Great job. You showed solid skills and good communication, though there are a few specific areas where you could be more concise."
                                                    : "Good effort. Focus on the improvement areas highlighted below to reach the next level in your interview performance."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Category Scores Grid */}
                    <section>
                        <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-primary" />
                            Category Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => {
                                const score = displayAnalysis.category_scores?.[cat.key as keyof typeof displayAnalysis.category_scores] || 0;
                                return (
                                    <Card key={cat.key} variant="default" padding="md" className="group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-neutral-500 group-hover:text-primary transition-colors">
                                                    {cat.icon}
                                                </div>
                                                <span className="font-medium text-neutral-700">{cat.label}</span>
                                            </div>
                                            <span className="font-bold text-neutral-900">{score}%</span>
                                        </div>
                                        <StatProgress
                                            value={score}
                                            color={getScoreVariant(score)}
                                            className="h-2"
                                        />
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Detailed Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <Card variant="default" padding="lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center text-success">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Key Strengths</h3>
                            </div>
                            <ul className="space-y-4">
                                {displayAnalysis.strengths?.map((strength: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />
                                        <span className="text-neutral-600">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Improvements */}
                        <Card variant="default" padding="lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center text-danger">
                                    <TrendingDown size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Areas for Improvement</h3>
                            </div>
                            <ul className="space-y-4">
                                {displayAnalysis.areas_for_improvement?.map((area: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
                                        <span className="text-neutral-600">{area}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* AI Feedback */}
                    <Card variant="default" padding="lg" className="border-l-4 border-l-primary">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={20} className="text-primary" />
                            <h3 className="text-lg font-bold text-neutral-900">AI Interviewer Feedback</h3>
                        </div>
                        <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                            {displayAnalysis.detailed_feedback}
                        </p>
                    </Card>

                    {/* Tips */}
                    {displayAnalysis.interview_tips && displayAnalysis.interview_tips.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Lightbulb size={20} className="text-warning" />
                                Tips for Next Time
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayAnalysis.interview_tips.map((tip: string, i: number) => (
                                    <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex gap-4">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-warning-light text-warning-dark text-xs font-bold shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-neutral-600 text-sm font-medium">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
