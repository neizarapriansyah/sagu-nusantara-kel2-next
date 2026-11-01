/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 adalah modul native, jangan di-bundle oleh Next
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
