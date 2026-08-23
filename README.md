# Ansor Edu — CRM (Next.js)

Bu loyiha eski Vite+Express CRM'ning to'liq qayta qurilgan versiyasi:
**Next.js (App Router) + React + Tailwind CSS + shadcn/ui uslubi**, backend
ham Next.js'ning o'zi orqali (Server Actions), MongoDB + Cloudflare R2,
3 tilli interfeys (uz/en/ru).

## Loyihaning yakuniy holati (barcha 10 bosqich)

Tugallangan modullar: loyiha skeleti, MongoDB + barcha modellar, Auth + RBAC
(parol almashtirish bilan), Clients + Applications, Payments, Confirmations,
Documents (R2), Notifications + Audit log, Reports (chartlar + Excel
eksport), va Xodimlar boshqaruvi (admin uchun xodim qo'shish/deaktivatsiya/
rol o'zgartirish).

### Bilib qo'yish kerak bo'lgan narsalar (halol eslatma)

- **i18n chuqurligi:** Navigatsiya, autentifikatsiya va umumiy elementlar
  (`messages/*.json`) 3 tilda (uz/en/ru) tayyor va `next-intl` orqali
  ishlaydi. Lekin har bir sahifadagi barcha matnlar (masalan, "Mijozlar",
  "Yangi mijoz qo'shish" kabi UI matnlari va ayniqsa shartnoma/hujjat
  matnlari) hozircha faqat o'zbek tilida yozilgan — bularni ham to'liq
  ingliz/rus tiliga o'tkazish keyingi kichik bosqich sifatida qilinishi
  mumkin. Ayniqsa shartnoma (contract) matnini avtomatik tarjima qilish
  o'rniga, buni yurist bilan tekshirib chiqib, keyin qo'lda kiritish tavsiya
  qilinadi — huquqiy matnlarda noaniq tarjima xavfli.
- **Sinovdan o'tkazilmagan:** Bu kod men tomonimdan `npm install` va real
  MongoDB ulanishi bilan ishga tushirib ko'rilmagan (sandbox muhitida
  internet yo'q edi) — shu sababli kichik xatoliklar chiqishi mumkin.
  Chatda birga sinab, chiqqan xatoларни birma-bir tuzatib boramiz.
- **R2 va Telegram:** `.env` to'ldirilmaguncha hujjat yuklash va avtomatik
  Telegram xabar yuborish ishlamaydi (qolgan hamma narsa ishlaydi).
- Standart admin: `admin@ansoredu.uz` / `ChangeMe123!` — birinchi kirishdan
  keyin Navbar → profil menyusi → "Parolni almashtirish" orqali albatta
  o'zgartiring.

## O'rnatish (o'zingizning kompyuteringizda)

Ishlash muhitida internetga chiqish yo'q edi, shuning uchun
`node_modules` o'rnatilmagan holda yuboriladi. Quyidagilarni bajaring:

```bash
npm install
cp .env.example .env
# .env faylini to'ldiring (MONGODB_URI, JWT_SECRET, R2_*, TELEGRAM_BOT_TOKEN)
npm run dev
```

Brauzerda: http://localhost:3000

## Texnologiyalar

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui uslubidagi komponentlar (Radix UI asosida)
- next-intl — 3 til: o'zbek (standart), ingliz, rus
- MongoDB + Mongoose
- Cloudflare R2 (@aws-sdk/client-s3) — hujjatlar/PDF saqlash
- jose — JWT (auth, 3-bosqichda to'liq ulanadi)

## Papka tuzilishi

```
app/[locale]/(auth)/login          — login sahifasi
app/[locale]/(dashboard)/...       — asosiy tizim sahifalari (himoyalangan)
app/api/confirm/[token]            — mijoz uchun ochiq tasdiqlash havolasi
actions/                           — har bir modul uchun alohida server action fayl
models/                            — Mongoose modellar (AuditLog'da TTL — 7 kun)
components/ui/                     — shadcn-uslubidagi bazaviy komponentlar
components/layout/                 — Sidebar, Navbar, MobileNav (responsive)
i18n/, messages/                   — next-intl sozlamalari va tarjimalar
lib/                               — db.ts, auth.ts, utils.ts
```

## Olib tashlangan funksiyalar (eski loyihadan)

- ❌ Email/SMTP (Nodemailer/Gmail) — tasdiqlash endi faqat Telegram orqali
- ❌ `@google/genai` — kodda ishlatilmagan edi

## Keyingi bosqichlar

2. MongoDB ulanish + barcha Mongoose modellarni ko'chirish
3. Auth + RBAC (admin/menejer/konsultant)
4. Clients + Applications
5. Payments (PIN, PDF chek, tariflar)
6. Confirmations (shartnoma PDF, Telegram-only oqim)
7. Documents (R2)
8. Notifications + Audit log (TTL bilan — tayyor)
9. Reports (charts, Excel/PDF export)
10. i18n tarjimalarni to'liq yakunlash, responsive tekshiruv, yakuniy test
