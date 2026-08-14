import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-1c86e428-f69c-4fb5-9b9d-dcf94ac78dd9.space-z.ai",
  ],
};

export default nextConfig;
