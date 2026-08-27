"use client";

import { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";

interface ReviewLikeInput {
  connectionId: string;
  status: (typeof ConnectionsConstantsCollection.LikeReviewStatus)[keyof typeof ConnectionsConstantsCollection.LikeReviewStatus];
}

interface ReviewLikeSuccess {
  outcome: typeof ConnectionsConstantsCollection.LikeReviewOutcome.Success;
}

interface ReviewLikeUnauthorized {
  outcome: typeof ConnectionsConstantsCollection.LikeReviewOutcome.Unauthorized;
}

interface ReviewLikeFailure {
  message: string;
  outcome: typeof ConnectionsConstantsCollection.LikeReviewOutcome.Failure;
}

export interface ReviewLikeActionState {
  decision: string;
  message: string;
  success: boolean;
}

export const initialReviewLikeActionState: ReviewLikeActionState = {
  decision: "",
  message: "",
  success: false,
};

export type ReviewLikeResult =
  | ReviewLikeFailure
  | ReviewLikeSuccess
  | ReviewLikeUnauthorized;

const persistLikeReview = async ({
  connectionId,
  status,
}: ReviewLikeInput): Promise<ReviewLikeResult> => {
  try {
    const response = await fetch(
      `/api/v1/connections/${encodeURIComponent(connectionId)}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      },
    );

    if (response.status === 401) {
      return {
        outcome: ConnectionsConstantsCollection.LikeReviewOutcome.Unauthorized,
      };
    }

    if (response.ok) {
      return {
        outcome: ConnectionsConstantsCollection.LikeReviewOutcome.Success,
      };
    }

    return {
      message: "That like could not be updated. Please try again.",
      outcome: ConnectionsConstantsCollection.LikeReviewOutcome.Failure,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to reach the connection service"
          : "Unexpected connection failure",
      outcome: ConnectionsConstantsCollection.LikeReviewOutcome.Failure,
    };
  }
};

export const reviewLikeAction = async (
  previousState: ReviewLikeActionState,
  formData: FormData,
): Promise<ReviewLikeActionState> => {
  const connectionId = formData.get("connectionId");
  const status = formData.get("status");

  if (typeof connectionId !== "string" || !connectionId) {
    return {
      ...previousState,
      decision: "",
      message: "Unable to identify this like",
      success: false,
    };
  }

  if (
    status !== ConnectionsConstantsCollection.LikeReviewStatus.Accepted &&
    status !== ConnectionsConstantsCollection.LikeReviewStatus.Rejected
  ) {
    return {
      ...previousState,
      decision: "",
      message: "Choose accept or reject",
      success: false,
    };
  }

  const result = await persistLikeReview({
    connectionId,
    status,
  });

  if (
    result.outcome ===
    ConnectionsConstantsCollection.LikeReviewOutcome.Unauthorized
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
    result.outcome === ConnectionsConstantsCollection.LikeReviewOutcome.Failure
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
};

/*
 * Learning notes
 *
 * React 19 Action
 * - The Likes you form submits this Action through `useActionState`. React
 *   passes previous state and `FormData` positionally, so named parameters are
 *   not used here.
 * - Accept and reject share one Action. The clicked button's `status` value
 *   decides whether Express stores ACCEPTED or REJECTED.
 *
 * React 18.2 comparison
 * - React 18 typically used `onClick` handlers, `preventDefault`, and separate
 *   pending state for each button.
 */
