
import type { NextConfig } from "next";
 
 const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
     {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Minimal CSP; tighten as you enumerate all sources you need
          { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:;" },
        ],
      },
    ];
  },
 };
 
 export default nextConfig;
