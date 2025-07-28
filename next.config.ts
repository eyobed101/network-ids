import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Warning: This allows production builds to succeed even if
    // your project has ESLint errors.
   eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Danger: This allows production builds to succeed even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },  
  
};

export default nextConfig;
