'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    console.log('Stored admin in dashboard:', storedAdmin);

    if (!storedAdmin) {
      console.log('No admin found in localStorage, redirecting to login');
      router.push('/admin/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(storedAdmin);
      console.log('Parsed admin:', parsedAdmin);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error('Error parsing admin from localStorage:', error);
      router.push('/admin/login');
      return;
    }

    // Fetch quizzes and students count
    fetchQuizzes();
    fetchStudentsCount();
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

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الاختبار؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete quiz');
      }

      // Refresh quizzes
      fetchQuizzes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentsCount = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب بيانات الطلاب');
      }

      setStudentsCount(data.students.length);
    } catch (err: any) {
      console.error('Error fetching students count:', err.message);
      // لا نقوم بتعيين خطأ هنا لتجنب إظهار رسالة خطأ للمستخدم
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 max-w-md w-full text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#007B5E] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-medium text-[#1E293B]">جاري تحميل لوحة التحكم...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#EDF2F7]">
      <Header
        title="اختبار رخصة معلم - لوحة التحكم"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#1A2B5F] relative">
            لوحة التحكم الرئيسية
            <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#1A2B5F] rounded-full"></span>
          </h1>
          <div className="bg-white px-5 py-3 rounded-xl shadow-md border border-[#E2E8F0] transition-all hover:shadow-lg">
            <p className="text-gray-700 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-[#1A2B5F]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              مرحباً، <span className="font-bold text-[#1A2B5F] mr-1">{admin?.username}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border-r-4 border-[#EF4444] text-[#B91C1C] px-5 py-4 rounded-lg mb-8 shadow-md animate-pulse">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error === 'Failed to fetch quizzes' ? 'فشل في جلب الاختبارات' :
               error === 'Failed to delete quiz' ? 'فشل في حذف الاختبار' : error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 border-r-4 border-[#1A2B5F] shadow-md hover:shadow-lg transition-all rounded-xl transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-[#1A2B5F] bg-opacity-10 p-3 rounded-full ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1A2B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1A2B5F]">الاختبارات</h2>
            </div>
            <p className="text-4xl font-bold mb-6 text-gray-800">{quizzes.length}</p>
            <Link href="/admin/quizzes/create">
              <Button className="w-full py-3 rounded-lg transition-all hover:scale-105">إنشاء اختبار جديد</Button>
            </Link>
          </Card>

          <Card className="p-6 border-r-4 border-[#3AA9D9] shadow-md hover:shadow-lg transition-all rounded-xl transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-[#3AA9D9] bg-opacity-10 p-3 rounded-full ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3AA9D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#3AA9D9]">المعلمين</h2>
            </div>
            <p className="text-4xl font-bold mb-6 text-gray-800">{studentsCount}</p>
            <Link href="/admin/students">
              <Button className="w-full py-3 rounded-lg transition-all hover:scale-105">إدارة المعلمين</Button>
            </Link>
          </Card>

          <Card className="p-6 border-r-4 border-[#64748B] shadow-md hover:shadow-lg transition-all rounded-xl transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-[#64748B] bg-opacity-10 p-3 rounded-full ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#64748B]">إجراءات سريعة</h2>
            </div>
            <div className="space-y-3 mt-6">
              <Link href="/admin/students/import">
                <Button variant="secondary" className="w-full py-3 rounded-lg transition-all hover:scale-105">استيراد بيانات المعلمين</Button>
              </Link>
              <Link href="/admin/quizzes/create">
                <Button variant="secondary" className="w-full py-3 rounded-lg transition-all hover:scale-105">إنشاء اختبار</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-[#1A2B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            الاختبارات
          </h2>
          <div className="flex-grow border-t-2 border-[#E2E8F0] mr-4 ml-4"></div>
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-10 text-center shadow-md rounded-xl">
            <div className="py-10 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 mb-6 text-lg">لا توجد اختبارات متاحة حالياً</p>
              <Link href="/admin/quizzes/create">
                <Button className="px-6 py-3 rounded-lg transition-all hover:scale-105">إنشاء أول اختبار</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="shadow-md overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-[#1A2B5F]">
                      العنوان
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-[#1A2B5F]">
                      الوصف
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-[#1A2B5F]">
                      تاريخ الإنشاء
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-[#1A2B5F]">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {quiz.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {quiz.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(quiz.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                            <Button variant="secondary" className="text-xs py-2 px-3 rounded-lg hover:bg-gray-100">
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                تعديل
                              </span>
                            </Button>
                          </Link>
                          <Link href={`/admin/quizzes/${quiz.id}/questions`}>
                            <Button variant="secondary" className="text-xs py-2 px-3 rounded-lg hover:bg-gray-100">
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                الأسئلة
                              </span>
                            </Button>
                          </Link>
                          <Link href={`/admin/quizzes/${quiz.id}/results`}>
                            <Button variant="secondary" className="text-xs py-2 px-3 rounded-lg hover:bg-gray-100">
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                النتائج
                              </span>
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-xs py-2 px-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
