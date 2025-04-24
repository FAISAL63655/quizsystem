# مسابقات المدرسة الإلكترونية

نظام مسابقات تفاعلي للطلاب باللغة العربية.

## الميزات

- واجهة مستخدم كاملة باللغة العربية
- لوحة تحكم للمشرفين لإدارة المسابقات والطلاب
- إمكانية إنشاء مسابقات متعددة
- إمكانية التحكم بعدد خيارات الإجابة (2 أو 3 أو 4 خيارات)
- لوحة متصدرين لعرض نتائج الطلاب
- تسجيل دخول للطلاب والمشرفين
- استيراد بيانات الطلاب من ملفات CSV

## التقنيات المستخدمة

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (قاعدة البيانات والمصادقة)

## التثبيت والتشغيل

1. قم بنسخ المستودع:
```bash
git clone https://github.com/FAISAL63655/quizsystem.git
cd quizsystem
```

2. قم بتثبيت التبعيات:
```bash
npm install
```

3. قم بإنشاء ملف `.env.local` وأضف متغيرات البيئة الخاصة بـ Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. قم بتشغيل الخادم المحلي:
```bash
npm run dev
```

5. افتح المتصفح على العنوان: [http://localhost:3000](http://localhost:3000)

## النشر على Render

1. قم بإنشاء حساب على [Render](https://render.com/)
2. قم بإنشاء خدمة ويب جديدة واختر "Build and deploy from a Git repository"
3. اختر مستودع GitHub الخاص بك
4. قم بتكوين الخدمة:
   - **Name**: quizsystem (أو أي اسم تفضله)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**: أضف متغيرات البيئة الخاصة بـ Supabase

## المساهمة

نرحب بالمساهمات! يرجى إنشاء fork للمستودع وإرسال طلب سحب مع التغييرات المقترحة.

## الإشراف

تحت إشراف رائد النشاط / أ.فيصل الجطيلي
