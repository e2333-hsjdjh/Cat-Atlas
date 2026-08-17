import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  images: { formats: ["image/avif", "image/webp"] },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
