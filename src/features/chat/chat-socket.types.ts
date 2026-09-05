export interface MessageCreatedPayload {
  clientMessageId: string;
  connectionId: string;
  conversationId: string;
  createdAt: string;
  id: string;
  senderId: string;
  sequenceNumber: number;
  text: string;
}

export interface MessageReceiptPayload {
  conversationId: string;
  // This sequence number and every earlier Message share the new receipt status.
  sequenceNumber: number;
}

export interface ChatClientToServerEvents {
  "message.mark-delivered": (payload: MessageReceiptPayload) => void;
  "message.mark-read": (payload: MessageReceiptPayload) => void;
}

export interface ChatServerToClientEvents {
  "message.created": (payload: MessageCreatedPayload) => void;
  "message.delivered": (payload: MessageReceiptPayload) => void;
  "message.read": (payload: MessageReceiptPayload) => void;
}
