'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRetellWebCall } from '@/hooks/useRetellWebCall';
import { Button } from '@/components/ui/Button';
import { AIAvatar } from '@/components/AIAvatar';
import { VoiceVisualizer } from '@/components/VoiceVisualizer';
import { Interview } from '@/types';
import {
    PhoneOff,
    AlertCircle,
    Phone,
    ArrowLeft
} from 'lucide-react';

type InterviewState = 'idle' | 'connecting' | 'active' | 'ai-speaking' | 'ended';

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, session, loading: authLoading } = useAuth();
    const router = useRouter();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [interviewState, setInterviewState] = useState<InterviewState>('idle');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pageError, setPageError] = useState('');
    const isCompletingRef = useRef(false);


    // Helper to complete interview (can be called from event or manual end)
    const completeInterview = async (finalTranscript: any[]) => {
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;

        setInterviewState('ended');
        setIsAnalyzing(true);
        try { endCall(); } catch (e) { }

        if (interview) {
            try {
                // Call completion API to generate analysis
                // We MUST await this to ensure the server receives and processes the request
                // before we navigate away.
                console.log('Generating analysis...');
                const response = await fetch('/api/interview/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({
                        interviewId: interview.id,
                        conversation: finalTranscript,
                        jobRole: interview.job_role,
                        jobDescription: interview.job_description
                    }),
                });
                if (!response.ok) console.error('Analysis failed', response.status);

            } catch (err) {
                console.error('Error triggering interview completion:', err);
            }
        }

        // Navigate to results
        router.push(`/interview/${id}/results`);
    };

    // Retell Web Call hook
    const {
        isCallActive,
        isAgentSpeaking,
        isConnecting,
        transcript,
        error: retellError,
        startCall,
        endCall,
    } = useRetellWebCall({
        onCallStarted: () => {
            console.log('Interview call started');
            setInterviewState('active');
        },
        onCallEnded: (finalTranscript) => {
            console.log('Interview call ended, generating results...');
            completeInterview(finalTranscript);
        },
        onError: (error) => {
            console.error('Retell error:', error);
            setPageError(error.message);
        },
    });

    // Fetch interview data
    useEffect(() => {
        const fetchInterview = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('interviews')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setInterview(data);
            } catch (err) {
                console.error('Error fetching interview:', err);
                setPageError('Interview not found');
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [id]);

    // Start the interview with Retell
    const startInterview = async () => {
        if (!interview) return;

        setInterviewState('connecting');
        setPageError('');

        try {
            // Get the candidate's actual name from user metadata
            const candidateName = user?.user_metadata?.full_name ||
                user?.email?.split('@')[0] ||
                'there';

            // Create a web call via our API
            const response = await fetch('/api/retell/create-web-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewId: interview.id,
                    jobRole: interview.job_role,
                    jobDescription: interview.job_description,
                    candidateName: candidateName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create call');
            }

            // Start the Retell call with the access token
            await startCall(data.accessToken);

            // Update interview status in database
            await supabase
                .from('interviews')
                .update({
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                    retell_call_id: data.callId,
                })
                .eq('id', interview.id);

        } catch (err: any) {
            console.error('Error starting interview:', err);
            setPageError('Failed to start interview. Check microphone permissions.');
            setInterviewState('idle');
        }
    };

    // End the interview manually
    const handleEndInterview = async () => {
        // Prevent double completion
        if (isCompletingRef.current) {
            console.log('Already completing interview, ignoring duplicate end request');
            return;
        }

        try {
            // End the call - the onCallEnded event will trigger completeInterview
            endCall();
        } catch (err) {
            console.error('Error ending call:', err);
            // Only call completeInterview as fallback if endCall failed
            if (!isCompletingRef.current) {
                completeInterview(transcript);
            }
        }
    };

    // Get status text
    const getStatusText = () => {
        switch (interviewState) {
            case 'connecting':
                return 'Connecting to interviewer...';
            case 'ended':
                return 'Interview complete. Redirecting...';
            case 'active':
                if (isAgentSpeaking) return 'Interviewer is speaking...';
                return 'Listening... Speak naturally';
            default:
                return 'Ready to start';
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-400">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
                Loading interview...
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    if (pageError && !interview) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white p-6">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Interview Not Found</h2>
                <p className="text-slate-400 mb-8 text-center">{pageError}</p>
                <Link href="/dashboard">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white p-6 animate-enter">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-slow" />
                    <AIAvatar isSpeaking={false} isListening={true} size="md" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Wrap Up Complete!</h2>
                <div className="flex items-center gap-3 text-slate-300 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">Generating your personalized feedback...</span>
                </div>
                <p className="mt-8 text-slate-500 text-sm max-w-md text-center">
                    Sarah is compiling your performance analysis. This usually takes about 10 seconds.
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-dark-900 overflow-hidden text-white font-sans selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-dark-900/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft size={18} />
                        Exit
                    </Link>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="font-heading text-lg font-semibold tracking-tight text-slate-200">
                        {interview?.job_role}
                    </div>
                    {isCallActive && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wider animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            LIVE
                        </div>
                    )}
                </div>

                {isCallActive && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEndInterview}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 hover:border-red-500/30 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        >
                            <PhoneOff size={18} />
                            <span>End Call</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Main Stage */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6">
                {interviewState === 'idle' ? (
                    <div className="w-full max-w-lg animate-enter">
                        <div className="glass-card rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-50" />

                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                    <AIAvatar isSpeaking={false} isListening={false} size="lg" />
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                                Ready to Begin?
                            </h1>

                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                I'm Sarah, and I've reviewed the <span className="text-primary font-semibold">{interview?.job_role}</span> description.
                                I'm ready to start our conversation.
                            </p>

                            {(pageError || retellError) && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 text-left">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>{pageError || retellError}</span>
                                </div>
                            )}

                            <button
                                onClick={startInterview}
                                disabled={isConnecting}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:to-indigo-500 text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Phone size={20} className="group-hover:animate-pulse" />
                                        Start Interview
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest font-medium">
                                Microphone required
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">
                            {/* Avatar Stage */}
                            <div className="relative mb-12">
                                {isAgentSpeaking && (
                                    <div className="absolute inset-[-40px] bg-primary/20 blur-[60px] rounded-full animate-pulse-slow" />
                                )}
                                <div className="relative z-10 transition-transform duration-700 ease-out">
                                    <AIAvatar
                                        isSpeaking={isAgentSpeaking}
                                        isListening={isCallActive && !isAgentSpeaking}
                                        size="lg"
                                    />
                                </div>
                            </div>

                            {/* Live Status Pill */}
                            <div className="mb-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300 font-medium flex items-center gap-3 shadow-xl">
                                {interviewState === 'connecting' && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                                {interviewState === 'active' && isAgentSpeaking && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                {interviewState === 'active' && !isAgentSpeaking && <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />}
                                {getStatusText()}
                            </div>

                            {/* Visualizer */}
                            <div className="h-24 w-full max-w-xs opacity-50 mix-blend-screen">
                                <VoiceVisualizer isActive={isCallActive && !isAgentSpeaking} size="lg" />
                            </div>
                        </div>

                        {/* Transcript Area */}
                        <div className="w-full max-w-3xl h-[25vh] mb-4 overflow-y-auto px-4 space-y-4 mask-image-gradient">
                            {transcript.map((item, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-2xl backdrop-blur-sm max-w-[85%] animate-enter ${item.role === 'agent'
                                        ? 'bg-primary/10 border border-primary/20 text-slate-200 self-start rounded-bl-sm mr-auto'
                                        : 'bg-white/5 border border-white/10 text-slate-300 self-end rounded-br-sm ml-auto text-right'
                                        }`}
                                >
                                    {item.content}
                                </div>
                            ))}
                            <div id="transcript-end" />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
