"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ChatConstantsCollection } from "@/features/chat/chat.constants";
import type { ConversationInboxItem } from "@/features/chat/chat.data";
import { chatSocket } from "@/features/chat/chat-socket";
import { ProfileAvatar } from "@/features/profile/profile-avatar";

interface ConversationInboxProps {
  initialConversations: ConversationInboxItem[];
}

const inboxDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export const ConversationInbox = ({
  initialConversations,
}: ConversationInboxProps) => {
  useEffect(() => {
    const acknowledgeDeliveredMessages = () => {
      for (const conversation of initialConversations) {
        if (!conversation.lastMessage.deliveryAcknowledgementRequired) {
          continue;
        }

        chatSocket.emit("message.mark-delivered", {
          conversationId: conversation.conversationId,
          sequenceNumber: conversation.lastMessage.sequenceNumber,
        });
      }
    };

    chatSocket.on("connect", acknowledgeDeliveredMessages);

    if (chatSocket.connected) {
      acknowledgeDeliveredMessages();
    }

    return () => {
      chatSocket.off("connect", acknowledgeDeliveredMessages);
    };
  }, [initialConversations]);

  if (!initialConversations.length) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white/70 px-6 py-14 text-center">
        <h2 className="text-lg font-semibold">No messages yet</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your conversations will appear here after you message a match.
        </p>
      </div>
    );
  }

  return (
    <ul
      aria-label="Conversation inbox"
      className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white"
    >
      {initialConversations.map((conversation) => {
        const peerName = conversation.peer.name ?? "Tinder Lite member";
        const deliveryStatus = conversation.lastMessage.deliveryStatus;

        return (
          <li
            key={conversation.conversationId}
            className="border-b border-zinc-100 last:border-b-0"
          >
            <Link
              href={`/chat/${conversation.connectionId}`}
              className="flex min-h-20 items-center gap-4 px-4 py-3 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#f32672]/20"
            >
              <ProfileAvatar
                className="size-14 rounded-full text-base"
                name={peerName}
                photoUrl={conversation.peer.photoUrl ?? undefined}
                sizes="56px"
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold">{peerName}</span>
                  <time
                    dateTime={conversation.lastMessage.createdAt}
                    className="shrink-0 text-xs text-zinc-400"
                  >
                    {inboxDateFormatter.format(
                      new Date(conversation.lastMessage.createdAt),
                    )}
                  </time>
                </span>

                <span className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                  {conversation.lastMessage.sentByAuthenticatedUser &&
                  deliveryStatus ? (
                    <span
                      aria-label={
                        deliveryStatus ===
                        ChatConstantsCollection.MessageDeliveryStatus.Read
                          ? "Read"
                          : deliveryStatus ===
                              ChatConstantsCollection.MessageDeliveryStatus
                                .Delivered
                            ? "Delivered"
                            : "Sent"
                      }
                      className={
                        deliveryStatus ===
                        ChatConstantsCollection.MessageDeliveryStatus.Read
                          ? "shrink-0 font-semibold text-sky-500"
                          : "shrink-0 font-semibold text-zinc-400"
                      }
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 18 14"
                        className="h-3.5 w-[1.125rem]"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        {deliveryStatus ===
                        ChatConstantsCollection.MessageDeliveryStatus.Sent ? (
                          <path d="m3 7 3 3 7-7" />
                        ) : (
                          <>
                            <path d="m1 7 3 3 7-7" />
                            <path d="m6 8 3 3 7-7" />
                          </>
                        )}
                      </svg>
                    </span>
                  ) : null}
                  <span className="truncate">
                    {conversation.lastMessage.textPreview}
                  </span>
                </span>
              </span>

              {conversation.unreadCount ? (
                <span
                  aria-label={`${String(conversation.unreadCount)} unread messages`}
                  className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-[#f32672] px-1.5 py-1 text-xs font-bold text-white"
                >
                  {conversation.unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

/*
 * React 19 uses the same Effect setup/cleanup model as React 18.2 here. The
 * Effect registers one connection listener and removes that exact listener
 * when the inbox unmounts, while the parent Chat layout owns the socket itself.
 */
