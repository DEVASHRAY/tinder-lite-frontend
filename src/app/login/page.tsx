import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Log in | Tinder Lite",
  description: "Log in to discover and connect with new people.",
};

const LoginPage = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const defaultEmail = isDevelopment
    ? process.env["DEV_LOGIN_EMAIL"]
    : undefined;
  const defaultPassword = isDevelopment
    ? process.env["DEV_LOGIN_PASSWORD"]
    : undefined;

  return (
    <main className="relative isolate min-h-svh flex-1 overflow-hidden bg-[#fff8f6] text-zinc-950">
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 size-96 rounded-full bg-[#fd267a]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute right-[-8rem] bottom-[-10rem] size-[28rem] rounded-full bg-[#ff6036]/15 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-svh w-full max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
        <section
          aria-labelledby="brand-heading"
          className="hidden flex-col justify-between px-12 py-12 lg:flex xl:px-20 xl:py-16"
        >
          <div className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fd267a] to-[#ff6036] text-xl text-white shadow-lg shadow-[#fd267a]/20"
            >
              ♥
            </span>
            Tinder Lite
          </div>

          <div className="max-w-xl pb-12">
            <p className="mb-5 text-sm font-bold tracking-[0.22em] text-[#e91e63] uppercase">
              Built for the moment
            </p>
            <h2
              id="brand-heading"
              className="text-5xl leading-[1.03] font-semibold tracking-[-0.045em] xl:text-7xl"
            >
              Less waiting.
              <span className="block bg-gradient-to-r from-[#fd267a] to-[#ff6036] bg-clip-text text-transparent">
                More matching.
              </span>
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-8 text-zinc-600">
              A fast, focused way to discover people worth meeting—without the
              noise getting in the way.
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            Simple by design. Focused on connection.
          </p>
        </section>

        <section
          aria-labelledby="login-heading"
          className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 text-lg font-bold tracking-tight lg:hidden">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fd267a] to-[#ff6036] text-xl text-white shadow-lg shadow-[#fd267a]/20"
              >
                ♥
              </span>
              Tinder Lite
            </div>

            <div className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_30px_80px_-30px_rgba(63,23,40,0.28)] sm:p-10">
              <p className="text-sm font-bold tracking-[0.18em] text-[#e91e63] uppercase">
                Welcome back
              </p>
              <h1
                id="login-heading"
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              >
                Log in to continue
              </h1>
              <p className="mt-3 leading-7 text-zinc-600">
                Your next great conversation could be one sign-in away.
              </p>
              <LoginForm
                defaultEmail={defaultEmail}
                defaultPassword={defaultPassword}
              />
              <p className="mt-6 text-center text-sm text-zinc-500">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-zinc-700 underline-offset-4 hover:text-[#e91e63] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;

/*
 * Learning notes
 *
 * Server Component
 * - App Router pages are Server Components unless `"use client"` is added.
 * - This shell ships no page-specific client JavaScript because it has no
 *   state, events, effects, custom hooks, or browser API usage.
 * - The visual atmosphere uses CSS instead of image assets, avoiding additional
 *   network requests and responsive-image bytes on the authentication path.
 *
 * Metadata
 * - Next.js generates this page's document metadata from the typed `metadata`
 *   export. Next.js 14.1 used the same App Router metadata convention.
 *
 * Development credentials
 * - Git-ignored `.env.local` values prefill the form only in development.
 * - Passing them to the Client Component intentionally exposes them to the
 *   local browser, so production never receives these props.
 */
