import "server-only";

import { z } from "zod";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

const photo = z.object({
  sortOrder: z.number().int().min(0),
  url: z.url(),
});

const cinema = z.object({
  comfortMovie: z.string().trim().max(80).optional(),
  currentlyWatching: z.string().trim().max(120).optional(),
  movieNightStyle: z
    .enum(ProfileConstantsCollection.MovieNightStyle)
    .optional(),
});

const lifestyle = z.object({
  homeEnergy: z.enum(ProfileConstantsCollection.HomeEnergy).optional(),
  sleepWindow: z.enum(ProfileConstantsCollection.SleepWindow).optional(),
  socialBattery: z.enum(ProfileConstantsCollection.SocialBattery).optional(),
  sundayRitual: z.string().trim().max(200).optional(),
  weekdayPace: z.enum(ProfileConstantsCollection.WeekdayPace).optional(),
});

const cityLife = z.object({
  cityTheyMiss: z.string().trim().max(80).optional(),
  foodCourage: z.enum(ProfileConstantsCollection.FoodCourage).optional(),
  noiseComfort: z.enum(ProfileConstantsCollection.NoiseComfort).optional(),
});

const texture = z.object({
  conversationFuel: z.string().trim().max(200).optional(),
  currentlyObsessed: z.string().trim().max(120).optional(),
  familyOrbit: z.enum(ProfileConstantsCollection.FamilyOrbit).optional(),
  firstDateSetting: z.string().trim().max(200).optional(),
  offscreenHobby: z.string().trim().max(80).optional(),
  playlistWeather: z.string().trim().max(80).optional(),
});

const life = z.object({
  cinema: cinema.optional(),
  cityLife: cityLife.optional(),
  lifestyle: lifestyle.optional(),
  texture: texture.optional(),
});

const publicProfile = z.object({
  age: z.number().int().min(18),
  bio: z.string().trim().max(500).optional(),
  gender: z.enum(ProfileConstantsCollection.UserGender),
  id: z.string().min(1),
  jobTitle: z.string().trim().max(80).optional(),
  life: life.optional(),
  location: z
    .object({
      city: z.string().trim().max(80).optional(),
    })
    .optional(),
  name: z.string().trim().min(1).max(50),
  photos: z.array(photo).max(6).optional(),
  photoUrl: z.url().optional(),
});

const viewer = publicProfile.extend({
  email: z.email(),
  phoneNumber: z.string().optional(),
});

const publicResponse = z.object({
  data: publicProfile,
  message: z.string(),
});

const response = z.object({
  data: viewer,
  message: z.string(),
});

export type PublicProfile = z.infer<typeof publicProfile>;
export type ViewerProfile = z.infer<typeof viewer>;

export const ProfileSchemasCollection = {
  publicResponse,
  response,
};

/*
 * Learning note
 *
 * Express returns runtime JSON, so Zod validates the signed-in profile before
 * Server Components use it. TypeScript alone cannot verify network payloads.
 */
