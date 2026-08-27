import "server-only";

import { z } from "zod";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

const profile = z.object({
  age: z.number().int().min(18),
  bio: z.string().trim().max(500).optional(),
  gender: z.enum(ProfileConstantsCollection.UserGender),
  id: z.string().min(1),
  jobTitle: z.string().trim().max(80).optional(),
  location: z
    .object({
      city: z.string().trim().max(80).optional(),
    })
    .optional(),
  name: z.string().trim().min(1).max(50),
  photoUrl: z.url().optional(),
});

const response = z.object({
  data: z.array(profile),
  message: z.string(),
});

export type FeedResponse = z.infer<typeof response>;

export const FeedSchemasCollection = {
  response,
};

/*
 * Learning note
 *
 * TypeScript checks code during development but cannot verify network JSON.
 * Zod validates the Express payload at runtime and then infers the matching
 * TypeScript type without a cast. `server-only` keeps this schema out of the
 * browser module graph.
 */
