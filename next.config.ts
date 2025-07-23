import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: [
      'www.freeiconspng.com',
      
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

export default nextConfig;
