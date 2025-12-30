'use client';

import { useState, useEffect, use, useRef } from 'react';
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
    ArrowLeft,
    Mic,
    MicOff,
    Video,
    VideoOff,
    MonitorUp,
    Smile,
    MessageSquare,
    Users,
    MoreVertical,
    Sparkles
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

    // Helper to complete interview
    const completeInterview = async (finalTranscript: any[]) => {
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;

        setInterviewState('ended');
        setIsAnalyzing(true);
        try { endCall(); } catch (e) { }

        if (interview) {
            try {
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
            const candidateName = user?.user_metadata?.full_name ||
                user?.email?.split('@')[0] ||
                'there';

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

            await startCall(data.accessToken);

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
        if (isCompletingRef.current) {
            console.log('Already completing interview, ignoring duplicate end request');
            return;
        }

        try {
            endCall();
        } catch (err) {
            console.error('Error ending call:', err);
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
                if (isAgentSpeaking) return 'Sarah is speaking...';
                return 'Listening... Speak naturally';
            default:
                return 'Ready to start';
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-400">Loading interview...</p>
                </div>
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
                <div className="w-16 h-16 rounded-2xl bg-danger/20 flex items-center justify-center mb-6">
                    <AlertCircle size={32} className="text-danger" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
                <p className="text-neutral-400 mb-8 text-center">{pageError}</p>
                <Link href="/dashboard">
                    <Button variant="primary">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white p-6 animate-enter">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full animate-pulse" />
                    <AIAvatar isSpeaking={false} isListening={true} size="md" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center font-heading">Wrap Up Complete!</h2>
                <div className="flex items-center gap-3 text-neutral-300 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">Generating your personalized feedback...</span>
                </div>
                <p className="mt-8 text-neutral-500 text-sm max-w-md text-center">
                    Sarah is compiling your performance analysis. This usually takes about 10 seconds.
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-dark-900 overflow-hidden text-white font-sans selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-dark-800/50 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    {/* Meeting Info */}
                    <div className="text-sm text-neutral-400">
                        {interview?.job_role} Interview
                    </div>

                    {/* Live Indicator */}
                    {isCallActive && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger/10 border border-danger/20">
                            <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            <span className="text-xs font-bold text-danger uppercase tracking-wider">LIVE</span>
                            <span className="text-xs text-danger/70">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!isCallActive && (
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                <ArrowLeft size={18} />
                                Exit
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 relative z-10 flex flex-col">
                {interviewState === 'idle' ? (
                    /* Pre-call Screen */
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="w-full max-w-lg animate-enter">
                            <div className="bg-dark-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center border border-white/10 shadow-2xl">
                                <div className="flex justify-center mb-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                        <AIAvatar isSpeaking={false} isListening={false} size="lg" />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold mb-4 font-heading">Ready to Begin?</h1>

                                <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                                    I'm <span className="text-primary font-semibold">Sarah</span>, your AI interviewer.
                                    I've reviewed the <span className="text-white font-medium">{interview?.job_role}</span> position
                                    and I'm ready to start our conversation.
                                </p>

                                {(pageError || retellError) && (
                                    <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3 text-left">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <span>{pageError || retellError}</span>
                                    </div>
                                )}

                                <button
                                    onClick={startInterview}
                                    disabled={isConnecting}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-success to-emerald-600 hover:from-success hover:to-emerald-500 text-white font-semibold text-lg shadow-lg shadow-success/25 hover:shadow-success/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isConnecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Phone size={20} />
                                            Join Interview
                                        </>
                                    )}
                                </button>

                                <p className="mt-6 text-xs text-neutral-500 uppercase tracking-widest font-medium">
                                    🎤 Microphone required
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Active Call Screen - Video Call Style */
                    <div className="flex-1 flex flex-col">
                        {/* Participant Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
                            {/* AI Interviewer Tile */}
                            <div className="relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {isAgentSpeaking && (
                                        <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                                    )}
                                    <div className="relative">
                                        {isAgentSpeaking && (
                                            <div className="absolute inset-[-30px] bg-primary/30 blur-[40px] rounded-full animate-pulse-slow" />
                                        )}
                                        <AIAvatar
                                            isSpeaking={isAgentSpeaking}
                                            isListening={isCallActive && !isAgentSpeaking}
                                            size="lg"
                                        />
                                    </div>
                                </div>

                                {/* Name Badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-sm font-medium">
                                        Sarah (AI Interviewer)
                                    </div>
                                    {isAgentSpeaking && (
                                        <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">
                                            Speaking
                                        </div>
                                    )}
                                </div>

                                {/* Speaking Indicator Ring */}
                                {isAgentSpeaking && (
                                    <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-pulse" />
                                )}
                            </div>

                            {/* User Tile */}
                            <div className="relative bg-dark-700 rounded-2xl overflow-hidden border border-white/5">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {!isAgentSpeaking && isCallActive && (
                                        <div className="absolute inset-0 bg-success/5" />
                                    )}
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary flex items-center justify-center text-3xl font-bold">
                                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'Y'}
                                    </div>
                                </div>

                                {/* User Voice Visualizer */}
                                {!isAgentSpeaking && isCallActive && (
                                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 opacity-60">
                                        <VoiceVisualizer isActive={true} size="sm" />
                                    </div>
                                )}

                                {/* Name Badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-sm font-medium">
                                        {user?.user_metadata?.full_name?.split(' ')[0] || 'You'}
                                    </div>
                                    {!isAgentSpeaking && isCallActive && (
                                        <div className="px-2 py-1 rounded bg-success/20 text-success text-xs font-medium flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                            Listening
                                        </div>
                                    )}
                                </div>

                                {/* Active Speaking Ring */}
                                {!isAgentSpeaking && isCallActive && (
                                    <div className="absolute inset-0 border-2 border-success rounded-2xl" />
                                )}
                            </div>
                        </div>

                        {/* Transcript Panel (Collapsible) */}
                        <div className="px-4 pb-4">
                            <div className="max-w-3xl mx-auto bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                                <div className="p-4 space-y-3">
                                    {transcript.length === 0 ? (
                                        <p className="text-center text-neutral-500 text-sm py-4">
                                            Conversation will appear here...
                                        </p>
                                    ) : (
                                        transcript.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`flex gap-3 ${item.role === 'agent' ? '' : 'flex-row-reverse'}`}
                                            >
                                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${item.role === 'agent'
                                                        ? 'bg-primary/20 text-primary'
                                                        : 'bg-white/10 text-white'
                                                    }`}>
                                                    {item.role === 'agent' ? 'AI' : 'You'}
                                                </div>
                                                <div className={`flex-1 p-3 rounded-xl text-sm ${item.role === 'agent'
                                                        ? 'bg-primary/10 border border-primary/20 text-neutral-200'
                                                        : 'bg-white/5 border border-white/10 text-neutral-300'
                                                    } ${item.role === 'agent' ? 'rounded-tl-sm' : 'rounded-tr-sm text-right'}`}>
                                                    {item.content}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="p-4 bg-dark-800/80 backdrop-blur-xl border-t border-white/5">
                            <div className="max-w-4xl mx-auto flex items-center justify-between">
                                {/* Left Controls */}
                                <div className="flex items-center gap-2">
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors" title="Mute">
                                        <Mic size={20} />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors relative" title="Camera Off">
                                        <VideoOff size={20} className="text-neutral-400" />
                                    </button>
                                </div>

                                {/* Center Controls */}
                                <div className="flex items-center gap-3">
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors" title="Share Screen">
                                        <MonitorUp size={20} />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors" title="Reactions">
                                        <Smile size={20} />
                                    </button>
                                    <button
                                        onClick={handleEndInterview}
                                        className="px-6 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white font-semibold flex items-center gap-2 shadow-lg shadow-danger/25 hover:shadow-danger/40 transition-all"
                                    >
                                        <PhoneOff size={18} />
                                        <span>End Interview</span>
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors" title="More">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-2">
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors" title="Chat">
                                        <MessageSquare size={20} />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors flex items-center gap-2" title="Participants">
                                        <Users size={20} />
                                        <span className="text-sm font-medium">2</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
