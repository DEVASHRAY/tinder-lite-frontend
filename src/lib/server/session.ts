import "server-only";

import { cookies } from "next/headers";

export const getAuthenticationCookieHeader = async (): Promise<string> => {
  try {
    const cookieStore = await cookies();

    if (!cookieStore.has("token")) {
      return "";
    }

    return cookieStore.toString();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to read authentication cookies");
  }
};

/*
 * Learning notes
 *
 * Shared session boundary
 * - Protected layouts and server data functions reuse one cookie-reading API.
 * - The helper returns the complete Cookie header because Express, not Next.js,
 *   owns JWT verification and authentication decisions.
 *
 * Next.js versions
 * - Next.js 14.1 exposed synchronous `cookies()`.
 * - Next.js 16.3 requires awaiting this request-time API.
 */
