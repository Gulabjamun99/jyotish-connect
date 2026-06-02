import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";
import path from "path";

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false, // Eliminate start-url Babel transpile helper reference crash
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        module: false,
        fs: false,
        path: false,
        url: false,
        crypto: false,
      };
    }

    // Add support for WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Copy WASM and Ephemeris data to public folder during build
    // This ensures they are available on Vercel
    config.plugins.push(
      new (require("copy-webpack-plugin"))({
        patterns: [
          {
            // Use absolute path for robustness on different build environments
            from: path.join(process.cwd(), "node_modules/swisseph-wasm/wsam/swisseph.wasm"),
            to: path.join(process.cwd(), "public/swisseph.wasm"),
          },
          {
            from: path.join(process.cwd(), "node_modules/swisseph-wasm/wsam/swisseph.data"),
            to: path.join(process.cwd(), "public/swisseph.data"),
          },
        ],
      })
    );

    return config;
  },
  serverExternalPackages: ["swisseph-wasm"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default withNextIntl(withPWA(nextConfig));
