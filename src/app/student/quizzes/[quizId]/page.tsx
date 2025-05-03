'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { Quiz, Question } from '@/types';
import { use } from 'react';

// وظيفة لتحويل روابط يوتيوب إلى صيغة التضمين
const formatYouTubeUrl = (url: string): string => {
  try {
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
    return url;
  }
};

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  // استخدام React.use() للوصول إلى params
  const { quizId } = use(params);

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

      // بعد تحميل الأسئلة، نقوم بجلب الإجابات السابقة
      if (student) {
        fetchPreviousAnswers(data.questions, student.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // وظيفة لجلب الإجابات السابقة للطالب
  const fetchPreviousAnswers = async (questions: Question[], studentId: string) => {
    try {
      // جلب الإجابات السابقة من الخادم
      const response = await fetch(`/api/quizzes/${quizId}/previous-answers?student_id=${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Error fetching previous answers:', data.error);
        return;
      }

      // تحديث حالة الإجابات المحددة
      if (data.answers && data.answers.length > 0) {
        const answersMap: Record<string, string> = {};

        data.answers.forEach((answer: any) => {
          answersMap[answer.question_id] = answer.selected_option;
        });

        setSelectedOptions(answersMap);
        console.log('Loaded previous answers:', answersMap);
      }
    } catch (error) {
      console.error('Error fetching previous answers:', error);
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

  // التحقق من أن جميع الأسئلة تم الإجابة عليها
  const areAllQuestionsAnswered = () => {
    return questions.every(question => selectedOptions[question.id]);
  };

  const handleSubmitQuiz = async () => {
    if (!student) return;

    // التحقق من أن جميع الأسئلة تم الإجابة عليها
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

      // Redirect to leaderboard
      router.push(`/student/quizzes/${quizId}/leaderboard`);
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
            <Button onClick={() => router.push(`/student/quizzes/${quizId}/leaderboard`)}>
              عرض لوحة المتصدرين
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // التحقق من وقت البدء والانتهاء
  const checkQuizAvailability = () => {
    if (!quiz) return { isAvailable: false, message: 'الاختبار غير موجود' };

    const now = new Date();
    const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
    const endTime = quiz.end_time ? new Date(quiz.end_time) : null;

    if (startTime && now < startTime) {
      return {
        isAvailable: false,
        message: `الاختبار لم يبدأ بعد. سيبدأ في ${startTime.toLocaleString('ar-SA')}`
      };
    }

    if (endTime && now > endTime) {
      return {
        isAvailable: false,
        message: `انتهى وقت الاختبار. انتهى في ${endTime.toLocaleString('ar-SA')}`
      };
    }

    return { isAvailable: true };
  };

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

  // التحقق من توفر الاختبار بناءً على الوقت
  const { isAvailable, message } = checkQuizAvailability();

  if (!isAvailable) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Header title="نظام الاختبارات" showLogout={true} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">الاختبار غير متاح</h1>
            <p className="mb-6">{message}</p>
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
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={formatYouTubeUrl(quiz.video_url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
        )}

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">السؤال {currentQuestionIndex + 1} من {questions.length}</h2>
            <span className="text-sm text-gray-500">النقاط: {currentQuestion.points}</span>
          </div>

          {/* شريط التقدم */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <p className="text-lg mb-6">{currentQuestion.question_text}</p>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((option) => {
              // تحقق من وجود الخيار قبل عرضه
              const optionKey = `option_${option.toLowerCase()}` as keyof Question;
              const optionText = currentQuestion[optionKey] as string | null;

              // تخطي الخيارات الفارغة أو غير الموجودة
              if (!optionText) return null;

              const isSelected = selectedOptions[currentQuestion.id] === option;

              // تحويل الخيارات الإنجليزية إلى عربية
              const arabicOption = option === 'A' ? 'أ' :
                                  option === 'B' ? 'ب' :
                                  option === 'C' ? 'ج' :
                                  option === 'D' ? 'د' : option;

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
                      {arabicOption}
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
              disabled={submitting || !areAllQuestionsAnswered()}
            >
              {submitting ? 'جاري التقديم...' : 'تقديم الاختبار'}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              التالي
            </Button>
          )}
        </div>

        <div className="mt-8">
          <div className="mb-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm inline-block mb-2">
              <p className="text-gray-700 font-medium mb-2">حالة الأسئلة:</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  <div className="w-4 h-4 rounded-full bg-blue-500 ml-2"></div>
                  <span className="font-medium">السؤال الحالي</span>
                </div>
                <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <div className="w-4 h-4 rounded-full bg-green-500 ml-2"></div>
                  <span className="font-medium">تمت الإجابة</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <div className="w-4 h-4 rounded-full bg-gray-200 ml-2"></div>
                  <span className="font-medium">لم تتم الإجابة</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-3 max-w-md justify-center">
                {questions.map((_, index) => {
                  // تحقق من وجود إجابة للسؤال الحالي
                  const questionId = questions[index].id;
                  const isAnswered = selectedOptions[questionId] ? true : false;
                  const isCurrent = index === currentQuestionIndex;

                  // تحديد لون الزر بناءً على حالة السؤال
                  let buttonClass = '';
                  let buttonTitle = '';

                  if (isCurrent) {
                    buttonClass = 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 transform scale-110';
                    buttonTitle = isAnswered ? 'السؤال الحالي - تمت الإجابة' : 'السؤال الحالي - لم تتم الإجابة بعد';
                  } else if (isAnswered) {
                    buttonClass = 'bg-green-500 text-white hover:bg-green-600';
                    buttonTitle = 'تمت الإجابة';
                  } else {
                    buttonClass = 'bg-gray-200 hover:bg-gray-300';
                    buttonTitle = 'لم تتم الإجابة بعد';
                  }

                  return (
                    <button
                      key={index}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all font-bold text-lg ${buttonClass}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                      title={buttonTitle}
                      style={{
                        boxShadow: isCurrent ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : 'none',
                        border: isAnswered && !isCurrent ? '2px solid #10B981' : 'none'
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
