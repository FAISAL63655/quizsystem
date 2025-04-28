'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { use } from 'react';

interface QuizResult {
  submission_id: string;
  student_id: string;
  full_name: string;
  national_id: string;
  total_points: number;
  percentage_score: number;
  submission_time: string;
}

interface Statistics {
  total_submissions: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_possible_points: number;
}

export default function QuizResultsPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.quizId;

  const [quiz, setQuiz] = useState<any>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch quiz results
    fetchQuizResults();
  }, [quizId, router]);

  const fetchQuizResults = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/results`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب نتائج الاختبار');
      }

      setQuiz(data.quiz);
      setResults(data.results);
      setStatistics(data.statistics);
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

  const filteredResults = results.filter(result => 
    result.full_name.includes(searchTerm) || 
    result.national_id.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل نتائج الاختبار...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="اختبار رخصة معلم" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">الاختبار غير موجود</h1>
            <p className="mb-6">الاختبار الذي تبحث عنه غير موجود.</p>
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
        title="اختبار رخصة معلم - نتائج الاختبار"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">نتائج الاختبار: {quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* إحصائيات الاختبار */}
        {statistics && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">إحصائيات الاختبار</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">عدد المشاركين</p>
                <p className="text-2xl font-bold">{statistics.total_submissions}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">متوسط الدرجات</p>
                <p className={`text-2xl font-bold ${getScoreColor(statistics.average_score)}`}>
                  {statistics.average_score}%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">أعلى درجة</p>
                <p className={`text-2xl font-bold ${getScoreColor(statistics.highest_score)}`}>
                  {statistics.highest_score}%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">أدنى درجة</p>
                <p className={`text-2xl font-bold ${getScoreColor(statistics.lowest_score)}`}>
                  {statistics.lowest_score}%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">إجمالي النقاط</p>
                <p className="text-2xl font-bold">{statistics.total_possible_points}</p>
              </div>
            </div>
          </Card>
        )}

        {/* بحث عن معلم */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ابحث باسم المعلم أو رقم الهوية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* جدول النتائج */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">نتائج المعلمين ({filteredResults.length})</h2>
          
          {filteredResults.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يقم أي معلم بإكمال الاختبار بعد'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم الكامل
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الهوية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدرجة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النسبة المئوية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وقت التقديم
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التفاصيل
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.submission_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {result.national_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {result.total_points} / {statistics?.total_possible_points}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${getScoreColor(result.percentage_score)}`}>
                          {result.percentage_score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(result.submission_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/quizzes/${quizId}/results/${result.student_id}`}>
                          <Button variant="secondary" className="text-xs py-1 px-2">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex justify-between mt-8">
          <Link href={`/admin/quizzes/${quizId}/questions`}>
            <Button variant="secondary">العودة إلى الأسئلة</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="secondary">العودة إلى لوحة التحكم</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
