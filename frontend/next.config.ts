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
        hostname: "demo-advertise.s3-ap-southeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
