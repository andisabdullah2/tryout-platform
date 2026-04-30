/**
 * Sentry error tracking configuration.
 * Digunakan untuk monitoring error di production.
 *
 * Setup:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set SENTRY_DSN di environment variables
 */

/**
 * Capture exception ke Sentry (jika tersedia).
 * Fallback ke console.error jika Sentry tidak dikonfigurasi.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    // Sentry akan di-import secara dinamis untuk menghindari bundle size di development
    import("@sentry/nextjs")
      .then(({ captureException: sentryCaptureException, withScope }) => {
        if (context) {
          withScope((scope) => {
            scope.setExtras(context)
            sentryCaptureException(error)
          })
        } else {
          sentryCaptureException(error)
        }
      })
      .catch(() => {
        console.error("Sentry not available:", error)
      })
  } else {
    console.error("Error captured:", error, context)
  }
}

/**
 * Capture pesan informasional ke Sentry.
 * Berguna untuk logging event penting tanpa error.
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    import("@sentry/nextjs")
      .then(({ captureMessage: sentryCaptureMessage, withScope }) => {
        if (context) {
          withScope((scope) => {
            scope.setExtras(context)
            sentryCaptureMessage(message, level)
          })
        } else {
          sentryCaptureMessage(message, level)
        }
      })
      .catch(() => {
        console.info("Sentry not available, message:", message)
      })
  } else {
    console.info(`[${level.toUpperCase()}] ${message}`, context)
  }
}

/**
 * Set tag pada Sentry scope untuk filtering dan grouping.
 * Tag berguna untuk mengelompokkan error berdasarkan konteks.
 *
 * @example
 * setTag("feature", "tryout-session")
 * setTag("paket_id", paketId)
 */
export function setTag(key: string, value: string): void {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    import("@sentry/nextjs")
      .then(({ setTag: sentrySetTag }) => {
        sentrySetTag(key, value)
      })
      .catch(() => null)
  }
}

/**
 * Set user context untuk Sentry.
 */
export function setSentryUser(user: { id: string; email?: string; role?: string } | null): void {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    import("@sentry/nextjs")
      .then(({ setUser }) => {
        setUser(user)
      })
      .catch(() => null)
  }
}
