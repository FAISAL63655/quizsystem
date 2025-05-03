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
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB]" style={{ color: '#000000' }}>
      <Header
        title="مسابقات المدرسة الإلكترونية - لوحة التحكم"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-[#007B5E]">لوحة التحكم الرئيسية</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-[#E2E8F0]">
            <p className="text-[#000000] font-medium">
              مرحباً، <span className="font-bold text-[#007B5E]">{admin?.username}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#EF4444] text-[#B91C1C] px-4 py-3 rounded-lg mb-6 shadow-sm">
            {error === 'Failed to fetch quizzes' ? 'فشل في جلب الاختبارات' :
             error === 'Failed to delete quiz' ? 'فشل في حذف الاختبار' : error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card className="p-6 border-t-4 border-t-[#007B5E] shadow-sm hover:shadow-md transition-shadow" style={{ color: '#000000' }}>
            <h2 className="text-xl font-bold mb-4 text-[#007B5E]">الاختبارات</h2>
            <p className="text-4xl font-bold mb-6 text-[#000000]" style={{ color: '#000000 !important' }}>{quizzes.length}</p>
            <Link href="/admin/quizzes/create">
              <Button className="w-full py-3">إنشاء اختبار جديد</Button>
            </Link>
          </Card>

          <Card className="p-6 border-t-4 border-t-[#38BDF8] shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4 text-[#38BDF8]">الطلاب</h2>
            <p className="text-4xl font-bold mb-6 text-[#000000]">{studentsCount}</p>
            <Link href="/admin/students">
              <Button className="w-full py-3">إدارة الطلاب</Button>
            </Link>
          </Card>

          <Card className="p-6 border-t-4 border-t-[#64748B] shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4 text-[#64748B]">إجراءات سريعة</h2>
            <div className="space-y-3 mt-6">
              <Link href="/admin/students/import">
                <Button variant="secondary" className="w-full py-3">استيراد بيانات الطلاب</Button>
              </Link>
              <Link href="/admin/quizzes/create">
                <Button variant="secondary" className="w-full py-3">إنشاء اختبار</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="flex items-center mb-5 mt-2">
          <h2 className="text-2xl font-bold text-[#000000]">الاختبارات</h2>
          <div className="flex-grow border-t border-[#E2E8F0] mr-4 ml-4"></div>
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-8 text-center shadow-sm">
            <div className="py-8">
              <p className="text-[#64748B] mb-6 text-lg">لا توجد اختبارات متاحة.</p>
              <Link href="/admin/quizzes/create">
                <Button className="px-6 py-3">إنشاء أول اختبار</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      العنوان
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      الوصف
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      وقت البدء
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      وقت الانتهاء
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      الحالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#64748B]">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {quizzes.map((quiz) => {
                    // التحقق من وقت البدء والانتهاء
                    const now = new Date();
                    const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
                    const endTime = quiz.end_time ? new Date(quiz.end_time) : null;

                    // حالة الاختبار (قادم، متاح، منتهي)
                    let quizStatus = 'متاح';
                    let statusColor = 'text-green-600';

                    if (startTime && now < startTime) {
                      quizStatus = 'قادم';
                      statusColor = 'text-blue-600';
                    } else if (endTime && now > endTime) {
                      quizStatus = 'منتهي';
                      statusColor = 'text-red-600';
                    }

                    return (
                      <tr key={quiz.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="text-sm font-medium text-[#000000]">
                            {quiz.title}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-sm text-[#64748B]">
                            {quiz.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-sm text-[#64748B]">
                            {startTime ? startTime.toLocaleString('ar-SA') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-sm text-[#64748B]">
                            {endTime ? endTime.toLocaleString('ar-SA') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className={`text-sm font-medium ${statusColor}`}>
                            {quizStatus}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              <Button variant="secondary" className="text-xs py-1.5 px-3">
                                تعديل
                              </Button>
                            </Link>
                            <Link href={`/admin/quizzes/${quiz.id}/questions`}>
                              <Button variant="secondary" className="text-xs py-1.5 px-3">
                                الأسئلة
                              </Button>
                            </Link>
                            <Link href={`/quizzes/${quiz.id}/leaderboard`}>
                              <Button variant="secondary" className="text-xs py-1.5 px-3">
                                المتصدرين
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="text-xs py-1.5 px-3 bg-[#EF4444] text-white rounded-md hover:bg-[#DC2626] transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
