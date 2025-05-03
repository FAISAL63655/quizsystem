import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Submit a quiz (mark as completed)
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;
    const { student_id } = await request.json();

    if (!student_id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
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

    // Calculate total points earned
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('points_earned')
      .eq('student_id', student_id)
      .eq('quiz_id', quizId);

    if (answersError) {
      return NextResponse.json(
        { error: 'Error calculating total points' },
        { status: 500 }
      );
    }

    const total_points = answers.reduce((sum, answer) => sum + answer.points_earned, 0);

    // Check if a submission already exists
    const { data: existingSubmission, error: existingSubmissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('student_id', student_id)
      .eq('quiz_id', quizId)
      .single();

    let submission;

    if (existingSubmission) {
      // Update existing submission
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('quiz_submissions')
        .update({
          total_points,
          has_submitted: true,
          submission_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Error updating submission' },
          { status: 500 }
        );
      }

      submission = updatedSubmission;
    } else {
      // Create new submission
      const { data: newSubmission, error: insertError } = await supabase
        .from('quiz_submissions')
        .insert([{
          student_id,
          quiz_id: quizId,
          total_points,
          has_submitted: true,
          submission_time: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Error creating submission' },
          { status: 500 }
        );
      }

      submission = newSubmission;
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
