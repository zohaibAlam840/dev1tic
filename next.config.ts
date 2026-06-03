import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin uses Node.js-only APIs — keep it out of the client bundle
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "google-auth-library",
    "@opentelemetry/api",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb", // covers 50 MB video + multipart overhead
    },
  },
};

export default nextConfig;
