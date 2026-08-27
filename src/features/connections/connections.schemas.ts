import "server-only";

import { z } from "zod";

import { ConnectionsConstantsCollection } from "@/features/connections/connections.constants";
import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

const profile = z.object({
  age: z.number().int().min(18),
  gender: z.enum(ProfileConstantsCollection.UserGender),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(50),
  photoUrl: z.url().optional(),
});

const connection = z.object({
  connectionId: z.string().min(1),
  profile,
});

const response = z.object({
  data: z.array(connection),
  message: z.string(),
});

const peerConnection = z.object({
  connectionId: z.string().min(1),
  status: z.enum(ConnectionsConstantsCollection.ConnectionStatus),
  viewerRole: z.enum(ConnectionsConstantsCollection.ConnectionViewerRole),
});

const peerResponse = z.object({
  data: peerConnection,
  message: z.string(),
});

export type ConnectionProfile = z.infer<typeof profile>;
export type ConnectionItem = z.infer<typeof connection>;
export type PeerConnection = z.infer<typeof peerConnection>;

export const ConnectionsSchemasCollection = {
  peerResponse,
  response,
};
