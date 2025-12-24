import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Rachel - warm, friendly female voice perfect for interviews
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId = DEFAULT_VOICE_ID } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // If no ElevenLabs key, return flag to use browser TTS
        if (!ELEVENLABS_API_KEY) {
            console.log('No ELEVENLABS_API_KEY found, using browser TTS');
            return NextResponse.json({ useBrowserTTS: true });
        }

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('ElevenLabs TTS error:', response.status, error);
            return NextResponse.json({ useBrowserTTS: true });
        }

        // Get the audio as array buffer and return as base64
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({
            audio: base64Audio,
            contentType: 'audio/mpeg'
        });

    } catch (error) {
        console.error('TTS API error:', error);
        return NextResponse.json({ useBrowserTTS: true });
    }
}
