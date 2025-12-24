import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpQuestion } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
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

            if (nextQuestion) {
                // Generate a transition or follow-up
                const transition = await generateFollowUpQuestion(
                    currentQuestion,
                    userResponse,
                    jobRole,
                    conversationHistory
                );

                // Combine transition with next question
                aiResponse = `${transition}\n\nHere's my next question: ${nextQuestion}`;
            } else {
                aiResponse = await generateFollowUpQuestion(
                    currentQuestion,
                    userResponse,
                    jobRole,
                    conversationHistory
                );
            }
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
