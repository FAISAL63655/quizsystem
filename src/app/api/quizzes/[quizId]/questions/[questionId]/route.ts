import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string; questionId: string } }
) {
  try {
    const questionId = params.questionId;
    const {
      question_text,
      question_type,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      points
    } = await request.json();

    // التحقق من نص السؤال
    if (!question_text) {
      return NextResponse.json(
        { error: 'نص السؤال مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من نوع السؤال
    if (!question_type || !['multiple_choice', 'true_false'].includes(question_type)) {
      return NextResponse.json(
        { error: 'نوع السؤال غير صالح. يجب أن يكون اختيار متعدد أو صح/خطأ' },
        { status: 400 }
      );
    }

    // Validate correct_option
    if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
      return NextResponse.json(
        { error: 'الإجابة الصحيحة يجب أن تكون A أو B أو C أو D' },
        { status: 400 }
      );
    }

    // إذا كان السؤال من نوع صح/خطأ
    if (question_type === 'true_false') {
      // في حالة سؤال صح/خطأ، نستخدم الخيارات الثابتة
      const trueOption = 'صح';
      const falseOption = 'خطأ';

      // التحقق من أن الإجابة الصحيحة هي A أو B فقط
      if (!['A', 'B'].includes(correct_option)) {
        return NextResponse.json(
          { error: 'الإجابة الصحيحة لسؤال صح/خطأ يجب أن تكون A (صح) أو B (خطأ)' },
          { status: 400 }
        );
      }

      const { data: question, error } = await supabase
        .from('questions')
        .update({
          question_text,
          question_type,
          option_a: trueOption,
          option_b: falseOption,
          option_c: null,
          option_d: null,
          correct_option,
          points: points || 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating true/false question:', error);
        return NextResponse.json(
          { error: 'Error updating question' },
          { status: 500 }
        );
      }

      return NextResponse.json({ question });
    }

    // إذا كان السؤال من نوع اختيار متعدد
    if (question_type === 'multiple_choice') {
      // التحقق من الخيارات المطلوبة
      if (!option_a || !option_b) {
        return NextResponse.json(
          { error: 'الخيارات أ و ب مطلوبة للأسئلة متعددة الخيارات' },
          { status: 400 }
        );
      }

      // تحديد عدد الخيارات
      let optionsCount = 2;
      if (option_c) optionsCount = 3;
      if (option_d) optionsCount = 4;

      // التحقق من أن الإجابة الصحيحة ضمن الخيارات المتاحة
      if (
        (correct_option === 'C' && optionsCount < 3) ||
        (correct_option === 'D' && optionsCount < 4)
      ) {
        return NextResponse.json(
          { error: 'الإجابة الصحيحة يجب أن تكون ضمن الخيارات المتاحة' },
          { status: 400 }
        );
      }

      const { data: question, error } = await supabase
        .from('questions')
        .update({
          question_text,
          question_type,
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
        console.error('Error updating multiple choice question:', error);
        return NextResponse.json(
          { error: 'Error updating question' },
          { status: 500 }
        );
      }

      return NextResponse.json({ question });
    }

    // إذا لم يكن نوع السؤال معروفًا
    return NextResponse.json(
      { error: 'نوع السؤال غير صالح' },
      { status: 400 }
    );
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
