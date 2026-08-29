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

enum LoginMode {
  Otp = "otp",
  Password = "password",
}

enum OtpLoginStep {
  Code = "code",
  Email = "email",
}

enum OtpSendMessage {
  AlreadySent = "A valid verification code was already sent. Please use that code",
  Sent = "Verification code sent successfully",
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
  LoginMode,
  OtpLoginStep,
  OtpSendMessage,
  SignupOutcome,
  SignupStep,
  SignupStepOrder,
};
