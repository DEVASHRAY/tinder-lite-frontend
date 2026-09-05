import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ChatConstantsCollection } from "@/features/chat/chat.constants";
import { loadConversationInbox } from "@/features/chat/chat.data";
import { ProfileAvatar } from "@/features/profile/profile-avatar";

export const metadata: Metadata = {
  title: "Messages | Tinder Lite",
  description: "Continue conversations with your Tinder Lite matches.",
};

const inboxDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const ChatInboxPage = async () => {
  let result: Awaited<ReturnType<typeof loadConversationInbox>>;

  try {
    result = await loadConversationInbox();
  } catch (error) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-10 sm:px-6">
        <p
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          {error instanceof Error
            ? "Unable to load your conversations"
            : "Unexpected conversation inbox failure"}
        </p>
      </main>
    );
  }

  if (
    result.outcome ===
    ChatConstantsCollection.ConversationInboxLoadOutcome.Unauthorized
  ) {
    redirect("/login");
  }

  if (
    result.outcome ===
    ChatConstantsCollection.ConversationInboxLoadOutcome.Failure
  ) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-10 sm:px-6">
        <p
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          {result.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-10 text-zinc-950 sm:px-6">
      <section className="mx-auto max-w-2xl">
        <p className="text-xs font-bold tracking-[0.18em] text-[#d91d60] uppercase">
          Your conversations
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
          Messages
        </h1>

        {result.conversations.length ? (
          <ul
            aria-label="Conversation inbox"
            className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white"
          >
            {result.conversations.map((conversation) => {
              const peerName =
                conversation.peer.name ?? "Tinder Lite member";
              const deliveryStatus =
                conversation.lastMessage.deliveryStatus;

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
                        <span className="truncate font-semibold">
                          {peerName}
                        </span>
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
                                    ChatConstantsCollection
                                      .MessageDeliveryStatus.Delivered
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
                            {deliveryStatus ===
                            ChatConstantsCollection.MessageDeliveryStatus.Sent
                              ? "✓"
                              : "✓✓"}
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
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white/70 px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">No messages yet</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Your conversations will appear here after you message a match.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default ChatInboxPage;

/*
 * The inbox remains a Server Component, so its first page and Zod validation
 * ship no client JavaScript. Next.js 14.1 also supported this App Router
 * pattern; Next.js 16 keeps the same Server Component boundary.
 */
