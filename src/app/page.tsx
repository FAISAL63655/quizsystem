import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#EDF2F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl p-8 text-center bg-white rounded-xl shadow-lg border border-[#E2E8F0] transition-all hover:shadow-xl">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="شعار نظام الاختبارات"
            width={300}
            height={150}
            className="h-auto w-full max-w-[300px] object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-8 text-[#1A2B5F]">اختبار رخصة معلم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href="/student/login" className="block">
            <Button
              variant="primary"
              className="w-full py-4 text-lg font-medium rounded-lg transition-all hover:shadow-md hover:scale-105"
            >
              دخول المعلم
            </Button>
          </Link>

          <Link href="/admin/login" className="block">
            <Button
              variant="secondary"
              className="w-full py-4 text-lg font-medium rounded-lg transition-all hover:shadow-md hover:scale-105"
            >
              دخول الإدارة
            </Button>
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          نظام اختبارات رخصة المعلم
        </p>
      </div>
    </div>
  );
}
