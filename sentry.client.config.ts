import * as Sentry from "@sentry/nextjs"

const isDev = process.env.NODE_ENV === "development"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // Sample rate untuk performance tracing
  // 10% di production, 100% di development
  tracesSampleRate: isDev ? 1.0 : 0.1,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask semua teks dan input untuk privasi
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],

  // Jangan log di development untuk mengurangi noise
  debug: false,
})
