'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz, LeaderboardEntry } from '@/types';
import { use } from 'react';

export default function LeaderboardPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedStudent = localStorage.getItem('student');
    const storedAdmin = localStorage.getItem('admin');

    setIsStudent(!!storedStudent);
    setIsAdmin(!!storedAdmin);

    // Fetch quiz data
    fetchQuizData();

    // Fetch leaderboard data
    fetchLeaderboard();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب الاختبار');
      }

      setQuiz(data.quiz);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/leaderboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب لوحة المتصدرين');
      }

      setLeaderboard(data.leaderboard);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (isStudent) {
      localStorage.removeItem('student');
    } else if (isAdmin) {
      localStorage.removeItem('admin');
    }
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل لوحة المتصدرين...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - لوحة المتصدرين"
        showLogout={isStudent || isAdmin}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">لوحة المتصدرين: {quiz?.title}</h1>
          {quiz?.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {leaderboard.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">لا توجد مشاركات حتى الآن.</p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المركز
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النقاط
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.student_id} className={entry.rank <= 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank <= 3 ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ml-2 ${
                              entry.rank === 1 ? 'bg-yellow-400' :
                              entry.rank === 2 ? 'bg-gray-300' :
                              'bg-yellow-700 text-white'
                            }`}>
                              {entry.rank}
                            </span>
                          ) : (
                            <span className="text-gray-900 font-medium">{entry.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold">
                          {entry.total_points}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="mt-8 flex justify-center gap-4">
          {isStudent && (
            <Button onClick={() => router.push('/student/quizzes')}>
              العودة إلى الاختبارات
            </Button>
          )}
          {isAdmin && (
            <Button onClick={() => router.push('/admin/dashboard')}>
              العودة إلى لوحة التحكم
            </Button>
          )}
          {!isStudent && !isAdmin && (
            <Link href="/">
              <Button>العودة إلى الصفحة الرئيسية</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
