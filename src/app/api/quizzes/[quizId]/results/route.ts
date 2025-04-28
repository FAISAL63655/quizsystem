import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get quiz results (all students who took the quiz with their scores)
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;

    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) {
      return NextResponse.json(
        { error: 'الاختبار غير موجود' },
        { status: 404 }
      );
    }

    // Get all questions for this quiz to calculate total possible points
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, points')
      .eq('quiz_id', quizId);

    if (questionsError) {
      return NextResponse.json(
        { error: 'خطأ في جلب أسئلة الاختبار' },
        { status: 500 }
      );
    }

    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Get all submissions for this quiz
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select(`
        id,
        total_points,
        submission_time,
        students (
          id,
          full_name,
          national_id
        )
      `)
      .eq('quiz_id', quizId)
      .eq('has_submitted', true)
      .order('total_points', { ascending: false });

    if (submissionsError) {
      return NextResponse.json(
        { error: 'خطأ في جلب نتائج الاختبار' },
        { status: 500 }
      );
    }

    // Format the results
    const results = submissions.map((submission) => {
      const percentageScore = totalPossiblePoints > 0 
        ? Math.round((submission.total_points / totalPossiblePoints) * 100) 
        : 0;
      
      return {
        submission_id: submission.id,
        student_id: submission.students.id,
        full_name: submission.students.full_name,
        national_id: submission.students.national_id,
        total_points: submission.total_points,
        percentage_score: percentageScore,
        submission_time: submission.submission_time
      };
    });

    // Calculate statistics
    const statistics = {
      total_submissions: results.length,
      average_score: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.percentage_score, 0) / results.length) 
        : 0,
      highest_score: results.length > 0 
        ? Math.max(...results.map(r => r.percentage_score)) 
        : 0,
      lowest_score: results.length > 0 
        ? Math.min(...results.map(r => r.percentage_score)) 
        : 0,
      total_possible_points: totalPossiblePoints
    };

    return NextResponse.json({ 
      quiz,
      results,
      statistics
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}
