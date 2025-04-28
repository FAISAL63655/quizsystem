'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { username, password });

      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Store admin info in localStorage
      localStorage.setItem('admin', JSON.stringify(data.admin));

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="اختبار رخصة معلم" />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول الإدارة</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error === 'Failed to login' ? 'فشل تسجيل الدخول' :
                 error === 'Invalid username or password' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' :
                 error === 'Internal server error' ? 'خطأ في الخادم الداخلي' :
                 error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                id="username"
                label="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
              />

              <Input
                id="password"
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
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
