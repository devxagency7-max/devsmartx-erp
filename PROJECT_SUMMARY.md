# DevSmartX ERP — ملخص المشروع الكامل

## معلومات المشروع

- **اسم المشروع:** DevSmartX ERP
- **الـ Stack:** React 19 + TypeScript (strict) + Vite + Tailwind CSS v4
- **قاعدة البيانات:** Firebase Firestore
- **الـ Authentication:** Firebase Auth
- **الـ State Management:** TanStack Query (server state) + Zustand (UI filters فقط)
- **اللغات:** عربي (RTL أساسي) + إنجليزي
- **الـ Deployment:** Vercel
- **الـ Repository:** https://github.com/devxagency7-max/devsmartx-erp

---

## البنية العامة للمشروع

```
src/
├── app/
│   ├── providers/        — AuthProvider (يشغّل seed بعد Login)
│   └── router/           — routes.ts, constants.ts
├── core/
│   └── firebase/
│       ├── firebase.ts   — إعداد Firebase App
│       ├── firestore.ts  — export db
│       └── firestoreSeed.ts — يملأ البيانات الأساسية أول مرة
├── features/
│   ├── dashboard/        — DashboardHomePage + useDashboardMetrics
│   └── finance/
│       ├── overview/     — FinanceOverviewPage + useFinanceOverview
│       ├── payment-sources/
│       ├── transactions/
│       ├── workflows/
│       │   ├── expense/  — wizard متعدد الخطوات
│       │   └── shared/   — WorkflowRegistry, types, hooks
│       ├── master-data/  — categories, tags, paymentMethods, costCenters
│       ├── commitments/  — الالتزامات المتكررة
│       └── people/       — الأشخاص + الـ Ledger
└── shared/
    ├── i18n/             — en.ts + ar.ts
    ├── layout/           — Sidebar, Topbar, NavigationConfig
    └── components/       — ui components
```

---

## قواعد ثابتة لا تتغير (CRITICAL CONSTRAINTS)

1. **مصادر الدفع لا تملك رصيد** — لا Opening Balance، لا Current Balance، لا Available Balance
2. **لا تستخدم `wallet` أو `walletId`** — فقط `paymentSource` / `paymentSourceId` / `paymentSourceName`
3. **لا تخترع بيانات** — Empty states صادقة لو فيه مجال فارغ
4. **TanStack Query للـ server state** — Zustand فقط لـ UI filters
5. **العربية أساسية** — RTL، ترجمة كاملة لكل key جديد
6. **العملة الافتراضية: EGP** — (بعض الاشتراكات بالدولار USD موجودة)

---

## Firebase / Firestore

### Collections الموجودة
| Collection | الوصف |
|---|---|
| `paymentSources` | مصادر الدفع (حسابات بنكية، كاش...) |
| `categories` | فئات المعاملات (شجرة) |
| `paymentMethods` | طرق الدفع |
| `partners` | الشركاء (seed فقط — المستخدم يضيف الأشخاص من People) |
| `costCenters` | مراكز التكلفة |
| `tags` | العلامات |
| `transactions` | كل المعاملات المالية |
| `commitments` | الالتزامات المتكررة |
| `commitmentPayments` | مدفوعات الالتزامات |
| `persons` | الأشخاص (شركاء، موظفون، ...) |
| `personLedger` | دفتر حسابات الأشخاص |

### Security Rules
```
allow read, write: if request.auth != null;
```

### Seed Data
`seedFirestoreIfEmpty()` تشتغل مرة واحدة بعد أول login — تملأ:
- 3 payment sources (Main Bank، Petty Cash، USD Reserve)
- 6 categories
- 7 payment methods (Cash, Bank Transfer, Card, Instapay, Vodafone Cash, Cheque, Other)
- 2 partners (seed فقط)
- 3 cost centers
- 3 tags

---

## الـ Modules المكتملة

### 1. Finance Overview (`/finance/overview`)
- KPI cards: إجمالي الإيرادات، المصروفات، الصافي (كل الوقت)
- جدول "حسب مصدر الدفع"
- "أكثر الفئات إنفاقاً" — CSS bars

### 2. Payment Sources (`/finance/payment-sources`)
- CRUD كامل
- لا يوجد أي حقل رصيد — فقط الاسم، النوع، العملة، الحالة

### 3. Transactions (`/finance/transactions`)
- قائمة مع فلاتر متقدمة + Export Excel
- إنشاء معاملة: فورم يدعم أنواع: مصروف، إيراد، تحويل، مرتجع، تسوية
- نوع "مساهمة شريك" **مخفي من الفورم** (يحدث تلقائياً من قسم المساهمين)

### 4. Expenses — Wizard (`/finance/expenses/new`)
- Wizard متعدد الخطوات: الفئة → مصدر الدفع → الدفع → التفاصيل → **المساهمات** → المرفقات → المراجعة
- خطوة "المساهمات": اختيار الشركاء من قاعدة البيانات + تقسيم المبالغ

### 5. Commitments (`/finance/commitments`)
- الالتزامات المتكررة (إيجار، اشتراكات...)
- تسجيل الدفع → يُنشئ transaction تلقائياً
- Export Excel

### 6. People / Persons (`/finance/people`)
- أنواع: Partner, Employee, Contractor, SupplierContact, Other
- لكل شخص: دفتر حسابات (Ledger) يتتبع من يدين لمن
- Export Excel

### 7. Master Data
- Categories (شجرة، ألوان، أيقونات)
- Tags
- Payment Methods
- Cost Centers

### 8. Dashboard (`/`)
- KPIs: إيرادات + مصروفات + صافي الشهر + معاملات معلقة
- Financial Flow Chart (CSS bars)
- Quick Actions
- Upcoming Commitments
- Recent Transactions

---

## Feature: مساهمة الشركاء في المصروف ⭐

### المشكلة التي تحلها
الشركاء أحياناً يدفعون من جيبهم جزءاً أو كل مصروف، فيحتاج النظام يسجّل:
- مين دفع وكام
- هل الشركة مدينة للشريك؟ أو الشريك مدين للشركة؟

### كيف تعمل
1. في فورم المصروف (Wizard أو Transaction Form) — يظهر قسم "المساهمون"
2. تختار الشركاء من الأزرار (مسحوبين من صفحة الأشخاص — نوع Partner)
3. كل شريك يأخذ تلقائياً نصيبه المتساوي (قابل للتعديل يدوياً)
4. زر "تقسيم بالتساوي" يعيد الحساب

### المنطق التلقائي بعد الحفظ
```
نصيب كل شريك = إجمالي المصروف ÷ عدد المساهمين

إذا دفع الشريك > نصيبه:
  → الشركة مدينة له بالفرق (COMPANY_OWES_PERSON) → يُسجَّل في personLedger

إذا دفع الشريك < نصيبه:
  → الشريك مدين للشركة بالفرق (PERSON_OWES_COMPANY) → يُسجَّل في personLedger

إذا دفع الشريك = نصيبه:
  → لا يُسجَّل شيء (settled)
```

### مثال عملي
مصروف 56,800 جنيه — 3 شركاء:
- محمد دفع الكل (56,800) → نصيبه 18,933 → الشركة مدينة له بـ 37,867
- حسن دفع 13,000 → نصيبه 18,933 → هو مدين للشركة بـ 5,933
- عبدالله لم يدفع (0) → هو مدين للشركة بـ 18,933

---

## الملفات المهمة

### Firebase
- `src/core/firebase/firebase.ts` — إعداد App
- `src/core/firebase/firestore.ts` — export `db`
- `src/core/firebase/firestoreSeed.ts` — seed البيانات الأساسية

### Feature المساهمات
- `src/features/finance/workflows/expense/components/wizard/StepPartnerContributions.tsx` — الخطوة في Expense Wizard
- `src/features/finance/transactions/components/PartnerContributionsSection.tsx` — Component مستقل للـ Transaction Form
- `src/features/finance/workflows/expense/hooks/useCreateExpense.ts` — يكتب Ledger entries بعد حفظ المصروف
- `src/features/finance/transactions/hooks/useCreateTransaction.ts` — نفس الـ logic للـ Transaction Form

### الـ Types
- `src/features/finance/workflows/shared/types/workflow.types.ts` — `PartnerContribution` interface
- `src/features/finance/transactions/types/transaction.types.ts` — `PartnerContributionEntry` interface
- `src/features/finance/people/types/person.types.ts` — `LedgerDirection`, `PersonLedgerEntry`

### i18n
- `src/shared/i18n/locales/en.ts` — كل المفاتيح الإنجليزية
- `src/shared/i18n/locales/ar.ts` — كل المفاتيح العربية

---

## الـ Navigation (Sidebar)

```
لوحة التحكم
├── المالية (accordion)
│   ├── نظرة عامة
│   ├── مصادر الدفع
│   ├── المعاملات
│   ├── المصروفات
│   ├── الإيرادات
│   ├── الالتزامات
│   ├── الأشخاص
│   └── البيانات الأساسية (accordion)
│       ├── الفئات
│       ├── العلامات
│       ├── طرق الدفع
│       ├── الشركاء
│       ├── مراكز التكلفة
│       └── العملات
├── CRM (Coming Soon)
├── المشاريع (Coming Soon)
└── النظام
    ├── الإعدادات (Coming Soon)
    ├── المستخدمون (Coming Soon)
    └── الصلاحيات (Coming Soon)
```

---

## Build Status

```
✓ 0 TypeScript errors
✓ Vite build passes
✓ Deployed on Vercel
```

---

## Environment Variables (Vercel + Local .env)

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME=dlwqxcsle
VITE_CLOUDINARY_UPLOAD_PRESET
```

---

## ما لم يُكتمل بعد (Pending)

- **Revenues Wizard** — صفحة الإيرادات موجودة لكن بدون wizard خطوات
- `revenueService.ts` — لا يزال يستخدم `walletId` (Phase 18 remnant) — لم يُصلح
- Export لصفحتي Commitments و People — الكود جاهز لكن لم يُضف الزر بعد
- Categories dropdown في فورم المعاملات — فارغ (يحتاج ربط بـ useCategories)
