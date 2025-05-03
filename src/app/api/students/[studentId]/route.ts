import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Helper function to check if a student has related records
async function hasRelatedRecords(studentId: string) {
  // Check for answers
  const { count: answersCount, error: answersError } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId);
    
  if (answersError) {
    throw new Error('Error checking related answers');
  }
  
  // Check for quiz submissions
  const { count: submissionsCount, error: submissionsError } = await supabase
    .from('quiz_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId);
    
  if (submissionsError) {
    throw new Error('Error checking related submissions');
  }
  
  return (answersCount || 0) > 0 || (submissionsCount || 0) > 0;
}

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
        { error: 'الطالب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'خطأ في النظام' },
      { status: 500 }
    );
  }
}

// Update a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    const { full_name, national_id } = await request.json();

    // Validate required fields
    if (!full_name || !national_id) {
      return NextResponse.json(
        { error: 'الاسم الكامل ورقم الهوية الوطنية مطلوبان' },
        { status: 400 }
      );
    }

    // Check if student exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (checkError) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      );
    }

    // Check if national ID is already used by another student
    if (national_id !== existingStudent.national_id) {
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from('students')
        .select('id')
        .eq('national_id', national_id)
        .neq('id', studentId)
        .single();

      if (!duplicateError && duplicateCheck) {
        return NextResponse.json(
          { error: 'رقم الهوية الوطنية مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }

    // Update student
    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({
        full_name,
        national_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'خطأ في تحديث بيانات الطالب' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'تم تحديث بيانات الطالب بنجاح',
      student: updatedStudent 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'خطأ في النظام' },
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

    // Check if student exists
    const { data: student, error: checkError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (checkError) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      );
    }

    // Check if student has related records
    const hasRelated = await hasRelatedRecords(studentId);
    if (hasRelated) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الطالب لأنه مرتبط بإجابات أو تسليمات اختبارات' },
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
        { error: 'خطأ في حذف الطالب' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'تم حذف الطالب بنجاح' 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'خطأ في النظام' },
      { status: 500 }
    );
  }
}
