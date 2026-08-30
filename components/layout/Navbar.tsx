"use client";

import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckCircle2, KeyRound, LogOut, Send, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TelegramLinkModal } from "../auth/TelegramLinkModal";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

type Role = "admin" | "manager" | "consultant";

export function Navbar({
  role,
  fullName,
  telegramChatId,
  onLogout,
}: {
  role: Role;
  fullName: string;
  telegramChatId: string | null;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const isTelegramLinked = Boolean(telegramChatId);
  const tTelegram = useTranslations("telegramLink");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:px-6">
      <MobileNav role={role} />

      <div className="flex-1" />

      <NotificationBell />
      <LocaleSwitcher />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-secondary">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">
                {fullName}
              </span>
              <span className="block text-xs text-muted-foreground leading-tight">
                {t(`roles.${role}`)}
              </span>
            </span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="min-w-[200px] mt-4 rounded-md border border-border bg-card p-1 shadow-md">
            <DropdownMenu.Item
              onSelect={() => setPasswordModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-none hover:bg-secondary">
              <KeyRound className="h-4 w-4" />
              {t("nav.changePassword")}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => setTelegramModalOpen(true)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-sm outline-none hover:bg-secondary">
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {tTelegram("menuItem")}
              </span>
              {isTelegramLinked && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={onLogout}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-destructive outline-none hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ChangePasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
      <TelegramLinkModal
        open={telegramModalOpen}
        onOpenChange={setTelegramModalOpen}
        currentChatId={telegramChatId}
      />
    </header>
  );
}
