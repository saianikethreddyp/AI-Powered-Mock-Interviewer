import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewAnalysis } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Debug logger
const LOG_FILE = path.join(process.cwd(), 'server-debug.log');

function log(message: string, data?: any) {
    try {
        const timestamp = new Date().toISOString();
        // Mask token in logs if present
        const safeData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
            if (key === 'Authorization') return '***';
            return value;
        })) : null;

        const logMessage = `[${timestamp}] ${message} ${safeData ? JSON.stringify(safeData) : ''}\n`;

        if (!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, '');
        }
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

export async function POST(request: NextRequest) {
    try {
        log('Received completion request (Token-based)');

        // Extract token
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            log('Error: Missing Auth token');
            return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
        }

        // Initialize Authenticated Supabase Client
        // We use the Anon Key but inject the User's Token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        // Verify session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            log('Error: Invalid token/session', authError);
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        log('User verified', { userId: user.id });

        const body = await request.json();
        const { interviewId, conversation, jobRole, jobDescription } = body;

        // Basic payload logging
        log('Request parsed', {
            interviewId,
            conversationLength: conversation?.length,
            jobRole
        });

        if (!interviewId) {
            log('Error: Missing interview ID');
            return NextResponse.json(
                { error: 'Missing interview ID' },
                { status: 400 }
            );
        }

        // Log the raw conversation for debugging
        log('Raw conversation received', {
            conversation: JSON.stringify(conversation?.slice(0, 10) || [], null, 2)
        });

        // Parse conversation to extract Q&A pairs
        // The transcript alternates between agent questions and user responses
        const responses = [];
        if (conversation && Array.isArray(conversation)) {
            // Collect all agent messages and user messages separately, then pair them
            let currentAgentMessage = '';

            for (let i = 0; i < conversation.length; i++) {
                const item = conversation[i];
                const role = item.role;
                const content = item.content;

                // Allow both 'ai' and 'agent' roles for the interviewer
                if (role === 'ai' || role === 'agent') {
                    // If we have a pending agent message and this is a new one,
                    // check if we need to combine or start fresh
                    currentAgentMessage = content;
                } else if (role === 'user' && currentAgentMessage) {
                    // Pair the agent message with this user response
                    responses.push({
                        question: currentAgentMessage,
                        userResponse: content,
                    });
                    currentAgentMessage = '';
                }
            }
        }
        log('Extracted Q&A pairs', { count: responses.length, firstPair: responses[0] });


        // Generate comprehensive analysis using Gemini
        log('Calling Gemini API...');
        const analysis = await generateInterviewAnalysis(
            jobRole,
            jobDescription,
            responses
        );
        log('Gemini returned', {
            success: !!analysis,
            overallScore: analysis?.overallScore
        });

        if (analysis) {
            // Save analysis to database
            log('Saving to Supabase...');
            const { error: analysisError } = await supabase
                .from('analysis')
                .insert({
                    interview_id: interviewId,
                    overall_score: analysis.overallScore,
                    category_scores: analysis.categoryScores,
                    strengths: analysis.strengths,
                    areas_for_improvement: analysis.areasForImprovement,
                    detailed_feedback: analysis.detailedFeedback,
                    question_feedback: analysis.questionFeedback,
                    hiring_recommendation: analysis.hiringRecommendation,
                    interview_tips: analysis.interviewTips,
                });

            if (analysisError) {
                log('Supabase Insert Error', analysisError);
                console.error('Error saving analysis:', analysisError);
            } else {
                log('Analysis saved successfully');
            }
        } else {
            log('Analysis was null');
        }

        // Update interview status
        const { error: updateError } = await supabase
            .from('interviews')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', interviewId);

        if (updateError) {
            log('Error updating interview status', updateError);
            console.error('Error updating interview:', updateError);
        }

        return NextResponse.json({
            success: true,
            analysis,
        });

    } catch (error) {
        log('Unhandled API Error', error);
        console.error('Error completing interview:', error);
        return NextResponse.json(
            { error: 'Failed to complete interview' },
            { status: 500 }
        );
    }
}
