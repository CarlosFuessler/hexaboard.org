/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensions.push('.wasm');
    return config;
  },
};

export default nextConfig;
