'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';

export default function ImportStudents() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!file) {
        throw new Error('الرجاء اختيار ملف CSV');
      }

      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        throw new Error('الرجاء رفع ملف CSV صالح');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في استيراد بيانات الطلاب');
      }

      setSuccess(data.message || 'تم استيراد بيانات الطلاب بنجاح');
      setFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - استيراد الطلاب"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">استيراد بيانات الطلاب</h1>
          <p className="text-gray-600 mt-2">
            قم برفع ملف CSV يحتوي على معلومات الطلاب. يجب أن يتضمن الملف أعمدة للاسم الكامل (full_name) ورقم الهوية الوطنية (national_id).
          </p>
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملف CSV
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت
                    </p>
                    <p className="text-xs text-gray-500">ملف CSV فقط</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  الملف المحدد: {file.name}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Link href="/admin/students">
                <Button variant="secondary">إلغاء</Button>
              </Link>
              <Button type="submit" disabled={loading || !file}>
                {loading ? 'جاري الاستيراد...' : 'استيراد الطلاب'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">تعليمات تنسيق ملف CSV</h2>
            <p className="mb-4">
              يجب أن يكون ملف CSV الخاص بك بالتنسيق التالي:
            </p>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                full_name,national_id
                محمد أحمد,1234567890
                فاطمة علي,0987654321
                ...
              </pre>
            </div>
            <ul className="list-disc list-inside mt-4 text-sm text-gray-600">
              <li>يجب أن يحتوي الصف الأول على رؤوس الأعمدة</li>
              <li>full_name: الاسم الكامل للطالب</li>
              <li>national_id: رقم الهوية الوطنية للطالب (يجب أن يكون فريدًا)</li>
              <li>تأكد من عدم وجود مسافات إضافية أو أحرف خاصة</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
