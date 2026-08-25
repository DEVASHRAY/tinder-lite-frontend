import type { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import type { ConnectionProfile } from "@/features/connections/connections.schemas";

export type ConnectionList =
  (typeof ConnectionsConstantsCollection.ConnectionList)[keyof typeof ConnectionsConstantsCollection.ConnectionList];

interface ConnectionsLoadSuccess {
  outcome: typeof ConnectionsConstantsCollection.ConnectionsLoadOutcome.Success;
  profiles: ConnectionProfile[];
}

interface ConnectionsLoadUnauthorized {
  outcome: typeof ConnectionsConstantsCollection.ConnectionsLoadOutcome.Unauthorized;
}

interface ConnectionsLoadFailure {
  message: string;
  outcome: typeof ConnectionsConstantsCollection.ConnectionsLoadOutcome.Failure;
}

export type ConnectionsLoadResult =
  | ConnectionsLoadFailure
  | ConnectionsLoadSuccess
  | ConnectionsLoadUnauthorized;

export interface LoadConnectionsInput {
  connectionType: ConnectionList;
}
