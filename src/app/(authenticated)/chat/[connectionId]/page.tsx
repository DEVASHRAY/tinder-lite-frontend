import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChatConstantsCollection } from "@/features/chat/chat.constants";
import { loadMessageHistory } from "@/features/chat/chat.data";
import { MessageDeliveryIcon } from "@/features/chat/message-delivery-icon";

export const metadata: Metadata = {
  title: "Conversation | Tinder Lite",
  description: "Read your Tinder Lite conversation.",
};

const messageTimeFormatter = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

const ChatConversationPage = async ({
  params,
}: PageProps<"/chat/[connectionId]">) => {
  let connectionId: string;

  try {
    connectionId = (await params).connectionId.trim();
  } catch (error) {
    if (error instanceof Error) {
      notFound();
    }

    notFound();
  }

  let result: Awaited<ReturnType<typeof loadMessageHistory>>;

  try {
    result = await loadMessageHistory({ connectionId });
  } catch (error) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-10 sm:px-6">
        <p
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          {error instanceof Error
            ? "Unable to load your messages"
            : "Unexpected message-history failure"}
        </p>
      </main>
    );
  }

  if (
    result.outcome ===
    ChatConstantsCollection.MessageHistoryLoadOutcome.Unauthorized
  ) {
    redirect("/login");
  }

  if (
    result.outcome === ChatConstantsCollection.MessageHistoryLoadOutcome.Missing
  ) {
    notFound();
  }

  if (
    result.outcome === ChatConstantsCollection.MessageHistoryLoadOutcome.Failure
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
    <main className="min-h-[calc(100svh-4rem)] bg-[#fff8f6] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <header className="flex min-h-16 items-center gap-3 border-b border-zinc-100 px-4">
          <Link
            href="/chat"
            aria-label="Back to inbox"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f32672]/20"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>

          <div>
            <h1 className="font-semibold">Conversation</h1>
            <p className="text-xs text-zinc-500">Your latest messages</p>
          </div>
        </header>

        {result.messages.length ? (
          <ol
            aria-label="Message history"
            className="flex min-h-[28rem] flex-col justify-end gap-2 bg-[#fff8f6]/70 px-4 py-5"
          >
            {result.messages.map((message) => {
              const sentByAuthenticatedUser = Boolean(message.deliveryStatus);

              return (
                <li
                  key={message.id}
                  className={
                    sentByAuthenticatedUser
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <article
                    className={
                      sentByAuthenticatedUser
                        ? "max-w-[82%] rounded-2xl rounded-br-md border border-[#f32672]/15 bg-[#fff0f5] px-3.5 py-2 text-zinc-950 shadow-sm"
                        : "max-w-[82%] rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-2 text-zinc-950 shadow-sm"
                    }
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-5">
                      {message.text}
                    </p>
                    <span
                      className={
                        sentByAuthenticatedUser
                          ? "mt-1 flex items-center justify-end gap-1 text-[0.6875rem] text-zinc-400"
                          : "mt-1 flex justify-end text-[0.6875rem] text-zinc-400"
                      }
                    >
                      <time dateTime={message.createdAt}>
                        {messageTimeFormatter.format(
                          new Date(message.createdAt),
                        )}
                      </time>
                      {message.deliveryStatus ? (
                        <MessageDeliveryIcon status={message.deliveryStatus} />
                      ) : null}
                    </span>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex min-h-[28rem] items-center justify-center bg-[#fff8f6]/70 px-6 text-center">
            <div>
              <h2 className="text-lg font-semibold">No messages yet</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Start the conversation when you are ready.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default ChatConversationPage;

/*
 * Next.js 16 generated `PageProps` provides the typed dynamic route parameter,
 * and `params` must be awaited before reading `connectionId`. Next.js 14.1
 * commonly used handwritten props and exposed route parameters synchronously.
 */
