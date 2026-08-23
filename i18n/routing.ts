import { defineRouting } from "next-intl/routing";

// Qo'llab-quvvatlanadigan tillar: o'zbek (standart), ingliz, rus
export const routing = defineRouting({
  locales: ["uz", "en", "ru"],
  defaultLocale: "uz",
  localePrefix: "as-needed", // uz uchun /uz kerak emas, en/ru uchun /en, /ru
});

export type AppLocale = (typeof routing.locales)[number];
