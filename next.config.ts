import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@playwright/browser-chromium'],
};

export default nextConfig;
