/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/pos",
        destination: "/orders",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
