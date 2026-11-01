import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server.js for the container image (see Dockerfile).
  output: "standalone",
  // The site does not use next/image. Turning optimization off removes the
  // /_next/image endpoint, which has had remote code execution bugs.
  images: { unoptimized: true },
  // Do not advertise the framework in every response.
  poweredByHeader: false,
};

export default nextConfig;
