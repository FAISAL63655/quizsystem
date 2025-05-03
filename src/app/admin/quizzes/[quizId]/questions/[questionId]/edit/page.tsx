'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Question } from '@/types';
import { use } from 'react';

export default function EditQuestion({ params }: { params: { quizId: string; questionId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { quizId, questionId } = unwrappedParams;

  const [question, setQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [points, setPoints] = useState('1');
  const [optionsCount, setOptionsCount] = useState(4); // عدد الخيارات: 2 أو 3 أو 4
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

    // Fetch question data
    fetchQuestionData();
  }, [quizId, questionId, router]);

  const fetchQuestionData = async () => {
    try {
      // First, check if the quiz exists
      const quizResponse = await fetch(`/api/quizzes/${quizId}`);

      if (!quizResponse.ok) {
        throw new Error('Quiz not found');
      }

      // Get all questions for the quiz
      const quizData = await quizResponse.json();
      const questions = quizData.questions;

      // Find the specific question
      const foundQuestion = questions.find((q: Question) => q.id === questionId);

      if (!foundQuestion) {
        throw new Error('Question not found');
      }

      setQuestion(foundQuestion);

      // Set form values
      setQuestionText(foundQuestion.question_text);
      setQuestionType(foundQuestion.question_type || 'multiple_choice'); // Default to multiple_choice for backward compatibility
      setOptionA(foundQuestion.option_a);
      setOptionB(foundQuestion.option_b);
      setOptionC(foundQuestion.option_c);
      setOptionD(foundQuestion.option_d);
      setCorrectOption(foundQuestion.correct_option);
      setPoints(foundQuestion.points.toString());

      // تحديد عدد الخيارات بناءً على البيانات الموجودة
      let count = 2; // الحد الأدنى هو خياران
      if (foundQuestion.option_c) count = 3;
      if (foundQuestion.option_d) count = 4;
      setOptionsCount(count);
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
      // التحقق من نص السؤال
      if (!questionText) {
        throw new Error('نص السؤال مطلوب');
      }

      // إذا كان السؤال من نوع اختيار متعدد
      if (questionType === 'multiple_choice') {
        // التحقق من الحقول المطلوبة بناءً على عدد الخيارات
        if (!optionA || !optionB) {
          throw new Error('الخيارات أ و ب مطلوبة');
        }

        if (optionsCount >= 3 && !optionC) {
          throw new Error('الخيار ج مطلوب عند اختيار 3 خيارات أو أكثر');
        }

        if (optionsCount >= 4 && !optionD) {
          throw new Error('الخيار د مطلوب عند اختيار 4 خيارات');
        }

        // التحقق من أن الإجابة الصحيحة ضمن الخيارات المتاحة
        if (
          (correctOption === 'C' && optionsCount < 3) ||
          (correctOption === 'D' && optionsCount < 4)
        ) {
          throw new Error('الإجابة الصحيحة يجب أن تكون ضمن الخيارات المتاحة');
        }
      } else if (questionType === 'true_false') {
        // التحقق من أن الإجابة الصحيحة هي A أو B فقط
        if (!['A', 'B'].includes(correctOption)) {
          throw new Error('الإجابة الصحيحة لسؤال صح/خطأ يجب أن تكون A (صح) أو B (خطأ)');
        }
      }

      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: questionText,
          question_type: questionType,
          option_a: questionType === 'multiple_choice' ? optionA : 'صح',
          option_b: questionType === 'multiple_choice' ? optionB : 'خطأ',
          option_c: questionType === 'multiple_choice' && optionsCount >= 3 ? optionC : null,
          option_d: questionType === 'multiple_choice' && optionsCount >= 4 ? optionD : null,
          correct_option: correctOption,
          points: parseInt(points),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث السؤال');
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
        <p className="text-xl">جاري تحميل السؤال...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">السؤال غير موجود</h1>
            <p className="mb-6">السؤال الذي تحاول تعديله غير موجود.</p>
            <Button onClick={() => router.push(`/admin/quizzes/${quizId}/questions`)}>
              العودة إلى الأسئلة
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header
        title="نظام الاختبارات - تعديل السؤال"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">تعديل السؤال</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
                نص السؤال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="أدخل نص السؤال"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
                نوع السؤال <span className="text-red-500">*</span>
              </label>
              <select
                id="questionType"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as 'multiple_choice' | 'true_false')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="multiple_choice">اختيار متعدد</option>
                <option value="true_false">صح / خطأ</option>
              </select>
            </div>

            {questionType === 'multiple_choice' && (
              <>
                <div className="mb-4">
                  <label htmlFor="optionsCount" className="block text-sm font-medium text-gray-700 mb-1">
                    عدد الخيارات <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="optionsCount"
                    value={optionsCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setOptionsCount(count);
                      // إذا كان الخيار الصحيح خارج نطاق الخيارات المتاحة، قم بتعيينه إلى الخيار الأخير المتاح
                      if ((correctOption === 'C' && count < 3) || (correctOption === 'D' && count < 4)) {
                        setCorrectOption(count === 2 ? 'B' : 'C');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="2">خياران (أ، ب)</option>
                    <option value="3">ثلاثة خيارات (أ، ب، ج)</option>
                    <option value="4">أربعة خيارات (أ، ب، ج، د)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    id="optionA"
                    label="الخيار أ"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="أدخل الخيار أ"
                    required
                  />

                  <Input
                    id="optionB"
                    label="الخيار ب"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="أدخل الخيار ب"
                    required
                  />

                  {optionsCount >= 3 && (
                    <Input
                      id="optionC"
                      label="الخيار ج"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="أدخل الخيار ج"
                      required
                    />
                  )}

                  {optionsCount >= 4 && (
                    <Input
                      id="optionD"
                      label="الخيار د"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="أدخل الخيار د"
                      required
                    />
                  )}
                </div>
              </>
            )}

            {questionType === 'true_false' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">سيتم استخدام الخيارات التالية تلقائياً:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="font-bold">أ:</span> صح
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="font-bold">ب:</span> خطأ
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="mb-4">
                <label htmlFor="correctOption" className="block text-sm font-medium text-gray-700 mb-1">
                  الإجابة الصحيحة <span className="text-red-500">*</span>
                </label>
                <select
                  id="correctOption"
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {questionType === 'multiple_choice' ? (
                    <>
                      <option value="A">الخيار أ</option>
                      <option value="B">الخيار ب</option>
                      {optionsCount >= 3 && <option value="C">الخيار ج</option>}
                      {optionsCount >= 4 && <option value="D">الخيار د</option>}
                    </>
                  ) : (
                    <>
                      <option value="A">صح</option>
                      <option value="B">خطأ</option>
                    </>
                  )}
                </select>
              </div>

              <Input
                id="points"
                label="النقاط"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="أدخل النقاط"
                required
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
