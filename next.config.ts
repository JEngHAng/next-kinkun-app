import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fxuqbiieaptqndnqqyuo.supabase.co",
        port: "",
        // ใช้แบบนี้จะปลอดภัยและครอบคลุมการดึงรูปจากทุก Bucket ครับ
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;