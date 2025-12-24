import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions, generateInterviewGreeting } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { interviewId, jobRole, jobDescription, resumeText } = body;

        if (!interviewId || !jobRole) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate interview questions using Gemini
        const questions = await generateInterviewQuestions(
            jobRole,
            jobDescription || '',
            resumeText || '',
            8
        );

        // Generate greeting
        const greeting = await generateInterviewGreeting(
            jobRole,
            'Candidate'
        );

        return NextResponse.json({
            success: true,
            questions,
            greeting,
        });

    } catch (error) {
        console.error('Error starting interview:', error);
        return NextResponse.json(
            { error: 'Failed to start interview' },
            { status: 500 }
        );
    }
}
