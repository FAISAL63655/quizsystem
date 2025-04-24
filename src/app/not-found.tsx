import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-[#007B5E] mb-2">404</h1>
        <h2 className="text-2xl font-bold text-[#1E293B] mb-4">الصفحة غير موجودة</h2>
        <p className="text-[#64748B] mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/">
          <Button className="w-full">العودة للصفحة الرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
