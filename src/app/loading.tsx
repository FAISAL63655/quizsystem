export default function Loading() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 max-w-md w-full text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#007B5E] border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium text-[#1E293B]">جاري التحميل...</h2>
          <p className="text-[#64748B] mt-2">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    </div>
  );
}
