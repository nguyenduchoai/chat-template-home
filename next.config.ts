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
    ],
    unoptimized: false,
  },
  // Tắt source map trong dev mode để tránh lỗi source map
  productionBrowserSourceMaps: false,
  // Cấu hình Turbopack (dùng cho dev mode trong Next.js 16)
  // Thêm config rỗng để silence warning về Turbopack
  turbopack: {},
  // Cấu hình webpack (dùng cho production build)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
