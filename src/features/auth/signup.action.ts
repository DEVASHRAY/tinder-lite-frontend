"use client";

import { z } from "zod";

import { AuthConstantsCollection } from "@/features/auth/auth.constants";
import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

type UserGender =
  (typeof ProfileConstantsCollection.UserGender)[keyof typeof ProfileConstantsCollection.UserGender];

type UserInterest =
  (typeof ProfileConstantsCollection.UserInterest)[keyof typeof ProfileConstantsCollection.UserInterest];

interface ReadFieldInput {
  formData: FormData;
  name: string;
}

interface SignupPayload {
  age: number;
  bio?: string;
  email: string;
  gender: UserGender;
  interestedIn: UserInterest[];
  jobTitle?: string;
  life?: {
    cinema?: Record<string, string>;
    lifestyle?: Record<string, string>;
  };
  location?: {
    city: string;
  };
  name: string;
  password: string;
}

interface PersistSignupInput {
  payload: SignupPayload;
}

interface SignupSuccess {
  outcome: typeof AuthConstantsCollection.SignupOutcome.Success;
}

interface SignupConflict {
  outcome: typeof AuthConstantsCollection.SignupOutcome.Conflict;
}

interface SignupFailure {
  message: string;
  outcome: typeof AuthConstantsCollection.SignupOutcome.Failure;
}

type SignupResult = SignupConflict | SignupFailure | SignupSuccess;

export interface SignupActionState {
  message: string;
  success: boolean;
}

export const initialSignupActionState: SignupActionState = {
  message: "",
  success: false,
};

const errorResponseSchema = z.object({
  message: z.string(),
});

const readField = ({ formData, name }: ReadFieldInput): string => {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const isUserGender = (value: string): value is UserGender => {
  return Object.values(ProfileConstantsCollection.UserGender).some(
    (option) => option === value,
  );
};

const isUserInterest = (value: string): value is UserInterest => {
  return Object.values(ProfileConstantsCollection.UserInterest).some(
    (interest) => interest === value,
  );
};

const isStrongPassword = ({ password }: { password: string }): boolean => {
  if (password.length < 8 || password.length > 32) {
    return false;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasLower && hasUpper && hasNumber && hasSymbol;
};

const persistSignup = async ({
  payload,
}: PersistSignupInput): Promise<SignupResult> => {
  try {
    const response = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 409) {
      return {
        outcome: AuthConstantsCollection.SignupOutcome.Conflict,
      };
    }

    if (response.ok) {
      return {
        outcome: AuthConstantsCollection.SignupOutcome.Success,
      };
    }

    const parsedError = errorResponseSchema.safeParse(await response.json());

    return {
      message: parsedError.success
        ? parsedError.data.message
        : "That signup could not be completed. Please try again.",
      outcome: AuthConstantsCollection.SignupOutcome.Failure,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to reach the signup service"
          : "Unexpected signup failure",
      outcome: AuthConstantsCollection.SignupOutcome.Failure,
    };
  }
};

export const signupAction = async (
  previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> => {
  const name = readField({ formData, name: "name" });
  const email = readField({ formData, name: "email" });
  const password = formData.get("password");
  const gender = readField({ formData, name: "gender" });
  const ageText = readField({ formData, name: "age" });
  const age = Number.parseInt(ageText, 10);
  const bio = readField({ formData, name: "bio" });
  const jobTitle = readField({ formData, name: "jobTitle" });
  const city = readField({ formData, name: "city" });
  const weekdayPace = readField({ formData, name: "weekdayPace" });
  const socialBattery = readField({ formData, name: "socialBattery" });
  const movieNightStyle = readField({ formData, name: "movieNightStyle" });
  const interestedIn: UserInterest[] = [];

  for (const value of formData.getAll("interestedIn")) {
    if (typeof value === "string" && isUserInterest(value)) {
      interestedIn.push(value);
    }
  }

  if (name.length < 2 || name.length > ProfileConstantsCollection.FieldLimit.Name) {
    return {
      ...previousState,
      message: "Name needs 2 to 50 characters",
      success: false,
    };
  }

  if (!email || !email.includes("@")) {
    return {
      ...previousState,
      message: "Enter a real email",
      success: false,
    };
  }

  if (typeof password !== "string" || !isStrongPassword({ password })) {
    return {
      ...previousState,
      message:
        "Password needs 8–32 characters with upper, lower, a number, and a symbol",
      success: false,
    };
  }

  if (!isUserGender(gender)) {
    return {
      ...previousState,
      message: "Choose how you show up",
      success: false,
    };
  }

  if (!Number.isInteger(age) || age < 18) {
    return {
      ...previousState,
      message: "You need to be 18 or older",
      success: false,
    };
  }

  if (!interestedIn.length) {
    return {
      ...previousState,
      message: "Pick who you want to meet",
      success: false,
    };
  }

  const payload: SignupPayload = {
    age,
    email,
    gender,
    interestedIn,
    name,
    password,
  };

  if (bio) {
    payload.bio = bio;
  }

  if (jobTitle) {
    payload.jobTitle = jobTitle;
  }

  if (city) {
    payload.location = { city };
  }

  const lifestyle: Record<string, string> = {};
  const cinema: Record<string, string> = {};

  if (weekdayPace) {
    lifestyle.weekdayPace = weekdayPace;
  }

  if (socialBattery) {
    lifestyle.socialBattery = socialBattery;
  }

  if (movieNightStyle) {
    cinema.movieNightStyle = movieNightStyle;
  }

  if (Object.keys(lifestyle).length || Object.keys(cinema).length) {
    payload.life = {
      ...(Object.keys(cinema).length ? { cinema } : {}),
      ...(Object.keys(lifestyle).length ? { lifestyle } : {}),
    };
  }

  try {
    const result = await persistSignup({ payload });

    if (result.outcome === AuthConstantsCollection.SignupOutcome.Conflict) {
      return {
        ...previousState,
        message: "That email is already on Tinder Lite",
        success: false,
      };
    }

    if (result.outcome === AuthConstantsCollection.SignupOutcome.Failure) {
      return {
        ...previousState,
        message: result.message,
        success: false,
      };
    }

    return {
      message: "You're in",
      success: true,
    };
  } catch (error) {
    return {
      ...previousState,
      message:
        error instanceof Error
          ? "Unable to create your account"
          : "Unexpected signup failure",
      success: false,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - The last signup step submits this Action through `useActionState`. React
 *   passes previous state and `FormData` positionally.
 * - The same-origin POST stores the HTTP-only auth cookie without exposing it
 *   to application JavaScript.
 *
 * React 18.2 comparison
 * - React 18 typically used `onSubmit`, `preventDefault`, and separate pending
 *   state around `fetch`.
 */
