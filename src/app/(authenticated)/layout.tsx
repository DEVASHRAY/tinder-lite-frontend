import type { ReactNode } from "react";

import { AuthenticatedHeader } from "@/features/navigation/authenticated-header";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <>
      <AuthenticatedHeader />
      {children}
    </>
  );
};

export default AuthenticatedLayout;

/*
 * Learning notes
 *
 * Protected route group
 * - Parentheses organize routes without changing their public URLs, so
 *   `(authenticated)/feed` remains `/feed`.
 * - This layout owns the shared authenticated header but does not act as the
 *   security boundary.
 * - The header waits for the viewer avatar so the Client Component hydrates
 *   against one tree. A Suspense fallback header previously mismatched the
 *   resolved avatar and blocked clicks with the Next.js overlay.
 * - Next.js layouts can be reused during client navigation, so `proxy.ts`
 *   performs the centralized optimistic cookie check instead.
 * - Express still validates the JWT and authorizes every data request.
 *
 * React 18.2 and Next.js 14.1
 * - React 18 Server Components also supported shared layouts through Next.js.
 * - Next.js 14.1 called its request interception file `middleware.ts`; Next.js
 *   16 renamed that network boundary to `proxy.ts`.
 */
