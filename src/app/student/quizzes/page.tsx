'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz } from '@/types';

export default function StudentQuizzes() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<{ id: string; full_name: string; national_id: string } | null>(null);

  useEffect(() => {
    // Check if student is logged in
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      router.push('/student/login');
      return;
    }

    setStudent(JSON.parse(storedStudent));

    // Fetch quizzes
    fetchQuizzes();
  }, [router]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quizzes');
      }

      setQuizzes(data.quizzes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل الاختبارات...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - صفحة الطالب"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">الاختبارات المتاحة</h1>
          <div>
            <p className="text-gray-600">
              مرحباً، <span className="font-semibold">{student?.full_name}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error === 'Failed to fetch quizzes' ? 'فشل في جلب الاختبارات' : error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">لا توجد اختبارات متاحة في الوقت الحالي.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              // التحقق من وقت البدء والانتهاء
              const now = new Date();
              const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
              const endTime = quiz.end_time ? new Date(quiz.end_time) : null;

              // حالة الاختبار (قادم، متاح، منتهي)
              let quizStatus = 'متاح';
              let isAvailable = true;

              if (startTime && now < startTime) {
                quizStatus = 'قادم';
                isAvailable = false;
              } else if (endTime && now > endTime) {
                quizStatus = 'منتهي';
                isAvailable = false;
              }

              return (
                <Card key={quiz.id} className="p-6">
                  <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                  )}

                  {/* عرض وقت البدء والانتهاء إذا كانا موجودين */}
                  <div className="text-sm text-gray-500 mb-4">
                    {startTime && (
                      <div className="mb-1">
                        <span className="font-semibold">وقت البدء:</span> {startTime.toLocaleString('ar-SA')}
                      </div>
                    )}
                    {endTime && (
                      <div>
                        <span className="font-semibold">وقت الانتهاء:</span> {endTime.toLocaleString('ar-SA')}
                      </div>
                    )}
                  </div>

                  {/* عرض حالة الاختبار */}
                  <div className={`text-sm mb-4 font-semibold ${
                    quizStatus === 'متاح' ? 'text-green-600' :
                    quizStatus === 'قادم' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    الحالة: {quizStatus}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    {isAvailable ? (
                      <Link href={`/student/quizzes/${quiz.id}`}>
                        <Button>بدء الاختبار</Button>
                      </Link>
                    ) : (
                      <Button disabled={true} className="opacity-50 cursor-not-allowed">
                        {quizStatus === 'قادم' ? 'لم يبدأ بعد' : 'انتهى الاختبار'}
                      </Button>
                    )}
                    <Link href={`/student/quizzes/${quiz.id}/leaderboard`} className="text-blue-600 hover:underline">
                      عرض لوحة المتصدرين
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
