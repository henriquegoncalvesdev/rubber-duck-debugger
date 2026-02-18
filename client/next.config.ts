import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Manual root configuration for Turbopack
  turbopack: {
    root: "/Users/henriquegoncalves/Documents/Projects/rubber-duck-debugger",
  },
};

export default nextConfig;
