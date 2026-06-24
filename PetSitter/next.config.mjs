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
      {
        source: "/notificationhub",
        destination: `${apiOrigin}/notificationhub`,
      },
      {
        source: "/notificationhub/:path*",
        destination: `${apiOrigin}/notificationhub/:path*`,
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  devIndicators: false,
}

export default nextConfig
