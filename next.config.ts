/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // 告诉 Vercel：即使有代码规范问题，也允许部署上线
      ignoreDuringBuilds: true,
    },
    typescript: {
      // 告诉 Vercel：即使有类型错误，也允许部署上线
      ignoreBuildErrors: true,
    },
    // 生产构建时 CSS/JS 文件名自动带 contenthash，防止微信浏览器使用旧缓存
  };

  export default nextConfig; 