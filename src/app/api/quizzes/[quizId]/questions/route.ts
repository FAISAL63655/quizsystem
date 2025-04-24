import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Add a question to a quiz
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, points, options_count } = await request.json();

    // التحقق من الحقول المطلوبة بناءً على عدد الخيارات
    if (!question_text || !option_a || !option_b) {
      return NextResponse.json(
        { error: 'نص السؤال والخيارات أ و ب مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من الخيارات الإضافية إذا كان عدد الخيارات أكبر من 2
    if (options_count >= 3 && !option_c) {
      return NextResponse.json(
        { error: 'الخيار ج مطلوب عند اختيار 3 خيارات أو أكثر' },
        { status: 400 }
      );
    }

    if (options_count >= 4 && !option_d) {
      return NextResponse.json(
        { error: 'الخيار د مطلوب عند اختيار 4 خيارات' },
        { status: 400 }
      );
    }

    // التحقق من أن الإجابة الصحيحة ضمن الخيارات المتاحة
    const availableOptions = ['A', 'B'];
    if (options_count >= 3) availableOptions.push('C');
    if (options_count >= 4) availableOptions.push('D');

    if (!availableOptions.includes(correct_option)) {
      return NextResponse.json(
        { error: 'الإجابة الصحيحة يجب أن تكون ضمن الخيارات المتاحة' },
        { status: 400 }
      );
    }

    const { data: question, error } = await supabase
      .from('questions')
      .insert([{
        quiz_id: quizId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        points: points || 1
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error adding question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
