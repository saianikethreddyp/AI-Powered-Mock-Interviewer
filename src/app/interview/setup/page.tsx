'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Upload,
    Sparkles,
    CheckCircle,
    Mic
} from 'lucide-react';
import styles from './page.module.css';

export default function InterviewSetupPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [jobRole, setJobRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [questionCount, setQuestionCount] = useState(8);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'text/plain') {
            const text = await file.text();
            setResumeText(text);
        } else if (file.type === 'application/pdf') {
            setResumeText(`[Resume uploaded: ${file.name}]\n\nPlease also paste your resume text below for better results.`);
        } else {
            setError('Please upload a text or PDF file');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setIsSubmitting(true);

        try {
            const { data: interview, error: dbError } = await supabase
                .from('interviews')
                .insert({
                    user_id: user.id,
                    job_role: jobRole,
                    job_description: jobDescription,
                    resume_text: resumeText,
                    question_count: questionCount,
                    status: 'setup',
                })
                .select()
                .single();

            if (dbError) {
                console.error('Supabase error:', dbError.message, dbError.code);
                if (dbError.code === '42P01' || dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
                    setError('Database tables not found. Please run supabase-schema.sql in your Supabase SQL Editor first.');
                } else {
                    setError(`Database error: ${dbError.message || 'Unknown error'}`);
                }
                return;
            }

            router.push(`/interview/${interview.id}`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error creating interview:', errorMessage);
            setError(`Failed to create interview: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 pb-20 relative text-slate-200 font-sans">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <header className="px-6 py-6 max-w-4xl mx-auto relative z-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
            </header>

            <main className="max-w-3xl mx-auto px-6 relative z-10">
                <div className="text-center mb-10 animate-enter">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-lg shadow-primary/20">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Set Up Your Interview</h1>
                    <p className="text-slate-400 text-lg">Tell us about the position you&apos;re preparing for</p>
                </div>

                <Card variant="glass" padding="lg" className="border-white/10 shadow-xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                                <span className="mt-0.5 block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Input
                            label="Job Role / Title"
                            placeholder="e.g., Senior Software Engineer"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            icon={<Briefcase size={18} />}
                            required
                        />

                        <Textarea
                            label="Job Description"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                            className="min-h-[150px]"
                        />

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-300">Resume / CV</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".txt,.pdf"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="resume-upload"
                                />
                                <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center transition-all group-hover:bg-white/10 group-hover:border-primary/50">
                                    <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform group-hover:text-primary">
                                        <Upload size={24} />
                                    </div>
                                    <span className="text-white font-medium mb-1">Click to upload or drag and drop</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">TXT or PDF</span>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            label="Resume Text (Optional)"
                            placeholder="Paste your resume text here for better personalization..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[100px]"
                        />

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-300">Number of Questions</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[5, 8, 10, 15].map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        className={`py-2 px-4 rounded-lg font-medium transition-all ${questionCount === count
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                        onClick={() => setQuestionCount(count)}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>Voice-based conversation</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>AI-generated questions</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>Detailed report</span>
                            </div>
                        </div>

                        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-8">
                            <Mic size={20} />
                            Start Interview
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
}
