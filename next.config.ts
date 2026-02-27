import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tutor-provide-primary.ap-south-1.linodeobjects.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/config.ts");
export default withNextIntl(nextConfig);
