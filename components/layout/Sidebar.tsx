"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { GraduationCap } from "lucide-react";

type Role = "admin" | "manager" | "consultant";

export function Sidebar({ role }: { role: Role }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-primary text-primary-foreground">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <GraduationCap className="h-6 w-6 text-accent" />
        <div className="leading-tight">
          <p className="font-display font-semibold text-sm">Ansor Edu</p>
          <p className="text-[11px] text-primary-foreground/60">CRM</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(item.labelKey)}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
