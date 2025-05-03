'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Student } from '@/types';
import { use } from 'react';

export default function EditStudentPage({ params }: { params: { studentId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.studentId;

  const [student, setStudent] = useState<Student | null>(null);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch student data
    fetchStudentData();
  }, [studentId, router]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب بيانات الطالب');
      }

      setStudent(data.student);
      setFullName(data.student.full_name);
      setNationalId(data.student.national_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate inputs
      if (!fullName.trim() || !nationalId.trim()) {
        throw new Error('الاسم الكامل ورقم الهوية الوطنية مطلوبان');
      }

      // Submit data
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          national_id: nationalId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث بيانات الطالب');
      }

      // Show success message
      setSuccess('تم تحديث بيانات الطالب بنجاح');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/students');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل بيانات الطالب...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">الطالب غير موجود</h1>
            <p className="mb-6">الطالب الذي تحاول تعديله غير موجود.</p>
            <Button onClick={() => router.push('/admin/students')}>
              العودة إلى إدارة الطلاب
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - تعديل بيانات الطالب"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">تعديل بيانات الطالب</h1>
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

        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <Input
              id="fullName"
              label="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل الاسم الكامل للطالب"
              required
            />

            <Input
              id="nationalId"
              label="رقم الهوية الوطنية"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="أدخل رقم الهوية الوطنية للطالب"
              required
            />

            <div className="flex justify-end gap-4 mt-6">
              <Link href="/admin/students">
                <Button variant="secondary">إلغاء</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
