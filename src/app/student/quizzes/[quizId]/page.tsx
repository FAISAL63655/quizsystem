'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz, Question } from '@/types';
import { use } from 'react';

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<{ id: string; full_name: string; national_id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Check if student is logged in
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      router.push('/student/login');
      return;
    }

    setStudent(JSON.parse(storedStudent));

    // Check if already submitted
    const submittedQuizzes = JSON.parse(localStorage.getItem('submittedQuizzes') || '{}');
    if (submittedQuizzes[quizId]) {
      setHasSubmitted(true);
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

  const handleOptionSelect = (questionId: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: option,
    }));

    // Save answer to server
    if (student) {
      saveAnswer(questionId, option);
    }
  };

  const saveAnswer = async (questionId: string, selectedOption: string) => {
    try {
      await fetch(`/api/quizzes/${quizId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student?.id,
          question_id: questionId,
          selected_option: selectedOption,
        }),
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!student) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تقديم الاختبار');
      }

      // Mark as submitted in localStorage
      const submittedQuizzes = JSON.parse(localStorage.getItem('submittedQuizzes') || '{}');
      submittedQuizzes[quizId] = true;
      localStorage.setItem('submittedQuizzes', JSON.stringify(submittedQuizzes));

      setHasSubmitted(true);

      // Redirect to leaderboard
      router.push(`/quizzes/${quizId}/leaderboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    router.push('/');
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">تم تقديم الاختبار مسبقاً</h1>
            <p className="mb-6">لقد قمت بتقديم هذا الاختبار بالفعل.</p>
            <Button onClick={() => router.push(`/quizzes/${quizId}/leaderboard`)}>
              عرض لوحة المتصدرين
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">الاختبار غير موجود</h1>
            <p className="mb-6">الاختبار الذي تبحث عنه غير موجود أو لا يحتوي على أسئلة.</p>
            <Button onClick={() => router.push('/student/quizzes')}>
              العودة إلى الاختبارات
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="نظام الاختبارات - الاختبار" showLogout={true} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {quiz.video_url && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">شاهد الفيديو</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={quiz.video_url.replace('youtube.com/watch?v=', 'youtube.com/embed/')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
        )}

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">السؤال {currentQuestionIndex + 1} من {questions.length}</h2>
            <span className="text-sm text-gray-500">النقاط: {currentQuestion.points}</span>
          </div>

          <p className="text-lg mb-6">{currentQuestion.question_text}</p>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
              const isSelected = selectedOptions[currentQuestion.id] === option;

              return (
                <div
                  key={option}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full ml-3 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}>
                      {option}
                    </div>
                    <span>{optionText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            السابق
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting}
            >
              {submitting ? 'جاري التقديم...' : 'تقديم الاختبار'}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              التالي
            </Button>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : selectedOptions[questions[index].id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
