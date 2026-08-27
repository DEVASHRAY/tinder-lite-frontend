"use client";

import { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import { persistSwipeAction } from "@/features/feed/feed-swipe.action";
import { FeedConstantsCollection } from "@/features/feed/feed.constants";

export interface DecideProfileActionState {
  decision:
    | ""
    | typeof ConnectionsConstantsCollection.ConnectionStatus.Ignored
    | typeof ConnectionsConstantsCollection.ConnectionStatus.Interested;
  message: string;
  success: boolean;
}

export const initialDecideProfileActionState: DecideProfileActionState = {
  decision: "",
  message: "",
  success: false,
};

export const decideProfileAction = async (
  previousState: DecideProfileActionState,
  formData: FormData,
): Promise<DecideProfileActionState> => {
  const receiverId = formData.get("receiverId");
  const status = formData.get("status");

  if (typeof receiverId !== "string" || !receiverId) {
    return {
      ...previousState,
      decision: "",
      message: "Unable to identify this profile",
      success: false,
    };
  }

  if (
    status !==
      ConnectionsConstantsCollection.ConnectionStatus.Interested &&
    status !== ConnectionsConstantsCollection.ConnectionStatus.Ignored
  ) {
    return {
      ...previousState,
      decision: "",
      message: "Choose interested or ignore",
      success: false,
    };
  }

  const swipeStatus =
    status === ConnectionsConstantsCollection.ConnectionStatus.Interested
      ? FeedConstantsCollection.SwipeDecision.Interested
      : FeedConstantsCollection.SwipeDecision.Ignored;

  try {
    const result = await persistSwipeAction({
      receiverId,
      status: swipeStatus,
    });

    if (
      result.outcome === FeedConstantsCollection.SwipeMutationOutcome.Unauthorized
    ) {
      window.location.assign("/login");
      return {
        ...previousState,
        decision: "",
        message: "Please log in again",
        success: false,
      };
    }

    if (
      result.outcome === FeedConstantsCollection.SwipeMutationOutcome.Failure
    ) {
      return {
        ...previousState,
        decision: "",
        message: result.message,
        success: false,
      };
    }

    return {
      decision: status,
      message: "",
      success: true,
    };
  } catch (error) {
    return {
      ...previousState,
      decision: "",
      message:
        error instanceof Error
          ? "Unable to save that choice"
          : "Unexpected connection failure",
      success: false,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - Profile details submit Interested or Ignore through this Action and
 *   `useActionState`. React passes previous state and `FormData` positionally.
 * - The Express create-connection call stays in `persistSwipeAction`, the same
 *   mutation the feed swipe deck uses.
 *
 * React 18.2 comparison
 * - React 18 typically used `onClick` handlers and a local pending flag for
 *   the same POST.
 */
