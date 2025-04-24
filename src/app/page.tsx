import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="شعار نظام الاختبارات"
            width={128}
            height={128}
            className="h-32 w-auto"
          />
        </div>
        <h1 className="text-4xl font-bold mb-6 text-[#006A50]">مسابقات المدرسة الإلكترونية</h1>

        <div className="space-y-4 mb-8">
          <Link href="/student/login" className="block">
            <Button variant="primary" className="w-full py-3 text-lg font-medium rounded-md transition-all hover:shadow-md">
              دخول الطالب
            </Button>
          </Link>

          <Link href="/admin/login" className="block">
            <Button variant="secondary" className="w-full py-3 text-lg font-medium rounded-md transition-all hover:shadow-md">
              دخول المشرف
            </Button>
          </Link>

          <Link href="/leaderboard" className="block">
            <button className="w-full py-3 text-lg text-[#007B5E] hover:text-[#006A50] transition-colors">
              لوحة المتصدرين
            </button>
          </Link>
        </div>

        <p className="text-sm text-[#64748B] mt-6 pt-4 border-t border-[#E2E8F0]">
          تحت إشراف رائد النشاط / أ.فيصل الجطيلي
        </p>
      </div>
    </div>
  );
}
