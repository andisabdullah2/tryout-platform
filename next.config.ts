import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

// Ambil domain produksi dari env (tanpa protokol)
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const appDomain = appUrl.replace(/^https?:\/\//, "")

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", appDomain],
    },
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== "production"

    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self + Midtrans Snap + Sentry CDN
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://browser.sentry-cdn.com",
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images: self + R2 + Mux + Google
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://image.mux.com https://lh3.googleusercontent.com",
      // Fonts: self
      "font-src 'self' data:",
      // Connect: self + semua layanan third-party
      "connect-src 'self' https://*.upstash.io https://*.pusher.com wss://*.pusher.com https://api.midtrans.com https://api.sandbox.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com https://*.sentry.io https://accelerate.prisma-data.net",
      // Media: self + Mux
      "media-src 'self' https://stream.mux.com",
      // Frame: Midtrans Snap popup
      "frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com",
      // Object: none
      "object-src 'none'",
      // Base URI: self
      "base-uri 'self'",
      // Form action: self
      "form-action 'self'",
      // Upgrade insecure requests di production
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ]

    const headers = [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HSTS — hanya di production
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ]

    return headers
  },

  async redirects() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
    const redirects = []

    // Redirect www ke non-www jika NEXT_PUBLIC_APP_URL tidak mengandung www
    if (appUrl && !appUrl.includes("://www.")) {
      const nonWwwDomain = appDomain
      redirects.push({
        source: "/:path*",
        has: [
          {
            type: "host" as const,
            value: `www.${nonWwwDomain}`,
          },
        ],
        destination: `${appUrl}/:path*`,
        permanent: true,
      })
    }

    return redirects
  },
}

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG ?? "your-sentry-org",
  project: process.env.SENTRY_PROJECT ?? "tryout-platform",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: process.env.CI === "true",
  hideSourceMaps: true,
  disableLogger: true,
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
