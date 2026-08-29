import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
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
      {
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**",
        protocol: "https",
        search: "?width=800",
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
 *   seed portraits and gender default avatars instead of accepting arbitrary
 *   remote hosts. Wikimedia seed portraits are restricted to the file endpoint
 *   and the generator's exact width query.
 * - Next.js 14.1 also used `remotePatterns`; object-based patterns remain the
 *   explicit, least-permissive option in Next.js 16.
 *
 * Image qualities
 * - Next.js 16 only allows quality `75` unless `images.qualities` lists more
 *   values. Next.js 14.1 accepted any quality from 1 to 100.
 */
