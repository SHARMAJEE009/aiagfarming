import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
  serverExternalPackages: ["pdf-parse", "pdf-parse/lib/pdf-parse"],
};

export default nextConfig;
