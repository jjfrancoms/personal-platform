import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@personal-platform/ui",
    "@personal-platform/database",
    "@personal-platform/storage",
    "@personal-platform/processors",
  ],
};

export default nextConfig;
