import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Retell from 'retell-sdk';

// Verify webhook signature from Retell
function verifyRetellSignature(payload: string, apiKey: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha256', apiKey)
        .update(payload)
        .digest('hex');
    return hash === signature;
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-retell-signature') || '';

        // Verify the signature (required for production security)
        const apiKey = process.env.RETELL_API_KEY || '';
        const skipValidation = process.env.SKIP_WEBHOOK_VALIDATION === 'true';

        if (!skipValidation && apiKey && signature) {
            const isValid = verifyRetellSignature(rawBody, apiKey, signature);
            if (!isValid) {
                console.error('Invalid Retell webhook signature - rejecting request');
                return NextResponse.json(
                    { error: 'Invalid webhook signature' },
                    { status: 403 }
                );
            }
        } else if (!skipValidation && (!apiKey || !signature)) {
            console.warn('Missing API key or signature for webhook verification');
        }

        const event = JSON.parse(rawBody);
        const { event: eventType, call } = event;

        console.log('Retell webhook received:', eventType);

        switch (eventType) {
            case 'call_started':
                console.log('Call started:', call?.call_id);
                break;

            case 'call_ended':
                console.log('Call ended:', call?.call_id);

                // Extract interview ID from metadata
                const interviewId = call?.metadata?.interview_id;

                if (interviewId && call?.transcript) {
                    // Save transcript to Supabase
                    const { error } = await supabase
                        .from('interviews')
                        .update({
                            transcript: call.transcript,
                            call_duration_ms: call.call_duration_ms || 0,
                            status: 'completed',
                            completed_at: new Date().toISOString(),
                        })
                        .eq('id', interviewId);

                    if (error) {
                        console.error('Error saving transcript:', error);
                    } else {
                        console.log('Transcript saved for interview:', interviewId);
                    }
                }
                break;

            case 'call_analyzed':
                console.log('Call analyzed:', call?.call_id);
                // Additional post-call analysis data is available here
                break;

            default:
                console.log('Unknown event type:', eventType);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Retell webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Retell may also send GET requests to verify the endpoint
export async function GET() {
    return NextResponse.json({ status: 'Retell webhook endpoint active' });
}
