"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useState, type FormEvent } from "react";

import { AuthConstantsCollection } from "@/features/auth/auth.constants";
import { SignupChoice } from "@/features/auth/signup-choice";
import { SignupConstantsCollection } from "@/features/auth/signup.constants";
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

type SignupMode =
  (typeof SignupConstantsCollection.SignupMode)[keyof typeof SignupConstantsCollection.SignupMode];

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

interface SignupMessageProps {
  isError: boolean;
  message: string;
}

interface SignupModeSwitchProps {
  disabled: boolean;
  label: string;
  onSwitch: () => void;
  prompt: string;
}

interface SignupHiddenProfileFieldsProps {
  draft: SignupDraft;
  mode: SignupMode;
  session: number;
}

interface ToggleInterestInput {
  interest: UserInterest;
}

const HUGE_INPUT_CLASS_NAME =
  "w-full bg-transparent text-4xl font-semibold tracking-[-0.05em] text-white outline-none placeholder:text-white/25 sm:text-6xl";

const FIELD_INPUT_CLASS_NAME =
  "min-h-14 w-full rounded-2xl border border-white/15 bg-white/8 px-4 text-lg text-white outline-none transition placeholder:text-white/35 hover:border-white/30 focus:border-zinc-400 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-zinc-300 aria-invalid:border-rose-300 aria-invalid:focus:border-zinc-400 disabled:cursor-wait disabled:opacity-65";

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

const SignupMessage = ({ isError, message }: SignupMessageProps) => {
  return (
    <p
      id="signup-message"
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "mt-6 rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm font-medium text-rose-100"
          : "mt-6 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100"
      }
    >
      {message}
    </p>
  );
};

const SignupModeSwitch = ({
  disabled,
  label,
  onSwitch,
  prompt,
}: SignupModeSwitchProps) => {
  return (
    <p className="text-center text-sm text-white/55">
      {prompt}{" "}
      <button
        type="button"
        disabled={disabled}
        onClick={onSwitch}
        className="font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/50 disabled:cursor-wait disabled:opacity-60"
      >
        {label}
      </button>
    </p>
  );
};

const SignupHiddenProfileFields = ({
  draft,
  mode,
  session,
}: SignupHiddenProfileFieldsProps) => {
  return (
    <>
      <input name="signupMode" type="hidden" value={mode} />
      <input name="signupSession" type="hidden" value={session} />
      <input name="name" type="hidden" value={draft.name.trim()} />
      <input name="age" type="hidden" value={draft.age} />
      <input name="gender" type="hidden" value={draft.gender} />
      <input name="bio" type="hidden" value={draft.bio.trim()} />
      <input name="jobTitle" type="hidden" value={draft.jobTitle.trim()} />
      <input name="city" type="hidden" value={draft.city.trim()} />
      <input name="weekdayPace" type="hidden" value={draft.weekdayPace} />
      <input name="socialBattery" type="hidden" value={draft.socialBattery} />
      <input
        name="movieNightStyle"
        type="hidden"
        value={draft.movieNightStyle}
      />
      {draft.interestedIn.map((interest) => (
        <input
          key={interest}
          name="interestedIn"
          type="hidden"
          value={interest}
        />
      ))}
    </>
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
  const [mode, setMode] = useState<SignupMode>(
    SignupConstantsCollection.SignupMode.Otp,
  );
  const [signupSession, setSignupSession] = useState(0);
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialSignupActionState,
  );

  if (state.success) {
    redirect("/feed");
  }

  const stepIndex = getStepIndex({ step });
  const isAccountStep =
    step === AuthConstantsCollection.SignupStep.Account;
  const isCurrentActionState =
    state.mode === mode && state.session === signupSession;
  const isOtpCodeStep =
    isAccountStep &&
    mode === SignupConstantsCollection.SignupMode.Otp &&
    isCurrentActionState &&
    state.step === SignupConstantsCollection.OtpSignupStep.Code;
  const isPending = isAccountStep && pending;
  const visibleActionMessage =
    isCurrentActionState &&
    (isOtpCodeStep || state.email === draft.email.trim())
      ? state.message
      : "";
  const preview: SignupCardPreview = {
    age: draft.age,
    bio: draft.bio,
    city: draft.city,
    jobTitle: draft.jobTitle,
    joining:
      isPending &&
      (isOtpCodeStep ||
        mode === SignupConstantsCollection.SignupMode.Password),
    name: draft.name,
  };

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

    if (isAccountStep) {
      setSignupSession((currentSession) => currentSession + 1);
    }

    setStep(getPreviousStep({ step }));
  };

  const showOtpSignup = () => {
    setHint("");
    setMode(SignupConstantsCollection.SignupMode.Otp);
    setSignupSession((currentSession) => currentSession + 1);
  };

  const showPasswordSignup = () => {
    setHint("");
    setMode(SignupConstantsCollection.SignupMode.Password);
    setSignupSession((currentSession) => currentSession + 1);
  };

  const changeOtpEmail = () => {
    setDraft((current) => ({
      ...current,
      email: state.email,
    }));
    setSignupSession((currentSession) => currentSession + 1);
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
      aria-busy={isPending}
      onSubmit={(event) => handleSignupSubmit({ event })}
      className="relative flex min-h-svh flex-col overflow-hidden bg-zinc-950 text-white"
    >
      <SignupHiddenProfileFields
        draft={draft}
        mode={mode}
        session={signupSession}
      />
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
            disabled={isPending}
            onClick={goBack}
            className="rounded-sm text-sm font-semibold text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/50 disabled:cursor-wait disabled:opacity-50"
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
              aria-label="Name"
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
              aria-label="Age"
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
              aria-label="City"
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
              aria-label="Job title"
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
              aria-label="Bio"
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
              {isOtpCodeStep ? "Check your inbox" : "Lock it in"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {isOtpCodeStep
                ? "Six digits. Then you're in."
                : mode === SignupConstantsCollection.SignupMode.Otp
                  ? "No password needed."
                  : "Create a password."}
            </h1>
            <fieldset disabled={isPending} className="mt-10 space-y-4">
              {mode === SignupConstantsCollection.SignupMode.Otp ? (
                isOtpCodeStep ? (
                  <>
                    <input name="email" type="hidden" value={state.email} />
                    <p
                      id="signup-otp-destination"
                      className="text-sm leading-6 text-white/65"
                    >
                      We sent a 6-digit code to{" "}
                      <strong className="font-semibold text-white/90">
                        {state.email}
                      </strong>
                      {"."}
                    </p>
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-otp"
                        className="block text-sm font-semibold text-white/85"
                      >
                        Verification code
                      </label>
                      <input
                        id="signup-otp"
                        name="otp"
                        type="text"
                        autoComplete="one-time-code"
                        autoFocus
                        inputMode="numeric"
                        maxLength={6}
                        minLength={6}
                        pattern="[0-9]{6}"
                        placeholder="000000"
                        required
                        aria-describedby="signup-otp-destination signup-message"
                        aria-invalid={state.isError}
                        className={`${FIELD_INPUT_CLASS_NAME} text-center text-xl tracking-[0.4em]`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={changeOtpEmail}
                      className="min-h-10 w-full rounded-xl text-sm font-semibold text-white/65 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/50 disabled:cursor-wait disabled:opacity-60"
                    >
                      Change email
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-otp-email"
                        className="block text-sm font-semibold text-white/85"
                      >
                        Email
                      </label>
                      <input
                        id="signup-otp-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        maxLength={254}
                        required
                        value={draft.email}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="you@example.com"
                        aria-describedby={
                          visibleActionMessage ? "signup-message" : undefined
                        }
                        aria-invalid={Boolean(visibleActionMessage)}
                        className={FIELD_INPUT_CLASS_NAME}
                      />
                    </div>
                    <p className="text-xs leading-5 text-white/50">
                      We&apos;ll email you one 6-digit code to create and secure
                      your account.
                    </p>
                  </>
                )
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-password-email"
                      className="block text-sm font-semibold text-white/85"
                    >
                      Email
                    </label>
                    <input
                      id="signup-password-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      maxLength={254}
                      required
                      value={draft.email}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                      aria-describedby={
                        visibleActionMessage ? "signup-message" : undefined
                      }
                      aria-invalid={Boolean(visibleActionMessage)}
                      className={FIELD_INPUT_CLASS_NAME}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-semibold text-white/85"
                    >
                      Password
                    </label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      maxLength={32}
                      minLength={8}
                      required
                      value={draft.password}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Create a password"
                      aria-describedby={
                        visibleActionMessage
                          ? "signup-password-help signup-message"
                          : "signup-password-help"
                      }
                      aria-invalid={Boolean(visibleActionMessage)}
                      className={FIELD_INPUT_CLASS_NAME}
                    />
                  </div>
                  <p
                    id="signup-password-help"
                    className="text-xs leading-5 text-white/50"
                  >
                    8–32 characters with upper, lower, a number, and a symbol.
                  </p>
                </>
              )}
            </fieldset>
            <SignupPreviewCard preview={preview} />
          </div>
        ) : null}

        {hint ? (
          <SignupMessage isError message={hint} />
        ) : visibleActionMessage ? (
          <SignupMessage
            isError={state.isError}
            message={visibleActionMessage}
          />
        ) : null}

        <div className="mt-12 max-w-md">
          {isAccountStep ? (
            <div className="space-y-5">
              <SignupSubmitButton
                idleLabel={
                  mode === SignupConstantsCollection.SignupMode.Password
                    ? "Create account with password"
                    : isOtpCodeStep
                      ? "Verify and join"
                      : "Email me a code"
                }
                pendingLabel={
                  mode === SignupConstantsCollection.SignupMode.Password
                    ? "Creating your account…"
                    : isOtpCodeStep
                      ? "Verifying…"
                      : "Sending code…"
                }
              />
              <SignupModeSwitch
                disabled={isPending}
                label={
                  mode === SignupConstantsCollection.SignupMode.Otp
                    ? "Use password instead"
                    : "Email me a code"
                }
                onSwitch={
                  mode === SignupConstantsCollection.SignupMode.Otp
                    ? showPasswordSignup
                    : showOtpSignup
                }
                prompt={
                  mode === SignupConstantsCollection.SignupMode.Otp
                    ? "Prefer a password?"
                    : "Want the faster option?"
                }
              />
            </div>
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
 * React 19 Action and `useActionState`
 * - Earlier profile steps stay local. The account step submits one Action for
 *   OTP send, OTP verification, or the existing password signup.
 * - The Action's returned step and pending state drive the verification UI
 *   without an Effect or a separate request-state bridge.
 * - A local session number hides results from an abandoned email or mode while
 *   preserving the profile draft.
 *
 * React 18.2 comparison
 * - React 18 usually used `onSubmit`, `preventDefault`, and separate local
 *   state for pending, request errors, and the OTP step.
 * - React 19 keeps the async mutation state tied to the form submission.
 */
