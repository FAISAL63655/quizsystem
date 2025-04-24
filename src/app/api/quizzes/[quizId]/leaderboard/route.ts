import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get the leaderboard for a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;

    // Get all submissions for this quiz
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select(`
        id,
        student_id,
        quiz_id,
        total_points,
        has_submitted,
        submission_time,
        students (
          full_name
        )
      `)
      .eq('quiz_id', quizId)
      .eq('has_submitted', true)
      .order('total_points', { ascending: false });

    if (submissionsError) {
      return NextResponse.json(
        { error: 'Error fetching leaderboard' },
        { status: 500 }
      );
    }

    // Format the leaderboard data
    const leaderboard = submissions.map((submission, index) => ({
      student_id: submission.student_id,
      full_name: submission.students.full_name,
      total_points: submission.total_points,
      rank: index + 1
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
