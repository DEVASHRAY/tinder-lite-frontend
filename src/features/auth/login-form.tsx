"use client";

import { redirect } from "next/navigation";
import { useActionState } from "react";

import {
  initialLoginActionState,
  loginAction,
} from "@/features/auth/login.action";
import { LoginSubmitButton } from "@/features/auth/login-submit-button";

interface LoginFormProps {
  defaultEmail?: string;
  defaultPassword?: string;
}

export const LoginForm = ({
  defaultEmail,
  defaultPassword,
}: LoginFormProps) => {
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginActionState,
  );

  if (state.success) {
    redirect("/feed");
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-zinc-800"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          inputMode="email"
          maxLength={254}
          placeholder="you@example.com"
          required
          className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[#fd267a] focus:bg-white focus:ring-4 focus:ring-[#fd267a]/10"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-zinc-800"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue={defaultPassword}
          maxLength={32}
          placeholder="Enter your password"
          required
          className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[#fd267a] focus:bg-white focus:ring-4 focus:ring-[#fd267a]/10"
        />
      </div>

      {state.message ? (
        <p
          id="login-message"
          role={state.success ? "status" : "alert"}
          className={
            state.success
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          }
        >
          {state.message}
        </p>
      ) : null}

      <LoginSubmitButton />
    </form>
  );
};

/*
 * Learning notes
 *
 * React 19 `useActionState`
 * - The hook connects the form Action to its latest result and pending state.
 * - React passes `formAction` to the form and schedules the Action submission.
 * - A successful Action triggers Next.js's render-time Client Component
 *   redirect without adding an Effect solely for navigation.
 *
 * React 18.2 comparison
 * - React 18 commonly used an `onSubmit` handler plus separate `useState`
 *   values for pending and result messages.
 * - This focused Client Component keeps interactive JavaScript out of the
 *   surrounding Server Component page.
 */
