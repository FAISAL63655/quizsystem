'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { use } from 'react';

interface QuestionAnswer {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
  correct_option_arabic: string;
  points: number;
  selected_option: string | null;
  selected_option_arabic: string | null;
  is_correct: boolean;
  points_earned: number;
}

export default function StudentResultsPage({ 
  params 
}: { 
  params: { quizId: string; studentId: string } 
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { quizId, studentId } = unwrappedParams;

  const [student, setStudent] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch student results
    fetchStudentResults();
  }, [quizId, studentId, router]);

  const fetchStudentResults = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/results/${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب نتائج المعلم');
      }

      setStudent(data.student);
      setQuiz(data.quiz);
      setSubmission(data.submission);
      setQuestionAnswers(data.question_answers);
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
        <p className="text-xl">جاري تحميل نتائج المعلم...</p>
      </div>
    );
  }

  if (!student || !quiz || !submission) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="اختبار رخصة معلم" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">النتائج غير موجودة</h1>
            <p className="mb-6">لم يتم العثور على نتائج لهذا المعلم.</p>
            <Link href={`/admin/quizzes/${quizId}/results`}>
              <Button>العودة إلى نتائج الاختبار</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="اختبار رخصة معلم - تفاصيل نتائج المعلم"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">تفاصيل نتائج المعلم</h1>
          <p className="text-gray-600">اختبار: {quiz.title}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* معلومات المعلم */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">معلومات المعلم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">الاسم الكامل</p>
              <p className="text-lg font-bold">{student.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">رقم الهوية</p>
              <p className="text-lg font-bold">{student.national_id}</p>
            </div>
          </div>
        </Card>

        {/* ملخص النتائج */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">ملخص النتائج</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm">الدرجة</p>
              <p className="text-2xl font-bold">
                {submission.total_points} / {submission.total_possible_points}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm">النسبة المئوية</p>
              <p className={`text-2xl font-bold ${getScoreColor(submission.percentage_score)}`}>
                {submission.percentage_score}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm">وقت التقديم</p>
              <p className="text-lg font-bold">{formatDate(submission.submission_time)}</p>
            </div>
          </div>
        </Card>

        {/* تفاصيل الإجابات */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">تفاصيل الإجابات</h2>
          
          {questionAnswers.length === 0 ? (
            <p className="text-center text-gray-600 py-4">لا توجد إجابات مسجلة</p>
          ) : (
            <div className="space-y-6">
              {questionAnswers.map((qa, index) => (
                <div key={qa.question_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">السؤال {index + 1}</h3>
                    <div className={`px-2 py-1 rounded text-sm font-bold ${qa.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {qa.is_correct ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                    </div>
                  </div>
                  
                  <p className="mb-4">{qa.question_text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className={`p-2 rounded ${qa.correct_option === 'A' && qa.selected_option === 'A' ? 'bg-green-100 border border-green-500' : 
                                     qa.selected_option === 'A' ? 'bg-red-100 border border-red-500' : 
                                     qa.correct_option === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}>
                      <span className="font-bold">أ:</span> {qa.option_a}
                      {qa.correct_option === 'A' && <span className="mr-2 text-green-600 text-sm">(الإجابة الصحيحة)</span>}
                      {qa.selected_option === 'A' && <span className="mr-2 text-blue-600 text-sm">(إجابة المعلم)</span>}
                    </div>
                    
                    <div className={`p-2 rounded ${qa.correct_option === 'B' && qa.selected_option === 'B' ? 'bg-green-100 border border-green-500' : 
                                     qa.selected_option === 'B' ? 'bg-red-100 border border-red-500' : 
                                     qa.correct_option === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}>
                      <span className="font-bold">ب:</span> {qa.option_b}
                      {qa.correct_option === 'B' && <span className="mr-2 text-green-600 text-sm">(الإجابة الصحيحة)</span>}
                      {qa.selected_option === 'B' && <span className="mr-2 text-blue-600 text-sm">(إجابة المعلم)</span>}
                    </div>
                    
                    {qa.option_c && (
                      <div className={`p-2 rounded ${qa.correct_option === 'C' && qa.selected_option === 'C' ? 'bg-green-100 border border-green-500' : 
                                       qa.selected_option === 'C' ? 'bg-red-100 border border-red-500' : 
                                       qa.correct_option === 'C' ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}>
                        <span className="font-bold">ج:</span> {qa.option_c}
                        {qa.correct_option === 'C' && <span className="mr-2 text-green-600 text-sm">(الإجابة الصحيحة)</span>}
                        {qa.selected_option === 'C' && <span className="mr-2 text-blue-600 text-sm">(إجابة المعلم)</span>}
                      </div>
                    )}
                    
                    {qa.option_d && (
                      <div className={`p-2 rounded ${qa.correct_option === 'D' && qa.selected_option === 'D' ? 'bg-green-100 border border-green-500' : 
                                       qa.selected_option === 'D' ? 'bg-red-100 border border-red-500' : 
                                       qa.correct_option === 'D' ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}>
                        <span className="font-bold">د:</span> {qa.option_d}
                        {qa.correct_option === 'D' && <span className="mr-2 text-green-600 text-sm">(الإجابة الصحيحة)</span>}
                        {qa.selected_option === 'D' && <span className="mr-2 text-blue-600 text-sm">(إجابة المعلم)</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">الإجابة الصحيحة:</span> الخيار {qa.correct_option_arabic} |
                    <span className="font-semibold mr-2">إجابة المعلم:</span> {qa.selected_option_arabic ? `الخيار ${qa.selected_option_arabic}` : 'لم يجب'} |
                    <span className="font-semibold mr-2">النقاط:</span> {qa.points_earned} / {qa.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex justify-between mt-8">
          <Link href={`/admin/quizzes/${quizId}/results`}>
            <Button variant="secondary">العودة إلى نتائج الاختبار</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="secondary">العودة إلى لوحة التحكم</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
