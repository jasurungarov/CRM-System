import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ansor Edu — CRM",
  description: "Ichki boshqaruv tizimi",
  icons: "/logo.png",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

/**
 * Haqiqiy <html>/<body> shu yerda beriladi (Next.js talabi — har bir sahifa
 * ostida bitta <html> bo'lishi kerak). "/[locale]/..." ichidagi sahifalar
 * uchun til NextIntlClientProvider orqali "/[locale]/layout.tsx" da
 * ulanadi; "/confirm/[token]" kabi locale segmentidan tashqaridagi ochiq
 * (public) sahifalar uchun ham shu <html> ishlatiladi — shuning uchun
 * `lang` standart holatda "uz" qilib qo'yilgan.
 */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
