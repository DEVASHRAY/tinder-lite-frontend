import "server-only";

import { z } from "zod";

import { ChatConstantsCollection } from "@/features/chat/chat.constants";
import { requestBackend } from "@/lib/server/backend-client";
import { getAuthenticationCookieHeader } from "@/lib/server/session";

const objectId = z.string().regex(/^[0-9a-f]{24}$/u);

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
    sequenceNumber: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
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

export type ConversationInboxItem = z.infer<typeof conversationInboxItem>;

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
