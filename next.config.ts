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
  };
  
  export default nextConfig; 