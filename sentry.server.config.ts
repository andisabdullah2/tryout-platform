import * as Sentry from "@sentry/nextjs"

const isDev = process.env.NODE_ENV === "development"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // Sample rate untuk performance tracing
  // 10% di production, 100% di development
  tracesSampleRate: isDev ? 1.0 : 0.1,

  integrations: [
    // Profiling Node.js untuk performance monitoring
    Sentry.nodeProfilingIntegration(),
  ],

  // Jangan log di development untuk mengurangi noise
  debug: false,
})
