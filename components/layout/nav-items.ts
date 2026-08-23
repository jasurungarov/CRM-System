import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  FileCheck2,
  FolderOpen,
  Bell,
  BarChart3,
  History,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey:
    | "dashboard"
    | "clients"
    | "applications"
    | "payments"
    | "confirmations"
    | "documents"
    | "notifications"
    | "reports"
    | "audit"
    | "staff";
  icon: LucideIcon;
  /** Faqat shu rollarga ko'rinadi. Bo'sh bo'lsa — hammaga ko'rinadi. */
  roles?: Array<"admin" | "manager" | "consultant">;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/clients", labelKey: "clients", icon: Users },
  { href: "/applications", labelKey: "applications", icon: FileText },
  { href: "/payments", labelKey: "payments", icon: Wallet },
  { href: "/confirmations", labelKey: "confirmations", icon: FileCheck2 },
  { href: "/documents", labelKey: "documents", icon: FolderOpen },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  {
    href: "/reports",
    labelKey: "reports",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
  {
    href: "/audit",
    labelKey: "audit",
    icon: History,
    roles: ["admin", "manager"],
  },
  { href: "/staff", labelKey: "staff", icon: UserCog, roles: ["admin"] },
];
