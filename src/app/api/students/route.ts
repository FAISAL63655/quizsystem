import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { parse } from 'papaparse';

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

// Get all students
export async function GET() {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Error fetching students' },
        { status: 500 }
      );
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Import students from CSV or add a single student
export async function POST(request: NextRequest) {
  try {
    // Check content type to determine if it's a form or JSON
    const contentType = request.headers.get('content-type') || '';

    // Handle single student addition (JSON)
    if (contentType.includes('application/json')) {
      const { full_name, national_id } = await request.json();

      // Validate required fields
      if (!full_name || !national_id) {
        return NextResponse.json(
          { error: 'الاسم الكامل ورقم الهوية الوطنية مطلوبان' },
          { status: 400 }
        );
      }

      // Insert single student
      const { data: insertedStudent, error } = await supabase
        .from('students')
        .upsert([{
          full_name,
          national_id
        }], {
          onConflict: 'national_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        return NextResponse.json(
          { error: 'خطأ في إضافة الطالب' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'تمت إضافة الطالب بنجاح',
        student: insertedStudent[0]
      }, { status: 201 });
    }
    // Handle CSV import (FormData)
    else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: 'CSV file is required' },
          { status: 400 }
        );
      }

      const csvText = await file.text();

      // Parse CSV
      const { data, errors } = parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Error parsing CSV file' },
          { status: 400 }
        );
      }

      // Validate CSV structure
      const requiredColumns = ['full_name', 'national_id'];
      const hasRequiredColumns = requiredColumns.every(column =>
        Object.keys(data[0]).includes(column)
      );

      if (!hasRequiredColumns) {
        return NextResponse.json(
          { error: 'CSV must include full_name and national_id columns' },
          { status: 400 }
        );
      }

      // Insert students
      const students = data.map((row: any) => ({
        full_name: row.full_name,
        national_id: row.national_id
      }));

      const { data: insertedStudents, error } = await supabase
        .from('students')
        .upsert(students, {
          onConflict: 'national_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        return NextResponse.json(
          { error: 'Error importing students' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Successfully imported ${insertedStudents.length} students`,
        students: insertedStudents
      }, { status: 201 });
    }

    // Invalid content type
    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
