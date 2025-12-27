import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpQuestion } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        // Extract and validate auth token
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized: No token provided' },
                { status: 401 }
            );
        }

        // Create authenticated Supabase client
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

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { interviewId, questionIndex, userResponse, questions, jobRole, conversation } = body;

        if (!interviewId || userResponse === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const currentQuestion = questions?.[questionIndex] || 'Tell me about yourself';

        // Save the response to database
        const { error: dbError } = await supabase
            .from('responses')
            .insert({
                interview_id: interviewId,
                question_number: questionIndex + 1,
                question: currentQuestion,
                user_response: userResponse,
            });

        if (dbError) {
            console.error('Database error:', dbError);
        }

        // Prepare conversation history for context
        const conversationHistory = conversation
            ?.filter((c: { question?: string; response?: string }) => c.question || c.response)
            ?.map((c: { question?: string; response?: string }) => ({
                question: c.question || '',
                response: c.response || '',
            })) || [];

        // Check if interview should end
        const isComplete = questionIndex >= (questions?.length || 8) - 1;

        let aiResponse: string;

        if (isComplete) {
            aiResponse = "Thank you so much for taking the time to speak with me today. You've given some really thoughtful answers, and I appreciate your candidness. We'll be in touch soon with feedback on your interview. Take care!";
        } else {
            // Get next question with potential follow-up based on response
            const nextQuestionIndex = questionIndex + 1;
            const nextQuestion = questions?.[nextQuestionIndex];

            // Generate a natural transition that includes the next question
            aiResponse = await generateFollowUpQuestion(
                currentQuestion,
                userResponse,
                jobRole,
                conversationHistory,
                nextQuestion // Pass the next question to be woven in naturally
            );
        }

        return NextResponse.json({
            success: true,
            aiResponse,
            isComplete,
        });

    } catch (error) {
        console.error('Error processing response:', error);
        return NextResponse.json(
            { error: 'Failed to process response' },
            { status: 500 }
        );
    }
}
