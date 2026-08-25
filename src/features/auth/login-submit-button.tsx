"use client";

import { useFormStatus } from "react-dom";

export const LoginSubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#fd267a] to-[#ff6036] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_-14px_rgba(253,38,122,0.8)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(253,38,122,0.9)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fd267a]/25 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="mr-2 size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          Logging in…
        </>
      ) : (
        <>
          Continue
          <span
            aria-hidden="true"
            className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </>
      )}
    </button>
  );
};

/*
 * Learning notes
 *
 * React 19 `useFormStatus`
 * - The hook reads the nearest parent form's submission state without passing
 *   pending props through the form component.
 * - It must run in a child of the form whose status it observes.
 *
 * React 18.2 comparison
 * - React 18 usually lifted pending state into the form and passed a boolean
 *   prop to the submit button.
 */
