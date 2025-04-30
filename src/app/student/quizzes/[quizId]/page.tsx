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

  // التحقق من إجابة جميع الأسئلة
  const areAllQuestionsAnswered = () => {
    return questions.every(question => selectedOptions[question.id]);
  };

  const handleSubmitQuiz = async () => {
    if (!student) return;

    // التحقق من إجابة جميع الأسئلة قبل التقديم
    if (!areAllQuestionsAnswered()) {
      setError('يجب الإجابة على جميع الأسئلة قبل تقديم الاختبار');
      return;
    }

    setSubmitting(true);
    setError(''); // مسح أي رسائل خطأ سابقة

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

      // Redirect to quizzes page
      router.push('/student/quizzes');
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
        <Header title="اختبار رخصة معلم" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">تم تقديم الاختبار مسبقاً</h1>
            <p className="mb-6">لقد قمت بتقديم هذا الاختبار بالفعل.</p>
            <Button onClick={() => router.push('/student/quizzes')}>
              العودة إلى الاختبارات
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="اختبار رخصة معلم" showLogout={true} onLogout={handleLogout} />
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
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#EDF2F7]">
      <Header title="اختبار رخصة معلم - الاختبار" showLogout={true} onLogout={handleLogout} />

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

        <Card className="p-6 mb-6 border-r-4 border-[#1A2B5F] shadow-md transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1A2B5F] flex items-center">
              <span className="bg-[#1A2B5F] text-white rounded-full w-8 h-8 flex items-center justify-center ml-2">
                {currentQuestionIndex + 1}
              </span>
              <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
            </h2>
            <span className="text-sm bg-[#1A2B5F] text-white px-3 py-1 rounded-full">النقاط: {currentQuestion.points}</span>
          </div>

          <p className="text-lg mb-6 bg-gray-50 p-4 rounded-lg border-r-2 border-[#1A2B5F]">{currentQuestion.question_text}</p>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((option, index) => {
              // تحويل الحروف اللاتينية إلى عربية
              const arabicOptions = ['أ', 'ب', 'ج', 'د'];
              const arabicOption = arabicOptions[index];

              // الحصول على نص الخيار
              const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string | null;

              // إذا كان الخيار غير موجود (null أو فارغ)، لا تعرضه
              if (!optionText) return null;

              const isSelected = selectedOptions[currentQuestion.id] === option;

              return (
                <div
                  key={option}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E6F7FF] border-[#1A2B5F] shadow-md transform scale-[1.02]'
                      : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option)}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ml-3 ${
                      isSelected ? 'bg-[#1A2B5F] text-white font-bold' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {arabicOption}
                    </div>
                    <span className={isSelected ? 'font-medium' : ''}>{optionText}</span>
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
            <div>
              {!areAllQuestionsAnswered() && (
                <p className="text-red-500 text-sm mb-2">
                  <span className="inline-block ml-1">⚠️</span>
                  يجب الإجابة على جميع الأسئلة قبل تقديم الاختبار
                </p>
              )}
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className={!areAllQuestionsAnswered() ? 'opacity-70' : ''}
              >
                {submitting ? 'جاري التقديم...' : 'تقديم الاختبار'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleNextQuestion}>
              التالي
            </Button>
          )}
        </div>

        <div className="mt-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-sm ml-1"></div>
                <span className="text-sm text-gray-600">لم تتم الإجابة</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-sm ml-1"></div>
                <span className="text-sm text-gray-600">تمت الإجابة</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#1A2B5F] rounded-sm ml-1"></div>
                <span className="text-sm text-gray-600">السؤال الحالي</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all transform ${
                  index === currentQuestionIndex
                    ? 'bg-[#1A2B5F] text-white shadow-lg scale-110 font-bold ring-2 ring-offset-2 ring-[#1A2B5F]'
                    : selectedOptions[questions[index].id]
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
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
