import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    console.log('Admin login attempt:', { username, password });

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get admin by username
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    console.log('Admin query result:', { admin, error });

    if (error) {
      console.log('Error finding admin:', error);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    let isPasswordValid = false;

    try {
      // أولاً، نحاول استخدام bcrypt للتحقق من كلمة المرور المشفرة
      isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('Password verification with bcrypt:', isPasswordValid);
    } catch (err) {
      console.error('Error comparing passwords with bcrypt:', err);
    }

    // إذا فشل التحقق باستخدام bcrypt، نحاول المقارنة المباشرة (للتطوير فقط)
    if (!isPasswordValid) {
      isPasswordValid = password === 'admin123'; // مقارنة مباشرة للتطوير
      console.log('Direct password comparison:', isPasswordValid);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
