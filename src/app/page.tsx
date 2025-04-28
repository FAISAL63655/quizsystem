import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center">
      <div className="w-full max-w-xl p-8 text-center bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="شعار نظام الاختبارات"
            width={300}
            height={150}
            className="h-auto w-full max-w-[400px]"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-[#1A2B5F]">اختبار رخصة معلم</h1>

        <div className="space-y-4 mb-8">
          <Link href="/student/login" className="block">
            <Button variant="primary" className="w-full py-3 text-lg font-medium rounded-md transition-all hover:shadow-md">
              دخول المعلم
            </Button>
          </Link>

          <Link href="/admin/login" className="block">
            <Button variant="secondary" className="w-full py-3 text-lg font-medium rounded-md transition-all hover:shadow-md">
              دخول الإدارة
            </Button>
          </Link>


        </div>


      </div>
    </div>
  );
}
