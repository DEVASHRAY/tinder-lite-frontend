import type { FeedConstantsCollection } from "@/features/feed/feed.constants";
import type { FeedResponse } from "@/features/feed/feed.schemas";

export type FeedProfile = FeedResponse["data"][number];

export type SwipeDirection =
  (typeof FeedConstantsCollection.SwipeDirection)[keyof typeof FeedConstantsCollection.SwipeDirection];

interface FeedLoadSuccess {
  outcome: typeof FeedConstantsCollection.FeedLoadOutcome.Success;
  profiles: FeedProfile[];
}

interface FeedLoadUnauthorized {
  outcome: typeof FeedConstantsCollection.FeedLoadOutcome.Unauthorized;
}

interface FeedLoadFailure {
  message: string;
  outcome: typeof FeedConstantsCollection.FeedLoadOutcome.Failure;
}

export type FeedLoadResult =
  | FeedLoadFailure
  | FeedLoadSuccess
  | FeedLoadUnauthorized;

export interface LoadFeedInput {
  limit: number;
  page: number;
}
