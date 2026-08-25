import { redirect } from "next/navigation";

import { FeedConstantsCollection } from "@/features/feed/feed.constants";
import { loadFeed } from "@/features/feed/feed.data";
import { FeedProfileDeck } from "@/features/feed/feed-profile-deck";
import type { FeedLoadResult } from "@/features/feed/feed.types";

interface FeedErrorProps {
  message: string;
}

const FeedError = ({ message }: FeedErrorProps) => {
  return (
    <div
      role="alert"
      className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
    >
      {message}
    </div>
  );
};

export const FeedContent = async () => {
  let result: FeedLoadResult | null = null;

  try {
    result = await loadFeed({
      limit: 10,
      page: 1,
    });
  } catch (error) {
    return (
      <FeedError
        message={
          error instanceof Error
            ? "Unable to load your feed"
            : "Unexpected feed failure"
        }
      />
    );
  }

  if (
    result.outcome === FeedConstantsCollection.FeedLoadOutcome.Unauthorized
  ) {
    redirect("/login");
  }

  if (result.outcome === FeedConstantsCollection.FeedLoadOutcome.Failure) {
    return <FeedError message={result.message} />;
  }

  return (
    <FeedProfileDeck
      key={result.profiles[0]?.id ?? "empty-feed"}
      profiles={result.profiles}
    />
  );
};

/*
 * Learning notes
 *
 * Request-time boundary
 * - The authenticated layout owns the optimistic cookie-presence redirect.
 * - This component owns feed result orchestration and handles an Express 401
 *   when a present cookie is invalid or expired.
 * - Keeping data loading below the page's Suspense boundary allows the static
 *   feed shell to render while request-time work completes.
 *
 * React 18.2 comparison
 * - Suspense existed in React 18; Next.js coordinates this async Server
 *   Component with the page's streaming boundary.
 */
