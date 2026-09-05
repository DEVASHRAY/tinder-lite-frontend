"use client";

import { useEffect } from "react";

import { chatSocket } from "@/features/chat/chat-socket";

const ChatLayout = ({ children }: LayoutProps<"/chat">) => {
  useEffect(() => {
    // Entering any Chat page opens the one shared connection.
    chatSocket.connect();

    return () => {
      // Leaving the Chat section releases its connection and heartbeat work.
      chatSocket.disconnect();
    };
  }, []);

  return children;
};

export default ChatLayout;

/*
 * This nested layout remains mounted while navigating between the Chat inbox
 * and conversations, so those pages reuse one socket. Next.js 14.1 App Router
 * layouts had the same persistence behavior; Next.js 16 keeps that model.
 * Next.js 16 generated `LayoutProps` supplies route-aware layout typing;
 * Next.js 14.1 commonly used a handwritten `{ children: ReactNode }` prop.
 */
