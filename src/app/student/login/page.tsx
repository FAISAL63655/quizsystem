'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';

export default function StudentLogin() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: fullName, national_id: nationalId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Store student info in localStorage
      localStorage.setItem('student', JSON.stringify(data.student));

      // Redirect to quizzes page
      router.push('/student/quizzes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="مسابقات المدرسة الإلكترونية" />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول الطالب</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error === 'Failed to login' ? 'فشل تسجيل الدخول' :
                 error === 'National ID does not match the provided name' ? 'رقم الهوية لا يتطابق مع الاسم المقدم' :
                 error === 'Error checking student information' ? 'خطأ في التحقق من معلومات الطالب' :
                 error === 'Error creating student account' ? 'خطأ في إنشاء حساب الطالب' :
                 error === 'Internal server error' ? 'خطأ في الخادم الداخلي' :
                 error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                id="fullName"
                label="الاسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
              />

              <Input
                id="nationalId"
                label="رقم الهوية الوطنية"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="أدخل رقم الهوية الوطنية"
                required
              />

              <Button
                type="submit"
                className="w-full mt-6 py-3 text-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
