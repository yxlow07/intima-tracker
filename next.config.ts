import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  output: "standalone",
  "allowedDevOrigins": ["http://localhost:3000"],
};

export default nextConfig;
