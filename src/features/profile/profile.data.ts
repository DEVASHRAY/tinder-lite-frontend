import "server-only";

import { cache } from "react";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";
import { ProfileSchemasCollection } from "@/features/profile/profile.schemas";
import type {
  LoadPublicProfileInput,
  ProfileLoadResult,
  PublicProfileLoadResult,
} from "@/features/profile/profile.types";
import { requestBackend } from "@/lib/server/backend-client";
import { getAuthenticationCookieHeader } from "@/lib/server/session";

const loadViewerProfileRequest = async (): Promise<ProfileLoadResult> => {
  try {
    const cookieHeader = await getAuthenticationCookieHeader();

    if (!cookieHeader) {
      return {
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized,
      };
    }

    const response = await requestBackend({
      cookie: cookieHeader,
      method: "GET",
      path: "/api/v1/profile",
    });

    if (response.status === 401) {
      return {
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized,
      };
    }

    if (!response.ok) {
      return {
        message: "Your profile is temporarily unavailable",
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
      };
    }

    const parsedResponse = ProfileSchemasCollection.response.safeParse(
      await response.json(),
    );

    if (!parsedResponse.success) {
      return {
        message: "Your profile returned an invalid response",
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
      };
    }

    return {
      outcome: ProfileConstantsCollection.ProfileLoadOutcome.Success,
      profile: parsedResponse.data.data,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to load your profile"
          : "Unexpected profile failure",
      outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
    };
  }
};

export const loadViewerProfile = cache(loadViewerProfileRequest);

const loadPublicProfileById = cache(
  async (id: string): Promise<PublicProfileLoadResult> => {
    try {
      const cookieHeader = await getAuthenticationCookieHeader();

      if (!cookieHeader) {
        return {
          outcome: ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized,
        };
      }

      const response = await requestBackend({
        cookie: cookieHeader,
        method: "GET",
        path: `/api/v1/profile/${encodeURIComponent(id)}`,
      });

      if (response.status === 401) {
        return {
          outcome: ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized,
        };
      }

      if (response.status === 404 || response.status === 422) {
        return {
          outcome: ProfileConstantsCollection.ProfileLoadOutcome.NotFound,
        };
      }

      if (!response.ok) {
        return {
          message: "This profile is temporarily unavailable",
          outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
        };
      }

      const parsedResponse = ProfileSchemasCollection.publicResponse.safeParse(
        await response.json(),
      );

      if (!parsedResponse.success) {
        return {
          message: "This profile returned an invalid response",
          outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
        };
      }

      return {
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Success,
        profile: parsedResponse.data.data,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error
            ? "Unable to load this profile"
            : "Unexpected profile failure",
        outcome: ProfileConstantsCollection.ProfileLoadOutcome.Failure,
      };
    }
  },
);

export const loadPublicProfile = ({
  id,
}: LoadPublicProfileInput): Promise<PublicProfileLoadResult> => {
  return loadPublicProfileById(id);
};

/*
 * Learning notes
 *
 * React 19 `cache`
 * - The shared layout header and `/profile` page can request the same viewer
 *   during one server render without duplicating the Express call.
 * - The person details page also memoizes `GET /api/v1/profile/:id` so metadata
 *   and the page share one Express request during the same render.
 *
 * React 18.2 comparison
 * - Next.js 14.1 commonly relied on framework fetch memoization or experimental
 *   React cache behavior for the same request-scoped deduplication.
 */
