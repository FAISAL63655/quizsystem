'use client';

import { useEffect } from 'react';
import Button from '@/components/Button';

export default function GlobalError({
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
    <html dir="rtl" lang="ar">
      <body>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-[#EF4444] mb-4">حدث خطأ في النظام</h1>
            <p className="text-[#64748B] mb-6">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
            </p>
            <Button onClick={reset} className="w-full">إعادة المحاولة</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
