"use client";

import { Navbar } from "./Navbar";
import { signOutAction } from "@/actions/auth.actions";
import type { SessionUser } from "@/lib/auth";

export function NavbarWithLogout({ user }: { user: SessionUser }) {
  return (
    <Navbar
      role={user.role}
      fullName={user.fullName}
      onLogout={() => {
        void signOutAction();
      }}
    />
  );
}
