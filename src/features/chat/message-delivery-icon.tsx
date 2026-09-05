import { ChatConstantsCollection } from "@/features/chat/chat.constants";

type MessageDeliveryStatus =
  (typeof ChatConstantsCollection.MessageDeliveryStatus)[keyof typeof ChatConstantsCollection.MessageDeliveryStatus];

interface MessageDeliveryIconProps {
  status: MessageDeliveryStatus;
}

export const MessageDeliveryIcon = ({ status }: MessageDeliveryIconProps) => {
  const label =
    status === ChatConstantsCollection.MessageDeliveryStatus.Read
      ? "Read"
      : status === ChatConstantsCollection.MessageDeliveryStatus.Delivered
        ? "Delivered"
        : "Sent";

  return (
    <span
      aria-label={label}
      className={
        status === ChatConstantsCollection.MessageDeliveryStatus.Read
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
        {status === ChatConstantsCollection.MessageDeliveryStatus.Sent ? (
          <path d="m3 7 3 3 7-7" />
        ) : (
          <>
            <path d="m1 7 3 3 7-7" />
            <path d="m6 8 3 3 7-7" />
          </>
        )}
      </svg>
    </span>
  );
};
