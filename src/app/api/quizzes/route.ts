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

    // تحضير البيانات للإدخال
    const quizData = {
      title,
      description: description || null,
      video_url: video_url || null,
      start_time: start_time || null,
      end_time: end_time || null
    };

    console.log('Attempting to create quiz with data:', JSON.stringify(quizData));

    // محاولة إنشاء الاختبار
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating quiz:', error);
      return NextResponse.json(
        { error: `Error creating quiz: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    console.log('Quiz created successfully:', quiz);
    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
