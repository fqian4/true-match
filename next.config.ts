import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // ← 必须：静态导出
  images: {
    unoptimized: true,       // ← 必须：否则 next/image 会报错
  },
  /* 你原来的其它配置继续放这里 */
};

export default nextConfig;
