import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get previous answers for a student in a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get all answers for this student and quiz
    const { data: answers, error } = await supabase
      .from('answers')
      .select('*')
      .eq('student_id', student_id)
      .eq('quiz_id', quizId);

    if (error) {
      console.error('Error fetching previous answers:', error);
      return NextResponse.json(
        { error: 'Error fetching previous answers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error fetching previous answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
