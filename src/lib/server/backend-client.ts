import "server-only";

interface BackendRequestInput {
  body?: string;
  contentType?: string;
  cookie?: string;
  method: string;
  path: string;
  signal?: AbortSignal;
}

const getBackendOrigin = (): string => {
  const backendOrigin = process.env["TINDER_API_ORIGIN"];

  if (!backendOrigin) {
    throw new Error("TINDER_API_ORIGIN is required");
  }

  return backendOrigin;
};

export const requestBackend = async ({
  path,
  method,
  body,
  contentType,
  cookie,
  signal,
}: BackendRequestInput): Promise<Response> => {
  const headers = new Headers();

  if (contentType) {
    headers.set("content-type", contentType);
  } else if (body) {
    headers.set("content-type", "application/json");
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  try {
    return await fetch(new URL(path, getBackendOrigin()), {
      method,
      body,
      headers,
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Backend request failed");
  }
};

/*
 * Learning notes
 *
 * Server boundary
 * - `server-only` makes the build fail if browser code imports this file.
 * - Only environment variables prefixed with `NEXT_PUBLIC_` are included in
 *   browser JavaScript. `TINDER_API_ORIGIN` therefore stays on the server.
 *
 *
 * URL construction
 * - `new URL(path, origin)` safely combines the Express origin and route path.
 *
 *   Local:
 *   origin = `http://localhost:4000`
 *   path   = `/api/v1/auth/login`
 *   result = `http://localhost:4000/api/v1/auth/login`
 *
 *   Production:
 *   origin = `https://api.tinder-lite.com`
 *   path   = `/api/v1/auth/login`
 *   result = `https://api.tinder-lite.com/api/v1/auth/login`
 *
 * Request content type
 * - An incoming content type is forwarded unchanged.
 * - A request with a body but no content type defaults to `application/json`,
 *   which matches the current Express API contract.
 *
 * Fetch caching
 * - Next.js extends server-side `fetch`. `cache: "no-store"` makes every
 *   request reach Express instead of entering Next.js's persistent data cache.
 * - Passing the browser request signal cancels the Express request when the
 *   browser disconnects before the response completes.
 */
