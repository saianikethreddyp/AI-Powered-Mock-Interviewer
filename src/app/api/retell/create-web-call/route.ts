import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { interviewId, jobRole, jobDescription, candidateName } = body;

        if (!interviewId || !jobRole) {
            return NextResponse.json(
                { error: 'Missing required fields: interviewId and jobRole' },
                { status: 400 }
            );
        }

        // Create dynamic variables to pass to the agent
        const dynamicVariables = {
            job_role: jobRole,
            job_description: jobDescription || 'General position',
            candidate_name: candidateName || 'Candidate',
            interview_id: interviewId,
        };

        // Create a web call with Retell
        const webCallResponse = await retellClient.call.createWebCall({
            agent_id: process.env.RETELL_AGENT_ID || '',
            metadata: {
                interview_id: interviewId,
                job_role: jobRole,
            },
            retell_llm_dynamic_variables: dynamicVariables,
        });

        return NextResponse.json({
            success: true,
            accessToken: webCallResponse.access_token,
            callId: webCallResponse.call_id,
        });

    } catch (error) {
        console.error('Error creating Retell web call:', error);
        return NextResponse.json(
            { error: 'Failed to create web call' },
            { status: 500 }
        );
    }
}
