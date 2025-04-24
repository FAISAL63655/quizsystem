import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get all quizzes
export async function GET() {
  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error fetching quizzes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const { title, description, video_url, start_time, end_time } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Quiz title is required' },
        { status: 400 }
      );
    }

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert([{ title, description, video_url, start_time, end_time }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error creating quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
