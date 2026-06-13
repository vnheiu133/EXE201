/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:5278"

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/chathub",
        destination: `${apiOrigin}/chathub`,
      },
      {
        source: "/chathub/:path*",
        destination: `${apiOrigin}/chathub/:path*`,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
}

export default nextConfig
