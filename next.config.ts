import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Manually define the project root for Turbopack to prevent workspace root warning
    root: process.cwd(),
  },
};

export default nextConfig;
