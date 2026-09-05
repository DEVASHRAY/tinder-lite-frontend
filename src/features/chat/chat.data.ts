import "server-only";

import { z } from "zod";

import { ChatConstantsCollection } from "@/features/chat/chat.constants";
import { requestBackend } from "@/lib/server/backend-client";
import { getAuthenticationCookieHeader } from "@/lib/server/session";

const objectId = z.string().regex(/^[0-9a-f]{24}$/u);
const sequenceNumber = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);

const conversationInboxItem = z.object({
  connectionId: objectId,
  conversationId: objectId,
  lastMessage: z.object({
    createdAt: z.iso.datetime(),
    deliveryAcknowledgementRequired: z.boolean(),
    deliveryStatus: z
      .enum(ChatConstantsCollection.MessageDeliveryStatus)
      .nullable(),
    sentByAuthenticatedUser: z.boolean(),
    sequenceNumber,
    textPreview: z.string().trim().min(1).max(120),
  }),
  peer: z.object({
    id: objectId,
    name: z.string().trim().min(1).max(50).nullable(),
    photoUrl: z.url().nullable(),
  }),
  unreadCount: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});

const conversationInboxResponse = z.object({
  data: z.object({
    items: z.array(conversationInboxItem).max(20),
    nextCursor: z
      .string()
      .regex(/^[1-9]\d{12}:[0-9a-f]{24}$/u)
      .nullable(),
  }),
  message: z.string(),
});

const messageHistoryItem = z.object({
  clientMessageId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
    ),
  conversationId: objectId,
  createdAt: z.iso.datetime(),
  deliveryStatus: z
    .enum(ChatConstantsCollection.MessageDeliveryStatus)
    .nullable(),
  id: objectId,
  senderId: objectId,
  sequenceNumber,
  text: z.string().trim().min(1).max(2_000),
});

const messageHistoryResponse = z.object({
  data: z.object({
    items: z.array(messageHistoryItem).max(20),
    nextLastLoadedSequenceNumber: sequenceNumber.nullable(),
  }),
  message: z.string(),
});

export type ConversationInboxItem = z.infer<typeof conversationInboxItem>;
export type MessageHistoryItem = z.infer<typeof messageHistoryItem>;

interface ConversationInboxLoadSuccess {
  conversations: ConversationInboxItem[];
  nextCursor: string | null;
  outcome: typeof ChatConstantsCollection.ConversationInboxLoadOutcome.Success;
}

interface ConversationInboxLoadUnauthorized {
  outcome: typeof ChatConstantsCollection.ConversationInboxLoadOutcome.Unauthorized;
}

interface ConversationInboxLoadFailure {
  message: string;
  outcome: typeof ChatConstantsCollection.ConversationInboxLoadOutcome.Failure;
}

type ConversationInboxLoadResult =
  | ConversationInboxLoadFailure
  | ConversationInboxLoadSuccess
  | ConversationInboxLoadUnauthorized;

interface LoadMessageHistoryInput {
  connectionId: string;
  lastLoadedSequenceNumber?: number;
}

interface MessageHistoryLoadSuccess {
  messages: MessageHistoryItem[];
  nextLastLoadedSequenceNumber: number | null;
  outcome: typeof ChatConstantsCollection.MessageHistoryLoadOutcome.Success;
}

interface MessageHistoryLoadMissing {
  outcome: typeof ChatConstantsCollection.MessageHistoryLoadOutcome.Missing;
}

interface MessageHistoryLoadUnauthorized {
  outcome: typeof ChatConstantsCollection.MessageHistoryLoadOutcome.Unauthorized;
}

interface MessageHistoryLoadFailure {
  message: string;
  outcome: typeof ChatConstantsCollection.MessageHistoryLoadOutcome.Failure;
}

type MessageHistoryLoadResult =
  | MessageHistoryLoadFailure
  | MessageHistoryLoadMissing
  | MessageHistoryLoadSuccess
  | MessageHistoryLoadUnauthorized;

export const loadConversationInbox =
  async (): Promise<ConversationInboxLoadResult> => {
    try {
      const cookieHeader = await getAuthenticationCookieHeader();

      if (!cookieHeader) {
        return {
          outcome:
            ChatConstantsCollection.ConversationInboxLoadOutcome.Unauthorized,
        };
      }

      const response = await requestBackend({
        cookie: cookieHeader,
        method: "GET",
        path: "/api/v1/chat/conversations",
      });

      if (response.status === 401) {
        return {
          outcome:
            ChatConstantsCollection.ConversationInboxLoadOutcome.Unauthorized,
        };
      }

      if (!response.ok) {
        return {
          message: "Your conversations are temporarily unavailable",
          outcome: ChatConstantsCollection.ConversationInboxLoadOutcome.Failure,
        };
      }

      const parsedResponse = conversationInboxResponse.safeParse(
        await response.json(),
      );

      if (!parsedResponse.success) {
        return {
          message: "Your conversations returned an invalid response",
          outcome: ChatConstantsCollection.ConversationInboxLoadOutcome.Failure,
        };
      }

      return {
        conversations: parsedResponse.data.data.items,
        nextCursor: parsedResponse.data.data.nextCursor,
        outcome: ChatConstantsCollection.ConversationInboxLoadOutcome.Success,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error
            ? "Unable to load your conversations"
            : "Unexpected conversation inbox failure",
        outcome: ChatConstantsCollection.ConversationInboxLoadOutcome.Failure,
      };
    }
  };

export const loadMessageHistory = async ({
  connectionId,
  lastLoadedSequenceNumber,
}: LoadMessageHistoryInput): Promise<MessageHistoryLoadResult> => {
  const parsedConnectionId = objectId.safeParse(connectionId);

  if (!parsedConnectionId.success) {
    return {
      outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Missing,
    };
  }

  const parsedLastLoadedSequenceNumber = sequenceNumber
    .optional()
    .safeParse(lastLoadedSequenceNumber);

  if (!parsedLastLoadedSequenceNumber.success) {
    return {
      message: "The message-history cursor is invalid",
      outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Failure,
    };
  }

  const searchParams = new URLSearchParams();

  if (parsedLastLoadedSequenceNumber.data) {
    searchParams.set(
      "lastLoadedSequenceNumber",
      String(parsedLastLoadedSequenceNumber.data),
    );
  }

  const query = searchParams.toString();

  try {
    const cookieHeader = await getAuthenticationCookieHeader();

    if (!cookieHeader) {
      return {
        outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Unauthorized,
      };
    }

    const response = await requestBackend({
      cookie: cookieHeader,
      method: "GET",
      path: `/api/v1/chat/connections/${encodeURIComponent(parsedConnectionId.data)}/messages${query ? `?${query}` : ""}`,
    });

    if (response.status === 401) {
      return {
        outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Unauthorized,
      };
    }

    if (
      response.status === 403 ||
      response.status === 404 ||
      response.status === 422
    ) {
      return {
        outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Missing,
      };
    }

    if (!response.ok) {
      return {
        message: "Your messages are temporarily unavailable",
        outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Failure,
      };
    }

    const parsedResponse = messageHistoryResponse.safeParse(
      await response.json(),
    );

    if (!parsedResponse.success) {
      return {
        message: "Your messages returned an invalid response",
        outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Failure,
      };
    }

    return {
      messages: parsedResponse.data.data.items,
      nextLastLoadedSequenceNumber:
        parsedResponse.data.data.nextLastLoadedSequenceNumber,
      outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Success,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? "Unable to load your messages"
          : "Unexpected message-history failure",
      outcome: ChatConstantsCollection.MessageHistoryLoadOutcome.Failure,
    };
  }
};
