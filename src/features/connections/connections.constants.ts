enum ConnectionList {
  Matches = "matches",
  Received = "received",
  Sent = "sent",
}

enum ConnectionsLoadOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum LikeReviewStatus {
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

enum LikeReviewOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum ConnectionStatus {
  Accepted = "ACCEPTED",
  Blocked = "BLOCKED",
  Ignored = "IGNORED",
  Interested = "INTERESTED",
  Rejected = "REJECTED",
}

enum ConnectionViewerRole {
  Receiver = "receiver",
  Sender = "sender",
}

enum PeerConnectionLoadOutcome {
  Failure = "failure",
  Missing = "missing",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum ProfileOverlayKind {
  Decide = "decide",
  None = "none",
  Review = "review",
  Status = "status",
}

export const ConnectionsConstantsCollection = {
  ConnectionList,
  ConnectionStatus,
  ConnectionViewerRole,
  ConnectionsLoadOutcome,
  LikeReviewOutcome,
  LikeReviewStatus,
  PeerConnectionLoadOutcome,
  ProfileOverlayKind,
};
