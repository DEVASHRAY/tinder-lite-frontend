enum ConversationInboxLoadOutcome {
  Failure = "failure",
  Success = "success",
  Unauthorized = "unauthorized",
}

enum MessageDeliveryStatus {
  Delivered = "DELIVERED",
  Read = "READ",
  Sent = "SENT",
}

export const ChatConstantsCollection = {
  ConversationInboxLoadOutcome,
  MessageDeliveryStatus,
};
