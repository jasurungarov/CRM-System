import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";

function isSupportedLocale(value: string): boolean {
  return (routing.locales as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
      <Toaster richColors position="top-center" />
    </NextIntlClientProvider>
  );
}
