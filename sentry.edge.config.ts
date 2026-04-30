import * as Sentry from "@sentry/nextjs"

// Konfigurasi minimal untuk Edge Runtime
// Edge runtime tidak mendukung semua fitur Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // Sample rate lebih rendah untuk edge functions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  debug: false,
})
