import Link from "next/link";
import type { ReactNode } from "react";

import type { ConnectionProfile } from "@/features/connections/connections.schemas";
import { ProfilePortrait } from "@/features/profile/profile-portrait";

interface ConnectionPortraitCardProps {
  actions?: ReactNode;
  badge: string;
  profile: ConnectionProfile;
}

export const ConnectionPortraitCard = ({
  actions,
  badge,
  profile,
}: ConnectionPortraitCardProps) => {
  return (
    <li>
      <article className="relative">
        <Link
          href={`/people/${profile.id}`}
          className="block overflow-hidden rounded-[1.8rem] bg-zinc-200 shadow-[0_22px_60px_-38px_rgba(72,24,49,0.55)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f32672]/20"
        >
          <div className="relative aspect-[3/4]">
            <ProfilePortrait
              name={profile.name}
              photoUrl={profile.photoUrl}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            />
            <div
              className={
                actions
                  ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pt-24 pb-20"
                  : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pt-16 pb-5"
              }
            >
              <p className="inline-flex rounded-full bg-white/18 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-white uppercase backdrop-blur-md">
                {badge}
              </p>
              <h2 className="mt-2 truncate text-2xl leading-tight font-semibold tracking-[-0.04em] text-white">
                {profile.name}, {profile.age}
              </h2>
            </div>
          </div>
        </Link>

        {actions ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
            <div className="pointer-events-auto">{actions}</div>
          </div>
        ) : null}
      </article>
    </li>
  );
};
