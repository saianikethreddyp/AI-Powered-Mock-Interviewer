'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Sidebar } from '@/components/ui/Sidebar';
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Upload,
    Sparkles,
    CheckCircle,
    Mic,
    Clock,
    Target,
    BarChart3
} from 'lucide-react';

export default function InterviewSetupPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [jobRole, setJobRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [questionCount, setQuestionCount] = useState(8);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [uploadedFile, setUploadedFile] = useState<string>('');

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
            setUploadedFile(file.name);
        } else if (file.type === 'application/pdf') {
            setResumeText(`[Resume uploaded: ${file.name}]\n\nPlease also paste your resume text below for better results.`);
            setUploadedFile(file.name);
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
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-500">Loading...</p>
                </div>
            </div>
        );
    }

    const features = [
        { icon: <Mic size={18} />, text: 'Voice-based conversation' },
        { icon: <Target size={18} />, text: 'AI-generated questions' },
        { icon: <BarChart3 size={18} />, text: 'Detailed analysis report' },
    ];

    return (
        <div className="min-h-screen bg-surface-50 text-neutral-900 font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-[280px]">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
                    <div className="px-8 h-16 flex items-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 max-w-4xl">
                    {/* Page Header */}
                    <div className="mb-8 animate-enter">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold font-heading text-neutral-900">
                                    Set Up Your Interview
                                </h1>
                                <p className="text-neutral-500">Tell us about the position you&apos;re preparing for</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <Card variant="default" padding="lg">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 rounded-xl bg-danger-light border border-danger/20 text-danger text-sm flex items-start gap-3">
                                            <span className="mt-0.5 block w-2 h-2 rounded-full bg-danger shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <Input
                                        label="Job Role / Title"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        icon={<Briefcase size={18} />}
                                        variant="light"
                                        required
                                    />

                                    <Textarea
                                        label="Job Description"
                                        placeholder="Paste the job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        variant="light"
                                        required
                                        className="min-h-[150px]"
                                    />

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-neutral-700">Resume / CV</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".txt,.pdf"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                id="resume-upload"
                                            />
                                            <div className={`
                                                w-full border-2 border-dashed rounded-xl p-6 
                                                flex flex-col items-center justify-center transition-all
                                                ${uploadedFile
                                                    ? 'bg-success-light border-success/30'
                                                    : 'bg-surface-50 border-neutral-200 group-hover:bg-primary-50 group-hover:border-primary/30'
                                                }
                                            `}>
                                                <div className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all
                                                    ${uploadedFile
                                                        ? 'bg-success/20 text-success'
                                                        : 'bg-white text-neutral-400 group-hover:text-primary group-hover:scale-110'
                                                    }
                                                `}>
                                                    {uploadedFile ? <CheckCircle size={24} /> : <Upload size={24} />}
                                                </div>
                                                {uploadedFile ? (
                                                    <>
                                                        <span className="text-success font-medium mb-1">{uploadedFile}</span>
                                                        <span className="text-xs text-success/70">Click to replace</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-neutral-700 font-medium mb-1">Click to upload or drag and drop</span>
                                                        <span className="text-xs text-neutral-400">TXT or PDF</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Textarea
                                        label="Resume Text (Optional)"
                                        placeholder="Paste your resume text here for better personalization..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        variant="light"
                                        className="min-h-[100px]"
                                    />

                                    {/* Question Count */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-neutral-700">Number of Questions</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[5, 8, 10, 15].map((count) => (
                                                <button
                                                    key={count}
                                                    type="button"
                                                    className={`
                                                        py-3 px-4 rounded-xl font-semibold transition-all
                                                        ${questionCount === count
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-surface-100 text-neutral-600 hover:bg-surface-200 hover:text-neutral-900'
                                                        }
                                                    `}
                                                    onClick={() => setQuestionCount(count)}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                                            <Mic size={20} />
                                            Start Interview
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* What's Included */}
                            <Card variant="default" padding="lg">
                                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <Sparkles size={18} className="text-primary" />
                                    What&apos;s Included
                                </h3>
                                <ul className="space-y-3">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-sm text-neutral-600">
                                            <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center text-success">
                                                {feature.icon}
                                            </div>
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </Card>

                            {/* Duration Estimate */}
                            <Card variant="default" padding="lg">
                                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-warning" />
                                    Estimated Duration
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">5 questions</span>
                                        <span className="font-medium text-neutral-700">~10 mins</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">8 questions</span>
                                        <span className="font-medium text-neutral-700">~15 mins</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">10 questions</span>
                                        <span className="font-medium text-neutral-700">~20 mins</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">15 questions</span>
                                        <span className="font-medium text-neutral-700">~30 mins</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Tips */}
                            <Card variant="gradient" padding="lg" className="bg-primary-50 border-primary/10">
                                <h3 className="font-semibold text-neutral-900 mb-3">💡 Pro Tip</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    Include the full job description for more relevant and tailored interview questions. The AI uses this to simulate a real interview experience.
                                </p>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
