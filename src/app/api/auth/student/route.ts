import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { full_name, national_id } = await request.json();

    if (!full_name || !national_id) {
      return NextResponse.json(
        { error: 'Full name and national ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('national_id', national_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error checking student information' },
        { status: 500 }
      );
    }

    let student;

    if (existingStudent) {
      // Verify full name matches
      if (existingStudent.full_name.toLowerCase() !== full_name.toLowerCase()) {
        return NextResponse.json(
          { error: 'National ID does not match the provided name' },
          { status: 401 }
        );
      }
      student = existingStudent;
    } else {
      // Create new student
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert([{ full_name, national_id }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Error creating student account' },
          { status: 500 }
        );
      }

      student = newStudent;
    }

    return NextResponse.json({
      student: {
        id: student.id,
        full_name: student.full_name,
        national_id: student.national_id
      }
    });
  } catch (error) {
    console.error('Student authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
