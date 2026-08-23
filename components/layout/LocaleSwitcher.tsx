"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<string, string> = {
  uz: "O'zbek",
  en: "English",
  ru: "Русский",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium hover:bg-secondary">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="min-w-[140px] rounded-md border border-border bg-card p-1 shadow-md"
        >
          {routing.locales.map((l) => (
            <DropdownMenu.Item
              key={l}
              onSelect={() => router.replace(pathname, { locale: l })}
              className={cn(
                "cursor-pointer rounded-sm px-2.5 py-1.5 text-sm outline-none hover:bg-secondary",
                l === locale && "font-semibold text-primary"
              )}
            >
              {LOCALE_LABELS[l]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
