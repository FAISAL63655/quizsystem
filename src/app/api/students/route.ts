import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { parse } from 'papaparse';

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

// Import students from CSV
export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
