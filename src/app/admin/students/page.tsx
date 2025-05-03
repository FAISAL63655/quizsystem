'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Student } from '@/types';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch students
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب بيانات الطلاب');
      }

      setStudents(data.students);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الطالب "${studentName}"؟`)) {
      return;
    }

    setError('');
    setSuccess('');
    setDeleting(true);

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حذف الطالب');
      }

      setSuccess('تم حذف الطالب بنجاح');

      // Refresh students list
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل بيانات الطلاب...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - إدارة الطلاب"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
          <div className="flex gap-2">
            <Link href="/admin/students/add">
              <Button>إضافة طالب</Button>
            </Link>
            <Link href="/admin/students/import">
              <Button variant="secondary">استيراد بيانات الطلاب</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {students.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">لم يتم تسجيل أي طلاب حتى الآن.</p>
            <div className="flex justify-center gap-2">
              <Link href="/admin/students/add">
                <Button>إضافة طالب</Button>
              </Link>
              <Link href="/admin/students/import">
                <Button variant="secondary">استيراد بيانات الطلاب</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم الكامل
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الهوية الوطنية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التسجيل
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student.national_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/admin/students/edit/${student.id}`}>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs">
                              تعديل
                            </button>
                          </Link>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
                            onClick={() => handleDeleteStudent(student.id, student.full_name)}
                            disabled={deleting}
                          >
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

        <div className="mt-8">
          <Link href="/admin/dashboard">
            <Button variant="secondary">العودة إلى لوحة التحكم</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
