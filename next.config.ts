import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isAnalyze = process.env.ANALYZE === "true";

const withBundle = withBundleAnalyzer({
  enabled: isAnalyze,
});

const nextConfig: NextConfig = {
  images: {
    domains: [
      'www.freeiconspng.com',
      'picsum.photos'
    ],    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trainit404.s3.amazonaws.com",
        port: "",
        pathname: "/**"
      }
    ]
  },
};

export default withBundle(nextConfig);
