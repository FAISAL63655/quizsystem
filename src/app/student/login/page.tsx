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
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="اختبار رخصة معلم" />

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Card className="p-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول المعلم</h1>

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
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-[#1A2B5F] hover:underline">
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
