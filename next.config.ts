import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 关键：允许静态导出
  allowedDevOrigins: ['127.0.0.1', '198.18.0.1'],
  images: {
    unoptimized: true, // 静态导出必须禁用 Next 默认的图片优化
  },
};

export default nextConfig;
