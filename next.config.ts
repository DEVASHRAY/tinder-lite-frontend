import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
        protocol: "https",
      },
      {
        hostname: "media.istockphoto.com",
        pathname: "/id/**",
        protocol: "https",
      },
      {
        hostname: "cdn.vectorstock.com",
        pathname: "/i/**",
        protocol: "https",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/",
      destination: "/feed",
      permanent: false,
    },
  ],
};

export default nextConfig;

/*
 * Learning notes
 *
 * Next.js config redirects
 * - Next.js 16 applies this known unconditional redirect before Proxy and route
 *   rendering, so `/` remains outside the authenticated Proxy matcher.
 * - Next.js 14.1 used the same `redirects()` config API; its request
 *   interception convention was still named `middleware.ts`.
 *
 * Remote image allowlist
 * - Next.js optimizes only the HTTPS image hosts currently returned by Express
 *   seed portraits (`images.unsplash.com/photo-*`) and gender default avatars
 *   instead of accepting arbitrary remote hosts.
 * - Next.js 14.1 also used `remotePatterns`; object-based patterns remain the
 *   explicit, least-permissive option in Next.js 16.
 */
