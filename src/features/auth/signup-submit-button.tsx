"use client";

import { useFormStatus } from "react-dom";

interface SignupSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
}

export const SignupSubmitButton = ({
  idleLabel,
  pendingLabel,
}: SignupSubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex min-h-14 w-full items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-zinc-950 shadow-[0_18px_40px_-16px_rgba(255,255,255,0.55)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
};

/*
 * Learning notes
 *
 * React 19 `useFormStatus`
 * - The join button reads the parent signup form's pending state.
 *
 * React 18.2 comparison
 * - React 18 usually passed `pending` down from the form.
 */
