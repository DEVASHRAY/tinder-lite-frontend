import type { ProfileConstantsCollection } from "@/features/profile/profile.constants";
import type { ViewerProfile } from "@/features/profile/profile.schemas";

interface ProfileLoadSuccess {
  outcome: typeof ProfileConstantsCollection.ProfileLoadOutcome.Success;
  profile: ViewerProfile;
}

interface ProfileLoadUnauthorized {
  outcome: typeof ProfileConstantsCollection.ProfileLoadOutcome.Unauthorized;
}

interface ProfileLoadFailure {
  message: string;
  outcome: typeof ProfileConstantsCollection.ProfileLoadOutcome.Failure;
}

export type ProfileLoadResult =
  | ProfileLoadFailure
  | ProfileLoadSuccess
  | ProfileLoadUnauthorized;
