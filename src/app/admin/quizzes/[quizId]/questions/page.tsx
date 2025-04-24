'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz, Question } from '@/types';
import { use } from 'react';

export default function QuizQuestions({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New question form
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [points, setPoints] = useState('1');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [optionsCount, setOptionsCount] = useState(4); // عدد الخيارات: 2 أو 3 أو 4

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    // Fetch quiz and questions
    fetchQuizData();
  }, [quizId, router]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب الاختبار');
      }

      setQuiz(data.quiz);
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddingQuestion(true);

    try {
      // التحقق من الحقول المطلوبة بناءً على عدد الخيارات
      if (!questionText || !optionA || !optionB) {
        throw new Error('نص السؤال والخيارات أ و ب مطلوبة');
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

      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionsCount >= 3 ? optionC : null,
          option_d: optionsCount >= 4 ? optionD : null,
          correct_option: correctOption,
          points: parseInt(points),
          options_count: optionsCount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إضافة السؤال');
      }

      // Reset form
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');
      setPoints('1');
      setShowForm(false);

      // Refresh questions
      fetchQuizData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل في حذف السؤال');
      }

      // Refresh questions
      fetchQuizData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل الأسئلة...</p>
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
        title="نظام الاختبارات - إدارة الأسئلة"
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">الأسئلة: {quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">الأسئلة ({questions.length})</h2>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'إلغاء' : 'إضافة سؤال'}
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">إضافة سؤال جديد</h3>
              <form onSubmit={handleAddQuestion}>
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
                      <option value="A">الخيار أ</option>
                      <option value="B">الخيار ب</option>
                      {optionsCount >= 3 && <option value="C">الخيار ج</option>}
                      {optionsCount >= 4 && <option value="D">الخيار د</option>}
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

                <div className="flex justify-end">
                  <Button type="submit" disabled={addingQuestion}>
                    {addingQuestion ? 'جاري الإضافة...' : 'إضافة السؤال'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {questions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-4">لم تتم إضافة أسئلة بعد.</p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  أضف سؤالك الأول
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">السؤال {index + 1}</h3>
                    <div className="flex gap-2">
                      <Link href={`/admin/quizzes/${quizId}/questions/${question.id}/edit`}>
                        <Button variant="secondary" className="text-xs py-1 px-2">
                          تعديل
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-xs py-1 px-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <p className="mb-4">{question.question_text}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className={`p-2 rounded ${question.correct_option === 'A' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}>
                      <span className="font-bold">أ:</span> {question.option_a}
                    </div>
                    <div className={`p-2 rounded ${question.correct_option === 'B' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}>
                      <span className="font-bold">ب:</span> {question.option_b}
                    </div>
                    {question.option_c && (
                      <div className={`p-2 rounded ${question.correct_option === 'C' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}>
                        <span className="font-bold">ج:</span> {question.option_c}
                      </div>
                    )}
                    {question.option_d && (
                      <div className={`p-2 rounded ${question.correct_option === 'D' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}>
                        <span className="font-bold">د:</span> {question.option_d}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">الإجابة الصحيحة:</span> الخيار {question.correct_option === 'A' ? 'أ' : question.correct_option === 'B' ? 'ب' : question.correct_option === 'C' ? 'ج' : 'د'} |
                    <span className="font-semibold mr-2">النقاط:</span> {question.points}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Link href="/admin/dashboard">
            <Button variant="secondary">العودة إلى لوحة التحكم</Button>
          </Link>

          {questions.length > 0 && (
            <Link href={`/quizzes/${quizId}/leaderboard`}>
              <Button>عرض لوحة المتصدرين</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
