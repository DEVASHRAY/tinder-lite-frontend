import type { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import type {
  ConnectionItem,
  PeerConnection,
} from "@/features/connections/connections.schemas";

export type ConnectionList =
  (typeof ConnectionsConstantsCollection.ConnectionList)[keyof typeof ConnectionsConstantsCollection.ConnectionList];

interface ConnectionsLoadSuccess {
  connections: ConnectionItem[];
  outcome: typeof ConnectionsConstantsCollection.ConnectionsLoadOutcome.Success;
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

export interface LoadPeerConnectionInput {
  peerUserId: string;
}

interface PeerConnectionLoadSuccess {
  connection: PeerConnection;
  outcome: typeof ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Success;
}

interface PeerConnectionLoadMissing {
  outcome: typeof ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Missing;
}

interface PeerConnectionLoadUnauthorized {
  outcome: typeof ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Unauthorized;
}

interface PeerConnectionLoadFailure {
  outcome: typeof ConnectionsConstantsCollection.PeerConnectionLoadOutcome.Failure;
}

export type PeerConnectionLoadResult =
  | PeerConnectionLoadFailure
  | PeerConnectionLoadMissing
  | PeerConnectionLoadSuccess
  | PeerConnectionLoadUnauthorized;
