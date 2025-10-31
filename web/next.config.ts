import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  // Uncomment below for static export (frontend only, API routes won't work)
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;
