'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#EF4444] mb-4">حدث خطأ ما!</h1>
        <p className="text-[#64748B] mb-6">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">المحاولة مرة أخرى</Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">العودة للصفحة الرئيسية</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
