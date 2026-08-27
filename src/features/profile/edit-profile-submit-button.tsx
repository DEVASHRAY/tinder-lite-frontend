"use client";

import { useFormStatus } from "react-dom";

interface EditProfileSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
}

export const EditProfileSubmitButton = ({
  idleLabel,
  pendingLabel,
}: EditProfileSubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex min-h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#fd267a] to-[#ff6036] px-8 py-3 font-semibold text-white shadow-[0_14px_30px_-14px_rgba(253,38,122,0.8)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(253,38,122,0.9)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fd267a]/25 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
};

/*
 * Learning notes
 *
 * React 19 `useFormStatus`
 * - The save button reads the parent profile form's pending state instead of
 *   receiving a boolean prop.
 *
 * React 18.2 comparison
 * - React 18 usually passed `pending` down from the form component.
 */
