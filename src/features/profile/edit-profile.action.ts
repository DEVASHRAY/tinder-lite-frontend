"use client";

import { z } from "zod";

import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

interface ReadFieldInput {
  formData: FormData;
  name: string;
}

interface LifeGroup {
  cinema?: Record<string, string>;
  cityLife?: Record<string, string>;
  lifestyle?: Record<string, string>;
  texture?: Record<string, string>;
}

interface ProfileUpdatePayload {
  age: number;
  bio?: string;
  gender: (typeof ProfileConstantsCollection.UserGender)[keyof typeof ProfileConstantsCollection.UserGender];
  interestedIn: (typeof ProfileConstantsCollection.UserInterest)[keyof typeof ProfileConstantsCollection.UserInterest][];
  jobTitle?: string;
  life?: LifeGroup;
  location?: {
    city: string;
  };
  name: string;
  phoneNumber?: string;
}

interface PersistProfileUpdateInput {
  payload: ProfileUpdatePayload;
}

interface ProfileUpdateSuccess {
  outcome: typeof ProfileConstantsCollection.ProfileUpdateOutcome.Success;
}

interface ProfileUpdateUnauthorized {
  outcome: typeof ProfileConstantsCollection.ProfileUpdateOutcome.Unauthorized;
}

interface ProfileUpdateFailure {
  message: string;
  outcome: typeof ProfileConstantsCollection.ProfileUpdateOutcome.Failure;
}

type ProfileUpdateResult =
  | ProfileUpdateFailure
  | ProfileUpdateSuccess
  | ProfileUpdateUnauthorized;

export interface EditProfileActionState {
  message: string;
  success: boolean;
}

export const initialEditProfileActionState: EditProfileActionState = {
  message: "",
  success: false,
};

const updateResponseSchema = z.object({
  message: z.string(),
});

const readField = ({ formData, name }: ReadFieldInput): string => {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const isUserGender = (
  value: string,
): value is (typeof ProfileConstantsCollection.UserGender)[keyof typeof ProfileConstantsCollection.UserGender] => {
  return Object.values(ProfileConstantsCollection.UserGender).some(
    (gender) => gender === value,
  );
};

const isUserInterest = (
  value: string,
): value is (typeof ProfileConstantsCollection.UserInterest)[keyof typeof ProfileConstantsCollection.UserInterest] => {
  return Object.values(ProfileConstantsCollection.UserInterest).some(
    (interest) => interest === value,
  );
};

const buildOptionalObject = ({
  entries,
}: {
  entries: [string, string][];
}): Record<string, string> => {
  const nextEntries = entries.filter(([, value]) => value);

  if (!nextEntries.length) {
    return {};
  }

  return Object.fromEntries(nextEntries);
};

const persistProfileUpdate = async ({
  payload,
}: PersistProfileUpdateInput): Promise<ProfileUpdateResult> => {
  try {
    const response = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      return {
        outcome: ProfileConstantsCollection.ProfileUpdateOutcome.Unauthorized,
      };
    }

    if (response.ok) {
      return {
        outcome: ProfileConstantsCollection.ProfileUpdateOutcome.Success,
      };
    }

    const parsedError = updateResponseSchema.safeParse(await response.json());

    return {
      message: parsedError.success
        ? parsedError.data.message
        : "Your profile could not be saved. Please try again.",
      outcome: ProfileConstantsCollection.ProfileUpdateOutcome.Failure,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to reach the profile service"
          : "Unexpected profile update failure",
      outcome: ProfileConstantsCollection.ProfileUpdateOutcome.Failure,
    };
  }
};

export const editProfileAction = async (
  previousState: EditProfileActionState,
  formData: FormData,
): Promise<EditProfileActionState> => {
  const field = ProfileConstantsCollection.ProfileFormField;
  const name = readField({ formData, name: field.Name });
  const ageText = readField({ formData, name: field.Age });
  const gender = readField({ formData, name: field.Gender });
  const age = Number.parseInt(ageText, 10);

  if (!name || name.length > ProfileConstantsCollection.FieldLimit.Name) {
    return {
      ...previousState,
      message: "Enter a name up to 50 characters",
      success: false,
    };
  }

  if (!Number.isInteger(age) || age < 18) {
    return {
      ...previousState,
      message: "Age must be 18 or older",
      success: false,
    };
  }

  if (!isUserGender(gender)) {
    return {
      ...previousState,
      message: "Choose a gender",
      success: false,
    };
  }

  const interestedIn: (typeof ProfileConstantsCollection.UserInterest)[keyof typeof ProfileConstantsCollection.UserInterest][] =
    [];

  for (const value of formData.getAll(field.InterestedIn)) {
    if (typeof value === "string" && isUserInterest(value)) {
      interestedIn.push(value);
    }
  }

  if (!interestedIn.length) {
    return {
      ...previousState,
      message: "Choose who you want to meet",
      success: false,
    };
  }

  const cinema = buildOptionalObject({
    entries: [
      [field.ComfortMovie, readField({ formData, name: field.ComfortMovie })],
      [
        field.CurrentlyWatching,
        readField({ formData, name: field.CurrentlyWatching }),
      ],
      [
        field.MovieNightStyle,
        readField({ formData, name: field.MovieNightStyle }),
      ],
    ],
  });
  const lifestyle = buildOptionalObject({
    entries: [
      [field.HomeEnergy, readField({ formData, name: field.HomeEnergy })],
      [field.SleepWindow, readField({ formData, name: field.SleepWindow })],
      [field.SocialBattery, readField({ formData, name: field.SocialBattery })],
      [field.SundayRitual, readField({ formData, name: field.SundayRitual })],
      [field.WeekdayPace, readField({ formData, name: field.WeekdayPace })],
    ],
  });
  const cityLife = buildOptionalObject({
    entries: [
      [field.CityTheyMiss, readField({ formData, name: field.CityTheyMiss })],
      [field.FoodCourage, readField({ formData, name: field.FoodCourage })],
      [field.NoiseComfort, readField({ formData, name: field.NoiseComfort })],
    ],
  });
  const texture = buildOptionalObject({
    entries: [
      [
        field.ConversationFuel,
        readField({ formData, name: field.ConversationFuel }),
      ],
      [
        field.CurrentlyObsessed,
        readField({ formData, name: field.CurrentlyObsessed }),
      ],
      [field.FamilyOrbit, readField({ formData, name: field.FamilyOrbit })],
      [
        field.FirstDateSetting,
        readField({ formData, name: field.FirstDateSetting }),
      ],
      [
        field.OffscreenHobby,
        readField({ formData, name: field.OffscreenHobby }),
      ],
      [
        field.PlaylistWeather,
        readField({ formData, name: field.PlaylistWeather }),
      ],
    ],
  });

  const payload: ProfileUpdatePayload = {
    age,
    gender,
    interestedIn,
    name,
  };
  const jobTitle = readField({ formData, name: field.JobTitle });
  const phoneNumber = readField({ formData, name: field.PhoneNumber });
  const bio = readField({ formData, name: field.Bio });
  const city = readField({ formData, name: field.City });
  const life: LifeGroup = {};

  if (jobTitle) {
    payload.jobTitle = jobTitle;
  }

  if (phoneNumber) {
    payload.phoneNumber = phoneNumber;
  }

  if (bio) {
    payload.bio = bio;
  }

  if (city) {
    payload.location = { city };
  }

  if (Object.keys(cinema).length) {
    life.cinema = cinema;
  }

  if (Object.keys(lifestyle).length) {
    life.lifestyle = lifestyle;
  }

  if (Object.keys(cityLife).length) {
    life.cityLife = cityLife;
  }

  if (Object.keys(texture).length) {
    life.texture = texture;
  }

  if (Object.keys(life).length) {
    payload.life = life;
  }

  try {
    const result = await persistProfileUpdate({ payload });

    if (
      result.outcome ===
      ProfileConstantsCollection.ProfileUpdateOutcome.Unauthorized
    ) {
      window.location.assign("/login");
      return {
        ...previousState,
        message: "Please log in again",
        success: false,
      };
    }

    if (
      result.outcome === ProfileConstantsCollection.ProfileUpdateOutcome.Failure
    ) {
      return {
        ...previousState,
        message: result.message,
        success: false,
      };
    }

    return {
      message: "Profile saved",
      success: true,
    };
  } catch (error) {
    return {
      ...previousState,
      message:
        error instanceof Error
          ? "Unable to save your profile"
          : "Unexpected profile update failure",
      success: false,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - The profile editor submits this Action through `useActionState`. React
 *   passes previous state and `FormData` positionally.
 * - The browser PATCH stays same-origin so the auth cookie is sent without
 *   exposing it to application JavaScript.
 *
 * React 18.2 comparison
 * - React 18 typically used `onSubmit`, `preventDefault`, and separate pending
 *   state around `fetch`.
 */
