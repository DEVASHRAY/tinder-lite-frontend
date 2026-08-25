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

export const ConnectionsConstantsCollection = {
  ConnectionList,
  ConnectionsLoadOutcome,
};
