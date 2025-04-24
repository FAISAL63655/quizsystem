import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string; questionId: string } }
) {
  try {
    const questionId = params.questionId;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, points } = await request.json();

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json(
        { error: 'All question fields are required' },
        { status: 400 }
      );
    }

    // Validate correct_option
    if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
      return NextResponse.json(
        { error: 'Correct option must be A, B, C, or D' },
        { status: 400 }
      );
    }

    const { data: question, error } = await supabase
      .from('questions')
      .update({
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        points: points || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error updating question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string; questionId: string } }
) {
  try {
    const questionId = params.questionId;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      return NextResponse.json(
        { error: 'Error deleting question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
