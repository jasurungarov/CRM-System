"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";
import { signInAction, type SignInState } from "@/actions/auth.actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "..." : label}
    </Button>
  );
}

const initialState: SignInState = {};

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-accent" />
          </span>
          <h1 className="font-display text-lg font-semibold">{t("loginTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              {t("email")}
            </label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              {t("password")}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <SubmitButton label={t("loginButton")} />

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
