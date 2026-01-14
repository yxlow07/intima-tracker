import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  output: "standalone",
  "allowedDevOrigins": ["http://localhost:3000"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ideas",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/ideas",
        permanent: false,
      },
      {
        source: "/admin/:path((?!ideas|login).*)",
        destination: "/admin/ideas",
        permanent: false,
      },
      {
        source: "/:path((?!ideas|admin|api|_next|static|public|favicon.ico).*)",
        destination: "/ideas",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
