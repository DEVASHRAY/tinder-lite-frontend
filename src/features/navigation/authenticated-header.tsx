import { AppHeader } from "@/features/navigation/app-header";
import { ProfileConstantsCollection } from "@/features/profile/profile.constants";
import { loadViewerProfile } from "@/features/profile/profile.data";
import type { ProfileLoadResult } from "@/features/profile/profile.types";

export const AuthenticatedHeader = async () => {
  let result: ProfileLoadResult | null = null;

  try {
    result = await loadViewerProfile();
  } catch (error) {
    if (error instanceof Error) {
      return <AppHeader />;
    }

    return <AppHeader />;
  }

  if (
    result.outcome !== ProfileConstantsCollection.ProfileLoadOutcome.Success
  ) {
    return <AppHeader />;
  }

  return (
    <AppHeader
      viewer={{
        name: result.profile.name,
        photoUrl: result.profile.photoUrl,
      }}
    />
  );
};
