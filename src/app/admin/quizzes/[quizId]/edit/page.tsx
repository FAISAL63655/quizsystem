'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz } from '@/types';
import { use } from 'react';

// وظيفة لتحويل روابط يوتيوب إلى صيغة التضمين
const formatYouTubeUrl = (url: string): string => {
  try {
    if (!url) return '';

    // التعامل مع روابط youtube.com/watch?v=
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // التعامل مع روابط youtu.be/
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // إذا كان الرابط بالفعل بصيغة التضمين
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // إذا لم يتم التعرف على صيغة الرابط، نعيد الرابط كما هو
    return url;
  } catch (error) {
    console.error('Error formatting YouTube URL:', error);
    return url || '';
  }
};

export default function EditQuiz({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch quiz data
    fetchQuizData();
  }, [quizId, router]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب الاختبار');
      }

      const fetchedQuiz = data.quiz;
      setQuiz(fetchedQuiz);

      // Set form values
      setTitle(fetchedQuiz.title);
      setDescription(fetchedQuiz.description || '');
      setVideoUrl(fetchedQuiz.video_url || '');

      // Format dates for datetime-local input
      if (fetchedQuiz.start_time) {
        setStartTime(new Date(fetchedQuiz.start_time).toISOString().slice(0, 16));
      }

      if (fetchedQuiz.end_time) {
        setEndTime(new Date(fetchedQuiz.end_time).toISOString().slice(0, 16));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!title) {
        throw new Error('عنوان الاختبار مطلوب');
      }

      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          video_url: videoUrl || null,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث الاختبار');
      }

      // Redirect to questions page
      router.push(`/admin/quizzes/${quizId}/questions`);
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
        <p className="text-xl">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">الاختبار غير موجود</h1>
            <p className="mb-6">الاختبار الذي تحاول تعديله غير موجود.</p>
            <Button onClick={() => router.push('/admin/dashboard')}>
              العودة إلى لوحة التحكم
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - تعديل الاختبار"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">تعديل الاختبار</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <Input
              id="title"
              label="عنوان الاختبار"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الاختبار"
              required
            />

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف الاختبار"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                رابط الفيديو
              </label>
              <input
                id="videoUrl"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="أدخل رابط الفيديو (اختياري)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              {videoUrl && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">معاينة الفيديو:</h3>
                  <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                      src={formatYouTubeUrl(videoUrl)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                      referrerPolicy="strict-origin-when-cross-origin"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="startTime"
                label="وقت البدء"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="حدد وقت البدء (اختياري)"
              />

              <Input
                id="endTime"
                label="وقت الانتهاء"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="حدد وقت الانتهاء (اختياري)"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Link href={`/admin/quizzes/${quizId}/questions`}>
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
