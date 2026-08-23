"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

type Role = "admin" | "manager" | "consultant";

export function MobileNav({ role }: { role: Role }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Menyuni ochish"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex h-full w-[82vw] max-w-xs flex-col bg-primary text-primary-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-accent" />
              <Dialog.Title className="font-display font-semibold text-sm">
                Ansor Edu
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Yopish"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
