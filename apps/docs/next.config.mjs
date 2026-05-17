import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/r/:path*",
          destination: "/api/registry/:path*",
        },
      ],
    };
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default withNextIntl(withMDX(config));
