'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz } from '@/types';

export default function LeaderboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch quizzes
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب الاختبارات');
      }

      setQuizzes(data.quizzes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      <Header title="مسابقات المدرسة الإلكترونية - لوحات المتصدرين" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">لوحات المتصدرين</h1>
          <p className="text-gray-600 mt-2">
            اختر اختباراً لعرض لوحة المتصدرين الخاصة به.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">لا توجد اختبارات متاحة.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-6">
                <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                )}
                <Link href={`/quizzes/${quiz.id}/leaderboard`}>
                  <Button className="w-full">عرض لوحة المتصدرين</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="secondary">العودة إلى الصفحة الرئيسية</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
