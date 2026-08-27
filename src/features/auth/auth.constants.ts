enum SignupStep {
  Hook = "hook",
  Name = "name",
  Age = "age",
  People = "people",
  World = "world",
  Vibe = "vibe",
  Bio = "bio",
  Account = "account",
}

enum SignupOutcome {
  Conflict = "conflict",
  Failure = "failure",
  Success = "success",
}

const SignupStepOrder = [
  SignupStep.Hook,
  SignupStep.Name,
  SignupStep.Age,
  SignupStep.People,
  SignupStep.World,
  SignupStep.Vibe,
  SignupStep.Bio,
  SignupStep.Account,
];

const AgePicks = [20, 22, 24, 26, 28, 30];

export const AuthConstantsCollection = {
  AgePicks,
  SignupOutcome,
  SignupStep,
  SignupStepOrder,
};
