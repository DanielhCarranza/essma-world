import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lib files use NodeNext `.js` specifiers; webpack must map those to `.ts`.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
