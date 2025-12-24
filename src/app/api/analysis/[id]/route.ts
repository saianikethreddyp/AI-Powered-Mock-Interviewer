import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Missing interview ID' },
                { status: 400 }
            );
        }

        // Fetch analysis from database
        const { data: analysis, error } = await supabase
            .from('analysis')
            .select('*')
            .eq('interview_id', id)
            .single();

        if (error) {
            console.error('Error fetching analysis:', error);
            return NextResponse.json(
                { error: 'Analysis not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            analysis,
        });

    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis' },
            { status: 500 }
        );
    }
}
