"use client";

import { FeedConstantsCollection } from "@/features/feed/feed.constants";

type SwipeDecision =
  (typeof FeedConstantsCollection.SwipeDecision)[keyof typeof FeedConstantsCollection.SwipeDecision];

interface PersistSwipeInput {
  receiverId: string;
  status: SwipeDecision;
}

interface PersistSwipeSuccess {
  outcome: typeof FeedConstantsCollection.SwipeMutationOutcome.Success;
}

interface PersistSwipeUnauthorized {
  outcome: typeof FeedConstantsCollection.SwipeMutationOutcome.Unauthorized;
}

interface PersistSwipeFailure {
  message: string;
  outcome: typeof FeedConstantsCollection.SwipeMutationOutcome.Failure;
}

export type PersistSwipeResult =
  | PersistSwipeFailure
  | PersistSwipeSuccess
  | PersistSwipeUnauthorized;

export const persistSwipeAction = async ({
  receiverId,
  status,
}: PersistSwipeInput): Promise<PersistSwipeResult> => {
  if (!receiverId) {
    return {
      message: "Unable to identify this profile",
      outcome: FeedConstantsCollection.SwipeMutationOutcome.Failure,
    };
  }

  try {
    const response = await fetch("/api/v1/connections", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
        status,
      }),
    });

    if (response.status === 401) {
      return {
        outcome: FeedConstantsCollection.SwipeMutationOutcome.Unauthorized,
      };
    }

    if (response.ok || response.status === 409) {
      return {
        outcome: FeedConstantsCollection.SwipeMutationOutcome.Success,
      };
    }

    return {
      message: "Your choice could not be saved. Please try again.",
      outcome: FeedConstantsCollection.SwipeMutationOutcome.Failure,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to reach the connection service"
          : "Unexpected connection failure",
      outcome: FeedConstantsCollection.SwipeMutationOutcome.Failure,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - This async mutation is called inside a Transition so React can coordinate
 *   pending and optimistic interface state while Express stores the decision.
 * - HTTP 409 is treated as idempotent success because an existing connection
 *   means this profile should already be absent from subsequent feed requests.
 *
 * React 18.2 comparison
 * - React 18 used an event handler with manually coordinated loading, request,
 *   success, and rollback state. React 19 Actions integrate that async lifecycle
 *   with `useTransition` and `useOptimistic`.
 */
