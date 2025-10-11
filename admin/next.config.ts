import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "globaladvertisingstorage.s3.ap-southeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "globaladvertisingstorage.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "globaladvertisingstorage.s3-ap-southeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "c0.wallpaperflare.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "c0.wallpaperflare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s1.1zoom.me",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
