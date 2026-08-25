enum ProfileLoadOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum UserGender {
  Female = "female",
  Male = "male",
  Other = "other",
}

export const ProfileConstantsCollection = {
  ProfileLoadOutcome,
  UserGender,
};
