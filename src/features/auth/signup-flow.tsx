"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useOptimistic, useState, type FormEvent } from "react";

import { AuthConstantsCollection } from "@/features/auth/auth.constants";
import { SignupChoice } from "@/features/auth/signup-choice";
import {
  initialSignupActionState,
  signupAction,
} from "@/features/auth/signup.action";
import { SignupSubmitButton } from "@/features/auth/signup-submit-button";
import { ProfileConstantsCollection } from "@/features/profile/profile.constants";

type UserGender =
  (typeof ProfileConstantsCollection.UserGender)[keyof typeof ProfileConstantsCollection.UserGender];

type UserInterest =
  (typeof ProfileConstantsCollection.UserInterest)[keyof typeof ProfileConstantsCollection.UserInterest];

type SignupStep =
  (typeof AuthConstantsCollection.SignupStep)[keyof typeof AuthConstantsCollection.SignupStep];

interface SignupDraft {
  age: number;
  bio: string;
  city: string;
  email: string;
  gender: string;
  interestedIn: UserInterest[];
  jobTitle: string;
  movieNightStyle: string;
  name: string;
  password: string;
  socialBattery: string;
  weekdayPace: string;
}

interface GetStepIndexInput {
  step: SignupStep;
}

interface GetStepHintInput {
  draft: SignupDraft;
  step: SignupStep;
}

interface HandleSignupSubmitInput {
  event: FormEvent<HTMLFormElement>;
}

interface SignupCardPreview {
  age: number;
  bio: string;
  city: string;
  jobTitle: string;
  joining: boolean;
  name: string;
}

interface SignupPreviewCardProps {
  preview: SignupCardPreview;
}

interface ToggleInterestInput {
  interest: UserInterest;
}

const HUGE_INPUT_CLASS_NAME =
  "w-full bg-transparent text-4xl font-semibold tracking-[-0.05em] text-white outline-none placeholder:text-white/25 sm:text-6xl";

const FIELD_INPUT_CLASS_NAME =
  "min-h-14 w-full rounded-2xl border border-white/15 bg-white/8 px-4 text-lg text-white outline-none placeholder:text-white/35 focus:border-white/50";

const GENDER_LABEL = {
  [ProfileConstantsCollection.UserGender.Female]: "Woman",
  [ProfileConstantsCollection.UserGender.Male]: "Man",
  [ProfileConstantsCollection.UserGender.Other]: "Non-binary",
} satisfies Record<UserGender, string>;

const INTEREST_LABEL = {
  [ProfileConstantsCollection.UserInterest.Female]: "Women",
  [ProfileConstantsCollection.UserInterest.Male]: "Men",
} satisfies Record<UserInterest, string>;

const emptyDraft: SignupDraft = {
  age: 0,
  bio: "",
  city: "",
  email: "",
  gender: "",
  interestedIn: [],
  jobTitle: "",
  movieNightStyle: "",
  name: "",
  password: "",
  socialBattery: "",
  weekdayPace: "",
};

const getStepIndex = ({ step }: GetStepIndexInput): number => {
  return AuthConstantsCollection.SignupStepOrder.indexOf(step);
};

const getNextStep = ({ step }: GetStepIndexInput): SignupStep => {
  const nextIndex = getStepIndex({ step }) + 1;
  const nextStep = AuthConstantsCollection.SignupStepOrder[nextIndex];

  if (!nextStep) {
    return step;
  }

  return nextStep;
};

const getPreviousStep = ({ step }: GetStepIndexInput): SignupStep => {
  const previousIndex = getStepIndex({ step }) - 1;
  const previousStep = AuthConstantsCollection.SignupStepOrder[previousIndex];

  if (!previousStep) {
    return step;
  }

  return previousStep;
};

const SignupPreviewCard = ({ preview }: SignupPreviewCardProps) => {
  return (
    <article className="mt-10 overflow-hidden rounded-[1.8rem] bg-white/10 p-5">
      <p className="text-[0.65rem] font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
        {preview.joining ? "Going live" : "Your card"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">
        {preview.name || "You"}, {preview.age || "—"}
      </h2>
      <p className="mt-1 text-sm text-white/60">
        {preview.jobTitle || "No job listed"}
        {preview.city ? ` · ${preview.city}` : ""}
      </p>
      <p className="mt-4 text-sm leading-6 text-white/80">
        {preview.joining
          ? "Hold on — we're putting you on the floor."
          : preview.bio || "The line goes here."}
      </p>
    </article>
  );
};

const getStepHint = ({ draft, step }: GetStepHintInput): string => {
  if (step === AuthConstantsCollection.SignupStep.Name && draft.name.trim().length < 2) {
    return "Give us at least two letters.";
  }

  if (step === AuthConstantsCollection.SignupStep.Age && draft.age < 18) {
    return "You have to be 18.";
  }

  if (step === AuthConstantsCollection.SignupStep.People && !draft.gender) {
    return "Pick how you show up.";
  }

  if (
    step === AuthConstantsCollection.SignupStep.People &&
    !draft.interestedIn.length
  ) {
    return "Pick who you want to meet.";
  }

  if (step === AuthConstantsCollection.SignupStep.World && !draft.city.trim()) {
    return "Drop a city so people know the scene.";
  }

  if (
    step === AuthConstantsCollection.SignupStep.Vibe &&
    (!draft.weekdayPace || !draft.socialBattery || !draft.movieNightStyle)
  ) {
    return "Hit all three. It takes ten seconds.";
  }

  if (step === AuthConstantsCollection.SignupStep.Bio && !draft.bio.trim()) {
    return "One line. Even a messy one.";
  }

  return "";
};

export const SignupFlow = () => {
  const [step, setStep] = useState<SignupStep>(
    AuthConstantsCollection.SignupStep.Hook,
  );
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);
  const [hint, setHint] = useState("");
  const [preview, showPreview] = useOptimistic(
    {
      age: draft.age,
      bio: draft.bio,
      city: draft.city,
      jobTitle: draft.jobTitle,
      joining: false,
      name: draft.name,
    },
    (_current, nextPreview: SignupCardPreview) => nextPreview,
  );
  const [state, formAction] = useActionState(
    async (
      previousState: typeof initialSignupActionState,
      formData: FormData,
    ) => {
      showPreview({
        age: draft.age,
        bio: draft.bio,
        city: draft.city,
        jobTitle: draft.jobTitle,
        joining: true,
        name: draft.name,
      });
      formData.set("name", draft.name.trim());
      formData.set("age", String(draft.age));
      formData.set("gender", draft.gender);
      formData.set("bio", draft.bio.trim());
      formData.set("jobTitle", draft.jobTitle.trim());
      formData.set("city", draft.city.trim());
      formData.set("weekdayPace", draft.weekdayPace);
      formData.set("socialBattery", draft.socialBattery);
      formData.set("movieNightStyle", draft.movieNightStyle);
      formData.delete("interestedIn");

      for (const gender of draft.interestedIn) {
        formData.append("interestedIn", gender);
      }

      return signupAction(previousState, formData);
    },
    initialSignupActionState,
  );

  if (state.success) {
    redirect("/feed");
  }

  const stepIndex = getStepIndex({ step });
  const isAccountStep =
    step === AuthConstantsCollection.SignupStep.Account;

  const goNext = () => {
    const nextHint = getStepHint({ draft, step });

    if (nextHint) {
      setHint(nextHint);
      return;
    }

    setHint("");
    setStep(getNextStep({ step }));
  };

  const goBack = () => {
    setHint("");
    setStep(getPreviousStep({ step }));
  };

  const handleSignupSubmit = ({ event }: HandleSignupSubmitInput) => {
    if (isAccountStep) {
      return;
    }

    event.preventDefault();
    goNext();
  };

  const toggleInterest = ({ interest }: ToggleInterestInput) => {
    setDraft((current) => {
      if (current.interestedIn.includes(interest)) {
        return {
          ...current,
          interestedIn: current.interestedIn.filter(
            (value) => value !== interest,
          ),
        };
      }

      return {
        ...current,
        interestedIn: [...current.interestedIn, interest],
      };
    });
  };

  return (
    <form
      action={formAction}
      onSubmit={(event) => handleSignupSubmit({ event })}
      className="relative flex min-h-svh flex-col overflow-hidden bg-zinc-950 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 left-[-8rem] size-[28rem] rounded-full bg-[#fd267a]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute right-[-10rem] bottom-[-8rem] size-[32rem] rounded-full bg-[#ff6036]/25 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/login" className="text-sm font-semibold text-white/70">
          Tinder Lite
        </Link>
        {step === AuthConstantsCollection.SignupStep.Hook ? (
          <Link href="/login" className="text-sm font-semibold text-white/70">
            Log in
          </Link>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-semibold text-white/70"
          >
            Back
          </button>
        )}
      </header>

      {step === AuthConstantsCollection.SignupStep.Hook ? null : (
        <div className="relative z-10 flex gap-1.5 px-5 sm:px-8">
          {AuthConstantsCollection.SignupStepOrder.filter(
            (item) => item !== AuthConstantsCollection.SignupStep.Hook,
          ).map((item) => (
            <span
              key={item}
              className={
                getStepIndex({ step: item }) <= stepIndex
                  ? "h-1 flex-1 rounded-full bg-white"
                  : "h-1 flex-1 rounded-full bg-white/20"
              }
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        {step === AuthConstantsCollection.SignupStep.Hook ? (
          <div>
            <p className="text-sm font-bold tracking-[0.22em] text-[#ff8fb0] uppercase">
              Not another waiting room
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.06em] sm:text-7xl">
              Dating apps got sleepy.
              <span className="mt-2 block bg-gradient-to-r from-[#fd267a] to-[#ff6036] bg-clip-text text-transparent">
                You didn&apos;t.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
              90 seconds. No essay. A card that actually sounds like you.
            </p>
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.Name ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              First impression
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              What should people call you?
            </h1>
            <input
              autoFocus
              value={draft.name}
              maxLength={ProfileConstantsCollection.FieldLimit.Name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Your name"
              className={`${HUGE_INPUT_CLASS_NAME} mt-10`}
            />
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.Age ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              No fake 21s
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              How old are you, for real?
            </h1>
            <div className="mt-10 flex flex-wrap gap-2">
              {AuthConstantsCollection.AgePicks.map((age) => (
                <SignupChoice
                  key={age}
                  label={`${age}`}
                  selected={draft.age === age}
                  onSelect={() =>
                    setDraft((current) => ({
                      ...current,
                      age,
                    }))
                  }
                />
              ))}
            </div>
            <input
              type="number"
              min={18}
              value={draft.age > 0 ? draft.age : ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  age: Number.parseInt(event.target.value, 10) || 0,
                }))
              }
              placeholder="Or type it"
              className={`${FIELD_INPUT_CLASS_NAME} mt-6 max-w-xs`}
            />
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.People ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              The lineup
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              How do you show up?
            </h1>
            <div className="mt-8 flex flex-wrap gap-2">
              {Object.values(ProfileConstantsCollection.UserGender).map(
                (gender) => (
                  <SignupChoice
                    key={gender}
                    label={GENDER_LABEL[gender]}
                    selected={draft.gender === gender}
                    onSelect={() =>
                      setDraft((current) => ({
                        ...current,
                        gender,
                      }))
                    }
                  />
                ),
              )}
            </div>
            <h2 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">
              Who are you looking for?
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.values(ProfileConstantsCollection.UserInterest).map(
                (interest) => (
                  <SignupChoice
                    key={interest}
                    label={INTEREST_LABEL[interest]}
                    selected={draft.interestedIn.includes(interest)}
                    onSelect={() => toggleInterest({ interest })}
                  />
                ),
              )}
            </div>
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.World ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              Home base
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Where should someone find you?
            </h1>
            <input
              autoFocus
              value={draft.city}
              maxLength={ProfileConstantsCollection.FieldLimit.City}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              placeholder="City"
              className={`${HUGE_INPUT_CLASS_NAME} mt-10`}
            />
            <input
              value={draft.jobTitle}
              maxLength={ProfileConstantsCollection.FieldLimit.JobTitle}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  jobTitle: event.target.value,
                }))
              }
              placeholder="Job, if you have one"
              className={`${FIELD_INPUT_CLASS_NAME} mt-6`}
            />
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.Vibe ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              Energy check
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Pick the vibe. No wrong answers.
            </h1>
            <p className="mt-8 text-sm font-semibold text-white/60">Weekdays</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(ProfileConstantsCollection.WeekdayPaceLabel).map(
                ([value, label]) => (
                  <SignupChoice
                    key={value}
                    label={label}
                    selected={draft.weekdayPace === value}
                    onSelect={() =>
                      setDraft((current) => ({
                        ...current,
                        weekdayPace: value,
                      }))
                    }
                  />
                ),
              )}
            </div>
            <p className="mt-8 text-sm font-semibold text-white/60">People</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(
                ProfileConstantsCollection.SocialBatteryLabel,
              ).map(([value, label]) => (
                <SignupChoice
                  key={value}
                  label={label}
                  selected={draft.socialBattery === value}
                  onSelect={() =>
                    setDraft((current) => ({
                      ...current,
                      socialBattery: value,
                    }))
                  }
                />
              ))}
            </div>
            <p className="mt-8 text-sm font-semibold text-white/60">
              Movie night
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(
                ProfileConstantsCollection.MovieNightStyleLabel,
              ).map(([value, label]) => (
                <SignupChoice
                  key={value}
                  label={label}
                  selected={draft.movieNightStyle === value}
                  onSelect={() =>
                    setDraft((current) => ({
                      ...current,
                      movieNightStyle: value,
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.Bio ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              The line
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              One sentence they&apos;ll actually read.
            </h1>
            <textarea
              autoFocus
              value={draft.bio}
              maxLength={140}
              rows={3}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              placeholder="Weekends, chaos, filter coffee…"
              className="mt-10 w-full resize-none bg-transparent text-2xl leading-snug font-semibold tracking-[-0.04em] text-white outline-none placeholder:text-white/25 sm:text-4xl"
            />
            <SignupPreviewCard preview={preview} />
          </div>
        ) : null}

        {step === AuthConstantsCollection.SignupStep.Account ? (
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#ff8fb0] uppercase">
              Lock it in
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Last door. Then you&apos;re in.
            </h1>
            <div className="mt-10 space-y-4">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Email"
                className={FIELD_INPUT_CLASS_NAME}
              />
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                maxLength={32}
                value={draft.password}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Password"
                className={FIELD_INPUT_CLASS_NAME}
              />
              <p className="text-xs leading-5 text-white/50">
                8+ characters. Mix upper, lower, a number, and a symbol. We
                know. We don&apos;t make the password rules.
              </p>
            </div>
            <SignupPreviewCard preview={preview} />
          </div>
        ) : null}

        {hint || state.message ? (
          <p
            role="alert"
            className="mt-6 text-sm font-medium text-[#ffb3c7]"
          >
            {state.message || hint}
          </p>
        ) : null}

        <div className="mt-12 max-w-md">
          {isAccountStep ? (
            <SignupSubmitButton
              idleLabel="I'm in"
              pendingLabel="Creating you…"
            />
          ) : (
            <button
              type="button"
              onClick={
                step === AuthConstantsCollection.SignupStep.Hook
                  ? () => setStep(getNextStep({ step }))
                  : goNext
              }
              className="group flex min-h-14 w-full items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-zinc-950 shadow-[0_18px_40px_-16px_rgba(255,255,255,0.55)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              {step === AuthConstantsCollection.SignupStep.Hook
                ? "Drop in"
                : "Keep going"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

/*
 * Learning notes
 *
 * React 19 Action and `useOptimistic`
 * - Earlier steps stay local. The last step submits a form Action so React
 *   owns pending state and the Express signup cookie.
 * - `useOptimistic` flips the live card to a joining state the moment submit
 *   starts. A failed signup restores the previous card when the Action ends.
 *
 * React 18.2 comparison
 * - React 18 usually kept one `onSubmit` handler and a pending boolean for
 *   the whole wizard, including steps that never hit the network.
 * - A live preview was extra local state that had to be rolled back in `catch`.
 */
