/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lumora needs SSR / dynamic routes — do not set output: 'export' (static export breaks
  // error page generation and causes next/document <Html> errors on some hosts).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "i.ytimg.com" }
    ]
  }
};

module.exports = nextConfig;
