import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Submit an answer for a question
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;
    const { student_id, question_id, selected_option } = await request.json();

    if (!student_id || !question_id || !selected_option) {
      return NextResponse.json(
        { error: 'Student ID, question ID, and selected option are required' },
        { status: 400 }
      );
    }

    // Validate selected_option
    if (!['A', 'B', 'C', 'D'].includes(selected_option)) {
      return NextResponse.json(
        { error: 'Selected option must be A, B, C, or D' },
        { status: 400 }
      );
    }

    // Get the quiz to check start and end times
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if quiz is available based on start and end times
    const now = new Date();
    const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
    const endTime = quiz.end_time ? new Date(quiz.end_time) : null;

    if (startTime && now < startTime) {
      return NextResponse.json(
        { error: 'Quiz has not started yet' },
        { status: 403 }
      );
    }

    if (endTime && now > endTime) {
      return NextResponse.json(
        { error: 'Quiz has ended' },
        { status: 403 }
      );
    }

    // Get the question to check the correct answer
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if the answer is correct
    const is_correct = selected_option === question.correct_option;
    const points_earned = is_correct ? question.points : 0;

    // Check if an answer already exists for this student and question
    const { data: existingAnswer, error: existingAnswerError } = await supabase
      .from('answers')
      .select('*')
      .eq('student_id', student_id)
      .eq('question_id', question_id)
      .single();

    let answer;

    if (existingAnswer) {
      // Update existing answer
      const { data: updatedAnswer, error: updateError } = await supabase
        .from('answers')
        .update({
          selected_option,
          is_correct,
          points_earned,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnswer.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Error updating answer' },
          { status: 500 }
        );
      }

      answer = updatedAnswer;
    } else {
      // Create new answer
      const { data: newAnswer, error: insertError } = await supabase
        .from('answers')
        .insert([{
          student_id,
          quiz_id: quizId,
          question_id,
          selected_option,
          is_correct,
          points_earned
        }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Error submitting answer' },
          { status: 500 }
        );
      }

      answer = newAnswer;
    }

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
