import "server-only";

import { z } from "zod";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

const viewer = z.object({
  age: z.number().int().min(18),
  email: z.email(),
  gender: z.enum(ProfileConstantsCollection.UserGender),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(50),
  phoneNumber: z.string().optional(),
  photoUrl: z.url().optional(),
});

const response = z.object({
  data: viewer,
  message: z.string(),
});

export type ViewerProfile = z.infer<typeof viewer>;

export const ProfileSchemasCollection = {
  response,
};

/*
 * Learning note
 *
 * Express returns runtime JSON, so Zod validates the signed-in profile before
 * Server Components use it. TypeScript alone cannot verify network payloads.
 */
