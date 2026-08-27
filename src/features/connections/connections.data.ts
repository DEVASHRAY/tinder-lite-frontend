import "server-only";

import { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import { ConnectionsSchemasCollection } from "@/features/connections/connections.schemas";
import type {
  ConnectionsLoadResult,
  LoadConnectionsInput,
  LoadPeerConnectionInput,
  PeerConnectionLoadResult,
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
      connections: parsedResponse.data.data,
      outcome: ConnectionsConstantsCollection.ConnectionsLoadOutcome.Success,
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

export const loadPeerConnection = async ({
  peerUserId,
}: LoadPeerConnectionInput): Promise<PeerConnectionLoadResult> => {
  try {
    const cookieHeader = await getAuthenticationCookieHeader();

    if (!cookieHeader) {
      return {
        outcome:
          ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Unauthorized,
      };
    }

    const response = await requestBackend({
      cookie: cookieHeader,
      method: "GET",
      path: `/api/v1/connections/peer/${encodeURIComponent(peerUserId)}`,
    });

    if (response.status === 401) {
      return {
        outcome:
          ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Unauthorized,
      };
    }

    if (response.status === 404) {
      return {
        outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Missing,
      };
    }

    if (!response.ok) {
      return {
        outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Failure,
      };
    }

    const parsedResponse = ConnectionsSchemasCollection.peerResponse.safeParse(
      await response.json(),
    );

    if (!parsedResponse.success) {
      return {
        outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Failure,
      };
    }

    return {
      connection: parsedResponse.data.data,
      outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Success,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Failure,
      };
    }

    return {
      outcome: ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Failure,
    };
  }
};
