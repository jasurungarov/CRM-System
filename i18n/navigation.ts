import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link, redirect, usePathname, useRouter — komponentlarda shulardan foydalaniladi
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
