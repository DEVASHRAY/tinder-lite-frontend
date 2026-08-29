enum SignupMode {
  Otp = "otp",
  Password = "password",
}

enum OtpSignupStep {
  Code = "code",
  Email = "email",
}

export const SignupConstantsCollection = {
  OtpSignupStep,
  SignupMode,
};
