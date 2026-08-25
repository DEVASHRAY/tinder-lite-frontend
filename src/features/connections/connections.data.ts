import "server-only";

import { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import { ConnectionsSchemasCollection } from "@/features/connections/connections.schemas";
import type {
  ConnectionsLoadResult,
  LoadConnectionsInput,
} from "@/features/connections/connections.types";
import { requestBackend } from "@/lib/server/backend-client";
import { getAuthenticationCookieHeader } from "@/lib/server/session";

export const loadConnections = async ({
  connectionType,
}: LoadConnectionsInput): Promise<ConnectionsLoadResult> => {
  const searchParams = new URLSearchParams({
    connectionType,
  });

  try {
    const cookieHeader = await getAuthenticationCookieHeader();

    if (!cookieHeader) {
      return {
        outcome:
          ConnectionsConstantsCollection.ConnectionsLoadOutcome.Unauthorized,
      };
    }

    const response = await requestBackend({
      cookie: cookieHeader,
      method: "GET",
      path: `/api/v1/connections?${searchParams.toString()}`,
    });

    if (response.status === 401) {
      return {
        outcome:
          ConnectionsConstantsCollection.ConnectionsLoadOutcome.Unauthorized,
      };
    }

    if (!response.ok) {
      return {
        message: "Your connections are temporarily unavailable",
        outcome: ConnectionsConstantsCollection.ConnectionsLoadOutcome.Failure,
      };
    }

    const parsedResponse = ConnectionsSchemasCollection.response.safeParse(
      await response.json(),
    );

    if (!parsedResponse.success) {
      return {
        message: "Your connections returned an invalid response",
        outcome: ConnectionsConstantsCollection.ConnectionsLoadOutcome.Failure,
      };
    }

    return {
      outcome: ConnectionsConstantsCollection.ConnectionsLoadOutcome.Success,
      profiles: parsedResponse.data.data,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to load your connections"
          : "Unexpected connections failure",
      outcome: ConnectionsConstantsCollection.ConnectionsLoadOutcome.Failure,
    };
  }
};
