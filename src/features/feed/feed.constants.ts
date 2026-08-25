enum FeedLoadOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum SwipeDirection {
  Left = "left",
  Right = "right",
}

enum SwipeDecision {
  Ignored = "IGNORED",
  Interested = "INTERESTED",
}

enum SwipeMutationOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

export const FeedConstantsCollection = {
  FeedLoadOutcome,
  SwipeDecision,
  SwipeDirection,
  SwipeMutationOutcome,
};
