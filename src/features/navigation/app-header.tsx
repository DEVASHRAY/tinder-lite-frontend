"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useActionState, type ReactNode } from "react";

import {
  initialLogoutActionState,
  logoutAction,
} from "@/features/auth/logout.action";
import { LogoutSubmitButton } from "@/features/navigation/logout-submit-button";
import { ProfileAvatar } from "@/features/profile/profile-avatar";

interface HeaderLinkProps {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}

interface AppHeaderProps {
  viewer?: {
    name: string;
    photoUrl?: string;
  };
}

const HeaderLink = ({ children, href, icon }: HeaderLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "flex min-h-10 items-center gap-2 rounded-xl bg-[#fff0f5] px-3 text-sm font-semibold text-[#d91d60]"
          : "flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
      }
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
};

export const AppHeader = ({ viewer }: AppHeaderProps) => {
  const pathname = usePathname();
  const [logoutState, logoutFormAction] = useActionState(
    logoutAction,
    initialLogoutActionState,
  );
  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

  if (logoutState.success) {
    redirect("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/feed"
          aria-label="Tinder Lite home"
          className="flex shrink-0 items-center gap-3 font-bold tracking-[-0.02em] focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f32672]/20"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#fd267a] to-[#ff6036] text-lg text-white shadow-[0_8px_20px_-8px_rgba(253,38,122,0.8)]"
          >
            ♥
          </span>
          <span className="hidden sm:inline">Tinder Lite</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex items-center rounded-2xl border border-zinc-200/70 bg-white/70 p-1 shadow-sm"
        >
          <HeaderLink
            href="/feed"
            icon={
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M12 21s-7-4.4-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6.6-7 11-7 11z" />
              </svg>
            }
          >
            Discover
          </HeaderLink>
          <HeaderLink
            href="/connections"
            icon={
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" />
              </svg>
            }
          >
            Connections
          </HeaderLink>
        </nav>

        <div className="relative flex shrink-0 items-center gap-2">
          <Link
            href="/profile"
            aria-label="Your profile"
            aria-current={isProfileActive ? "page" : undefined}
            className={
              isProfileActive
                ? "flex size-10 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm"
                : "flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-400/20"
            }
          >
            {viewer ? (
              <ProfileAvatar
                className="size-full rounded-full text-sm"
                name={viewer.name}
                photoUrl={viewer.photoUrl}
                sizes="40px"
              />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0116 0" />
              </svg>
            )}
          </Link>

          <form action={logoutFormAction}>
            <input type="hidden" name="intent" value="logout" />
            <LogoutSubmitButton />
          </form>

          {logoutState.message ? (
            <p
              role="alert"
              className="absolute top-12 right-0 w-56 rounded-xl border border-rose-200 bg-white px-4 py-3 text-xs font-medium text-rose-700 shadow-xl"
            >
              {logoutState.message}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
};

/*
 * Learning notes
 *
 * Focused Client Component
 * - Route-aware active states and logout form state require browser interaction;
 *   authenticated pages beneath this small header remain Server Components.
 * - `useActionState` exposes the React 19 logout Action result. React 18.2
 *   typically coordinated request and result state with multiple hooks.
 *
 * Next.js versions
 * - `usePathname` provides the active App Router path in both Next.js 14.1 and
 *   16.3. The shared route-group layout keeps this header mounted during
 *   authenticated client navigation.
 */
