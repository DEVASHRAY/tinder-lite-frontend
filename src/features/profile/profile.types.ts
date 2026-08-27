import type { ProfileConstantsCollection } from "@/features/profile/profile.constants";
import type {
  PublicProfile,
  ViewerProfile,
} from "@/features/profile/profile.schemas";

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

interface PublicProfileLoadSuccess {
  outcome: typeof ProfileConstantsCollection.ProfileLoadOutcome.Success;
  profile: PublicProfile;
}

interface PublicProfileLoadNotFound {
  outcome: typeof ProfileConstantsCollection.ProfileLoadOutcome.NotFound;
}

export type ProfileLoadResult =
  | ProfileLoadFailure
  | ProfileLoadSuccess
  | ProfileLoadUnauthorized;

export type PublicProfileLoadResult =
  | ProfileLoadFailure
  | PublicProfileLoadNotFound
  | PublicProfileLoadSuccess
  | ProfileLoadUnauthorized;

export interface LoadPublicProfileInput {
  id: string;
}
