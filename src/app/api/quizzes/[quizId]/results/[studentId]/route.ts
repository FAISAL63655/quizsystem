import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get detailed results for a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string; studentId: string } }
) {
  try {
    const { quizId, studentId } = params;

    // Get student details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) {
      return NextResponse.json(
        { error: 'المعلم غير موجود' },
        { status: 404 }
      );
    }

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

    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId)
      .single();

    if (submissionError) {
      return NextResponse.json(
        { error: 'لم يتم العثور على نتيجة لهذا المعلم' },
        { status: 404 }
      );
    }

    // Get all questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (questionsError) {
      return NextResponse.json(
        { error: 'خطأ في جلب أسئلة الاختبار' },
        { status: 500 }
      );
    }

    // Get all answers for this student
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId);

    if (answersError) {
      return NextResponse.json(
        { error: 'خطأ في جلب إجابات المعلم' },
        { status: 500 }
      );
    }

    // Combine questions with answers
    const questionAnswers = questions.map(question => {
      const answer = answers.find(a => a.question_id === question.id) || null;
      
      // Convert option letters to Arabic
      const correctOptionArabic = 
        question.correct_option === 'A' ? 'أ' :
        question.correct_option === 'B' ? 'ب' :
        question.correct_option === 'C' ? 'ج' : 'د';
      
      const selectedOptionArabic = answer?.selected_option ? 
        (answer.selected_option === 'A' ? 'أ' :
         answer.selected_option === 'B' ? 'ب' :
         answer.selected_option === 'C' ? 'ج' : 'د') : null;
      
      return {
        question_id: question.id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        correct_option_arabic: correctOptionArabic,
        points: question.points,
        selected_option: answer?.selected_option || null,
        selected_option_arabic: selectedOptionArabic,
        is_correct: answer?.is_correct || false,
        points_earned: answer?.points_earned || 0
      };
    });

    // Calculate total possible points
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    // Calculate percentage score
    const percentageScore = totalPossiblePoints > 0 
      ? Math.round((submission.total_points / totalPossiblePoints) * 100) 
      : 0;

    return NextResponse.json({
      student,
      quiz,
      submission: {
        ...submission,
        percentage_score: percentageScore,
        total_possible_points: totalPossiblePoints
      },
      question_answers: questionAnswers
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}
