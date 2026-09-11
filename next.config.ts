import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Railway's containerized builds mount `.next/cache` as a persistent
    // volume across deploys but don't guarantee it's ever cleanly restored
    // (a build that dies partway through can leave it corrupted) — Next's
    // own docs call this out as exactly the case to disable this in. We hit
    // it for real: a corrupted Turbopack build cache from an earlier failed
    // deploy was poisoning every subsequent build with the same
    // "cache corruption... checksum mismatch" fatal error. This is a small
    // app where the build-cache speedup doesn't matter much, so disabling
    // it outright is simpler and more robust than trying to keep a
    // container-mounted cache directory healthy across deploys.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "contribution.usercontent.google.com",
      },
    ],
  },
};

export default nextConfig;
