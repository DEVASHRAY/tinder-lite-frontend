import "server-only";

import { FeedConstantsCollection } from "@/features/feed/feed.constants";
import { FeedSchemasCollection } from "@/features/feed/feed.schemas";
import type {
  FeedLoadResult,
  LoadFeedInput,
} from "@/features/feed/feed.types";
import { requestBackend } from "@/lib/server/backend-client";
import { getAuthenticationCookieHeader } from "@/lib/server/session";

export const loadFeed = async ({
  limit,
  page,
}: LoadFeedInput): Promise<FeedLoadResult> => {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  try {
    const cookieHeader = await getAuthenticationCookieHeader();

    if (!cookieHeader) {
      return {
        outcome: FeedConstantsCollection.FeedLoadOutcome.Unauthorized,
      };
    }

    const response = await requestBackend({
      cookie: cookieHeader,
      method: "GET",
      path: `/api/v1/feed?${searchParams.toString()}`,
    });

    if (response.status === 401) {
      return {
        outcome: FeedConstantsCollection.FeedLoadOutcome.Unauthorized,
      };
    }

    if (!response.ok) {
      return {
        message: "The feed service is temporarily unavailable",
        outcome: FeedConstantsCollection.FeedLoadOutcome.Failure,
      };
    }

    const parsedResponse = FeedSchemasCollection.response.safeParse(
      await response.json(),
    );

    if (!parsedResponse.success) {
      return {
        message: "The feed returned an invalid response",
        outcome: FeedConstantsCollection.FeedLoadOutcome.Failure,
      };
    }

    return {
      outcome: FeedConstantsCollection.FeedLoadOutcome.Success,
      profiles: parsedResponse.data.data,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to load your feed"
          : "Unexpected feed failure",
      outcome: FeedConstantsCollection.FeedLoadOutcome.Failure,
    };
  }
};

/*
 * Learning note
 *
 * This server-only data function owns the complete Express boundary: request
 * construction, HTTP status mapping, runtime validation, and a typed result.
 * UI components never receive a raw `Response` or unvalidated JSON.
 */
