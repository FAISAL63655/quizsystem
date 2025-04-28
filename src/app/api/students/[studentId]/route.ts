import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'معلم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// Update a student
export async function PATCH(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    const { full_name, national_id } = await request.json();

    if (!full_name || !national_id) {
      return NextResponse.json(
        { error: 'الاسم الكامل ورقم الهوية مطلوبان' },
        { status: 400 }
      );
    }

    // Check if national ID already exists for another student
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('national_id', national_id)
      .neq('id', studentId)
      .single();

    if (existingStudent) {
      return NextResponse.json(
        { error: 'رقم الهوية الوطنية مستخدم بالفعل' },
        { status: 400 }
      );
    }

    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({ full_name, national_id })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'خطأ في تحديث بيانات المعلم' },
        { status: 500 }
      );
    }

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    // Check if student has any quiz submissions
    const { data: submissions, error: checkError } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('student_id', studentId);

    if (submissions && submissions.length > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المعلم لأنه قام بإجراء اختبارات' },
        { status: 400 }
      );
    }

    // Delete student
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      return NextResponse.json(
        { error: 'خطأ في حذف المعلم' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}
