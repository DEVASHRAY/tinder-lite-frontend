import "server-only";

import { z } from "zod";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

const profile = z.object({
  age: z.number().int().min(18),
  gender: z.enum(ProfileConstantsCollection.UserGender),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(50),
  photoUrl: z.url().optional(),
});

const response = z.object({
  data: z.array(profile),
  message: z.string(),
});

export type ConnectionProfile = z.infer<typeof profile>;

export const ConnectionsSchemasCollection = {
  response,
};
