import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/**",
      },
    ],
    // Cho phép proxy URL từ cùng domain với query string
    localPatterns: [
      {
        pathname: "/api/admin/images/proxy**",
      },
      {
        pathname: "/uploads/**",
      },
    ],
    unoptimized: false,
  },
  // Tắt source map trong dev mode để tránh lỗi source map
  productionBrowserSourceMaps: false,
  // Cấu hình Turbopack (dùng cho dev mode trong Next.js 16)
  turbopack: {},
  // Server-only packages - không bundle cho client
  serverExternalPackages: ['mysql2', 'bcryptjs'],
  // Cấu hình webpack (dùng cho production build)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = false;
    }
    
    // Only include mysql2 on server side
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        readline: false,
        timers: false,
        stream: false,
        crypto: false,
        zlib: false,
        http: false,
        https: false,
        os: false,
        path: false,
        url: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;

