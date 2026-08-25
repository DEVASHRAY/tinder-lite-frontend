import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileAvatar } from "@/features/profile/profile-avatar";
import { ProfileConstantsCollection } from "@/features/profile/profile.constants";
import { loadViewerProfile } from "@/features/profile/profile.data";
import type { ProfileLoadResult } from "@/features/profile/profile.types";

export const metadata: Metadata = {
  title: "Your profile | Tinder Lite",
  description: "View your Tinder Lite profile details.",
};

const ProfilePage = async () => {
  let result: ProfileLoadResult | null = null;

  try {
    result = await loadViewerProfile();
  } catch (error) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-12 text-zinc-950 sm:px-6">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          {error instanceof Error
            ? "Unable to load your profile"
            : "Unexpected profile failure"}
        </div>
      </main>
    );
  }

  if (
    result.outcome === ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized
  ) {
    redirect("/login");
  }

  if (result.outcome === ProfileConstantsCollection.ProfileLoadOutcome.Failure) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-12 text-zinc-950 sm:px-6">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          {result.message}
        </div>
      </main>
    );
  }

  const { profile } = result;

  return (
    <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#fff8f6] px-4 py-10 text-zinc-950 sm:px-6 sm:py-14">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[#ff9abb]/20 blur-3xl"
      />

      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/85 shadow-[0_35px_100px_-48px_rgba(72,24,49,0.55)] backdrop-blur-xl">
          <div className="relative h-44 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.34),transparent_24%),linear-gradient(120deg,#f32672,#ff6840)]">
            <div
              aria-hidden="true"
              className="absolute -top-20 right-10 size-64 rounded-full border-[44px] border-white/10"
            />
          </div>

          <div className="relative px-6 pb-8 sm:px-10 sm:pb-10">
            <ProfileAvatar
              className="-mt-20 size-36 rounded-[2.25rem] border-4 border-white text-5xl shadow-[0_20px_45px_-20px_rgba(45,20,34,0.65)] sm:size-40"
              name={profile.name}
              photoUrl={profile.photoUrl}
              sizes="160px"
            />

            <div className="mt-6">
              <p className="text-xs font-bold tracking-[0.18em] text-[#d91d60] uppercase">
                Your profile
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {profile.name}
                <span className="ml-3 font-light text-zinc-400">
                  {profile.age}
                </span>
              </h1>
              <p className="mt-3 text-sm text-zinc-500 capitalize">
                {profile.gender}
              </p>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5">
                <dt className="text-xs font-bold tracking-[0.14em] text-zinc-400 uppercase">
                  Email
                </dt>
                <dd className="mt-2 break-all font-medium text-zinc-800">
                  {profile.email}
                </dd>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5">
                <dt className="text-xs font-bold tracking-[0.14em] text-zinc-400 uppercase">
                  Phone
                </dt>
                <dd className="mt-2 font-medium text-zinc-800">
                  {profile.phoneNumber || "Not added"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;

/*
 * Learning notes
 *
 * Server Component profile
 * - Express profile data is fetched and runtime-validated on the server, so this
 *   read-only page adds no page-specific browser JavaScript.
 * - The shared React `cache` call deduplicates this request with the header's
 *   viewer lookup during the same render.
 *
 * Next.js 14.1 comparison
 * - App Router Server Components supported the same server-rendered page model;
 *   Next.js 16 keeps request-time APIs asynchronous and uses the shared Proxy
 *   convention for the optimistic route check.
 */
