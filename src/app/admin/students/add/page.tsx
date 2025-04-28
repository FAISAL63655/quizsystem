'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';

export default function AddStudentPage() {
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
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: fullName, national_id: nationalId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إضافة المعلم');
      }

      // Redirect to students page
      router.push('/admin/students');
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
        title="اختبار رخصة معلم - إضافة معلم جديد"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">إضافة معلم جديد</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                id="fullName"
                label="الاسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسم المعلم الكامل"
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

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة المعلم'}
                </Button>
                
                <Link href="/admin/students">
                  <Button variant="secondary" className="flex-1">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
