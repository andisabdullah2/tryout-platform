import { z } from "zod"

// ============================================================
// Schema validasi environment variables
// ============================================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET wajib diisi"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL harus berupa URL yang valid"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID wajib diisi"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET wajib diisi"),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY wajib diisi"),

  // Mux
  MUX_TOKEN_ID: z.string().min(1, "MUX_TOKEN_ID wajib diisi"),
  MUX_TOKEN_SECRET: z.string().min(1, "MUX_TOKEN_SECRET wajib diisi"),

  // Cloudflare R2
  R2_ENDPOINT: z.string().url("R2_ENDPOINT harus berupa URL yang valid"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID wajib diisi"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY wajib diisi"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME wajib diisi"),

  // Midtrans
  MIDTRANS_SERVER_KEY: z.string().min(1, "MIDTRANS_SERVER_KEY wajib diisi"),
  MIDTRANS_CLIENT_KEY: z.string().min(1, "MIDTRANS_CLIENT_KEY wajib diisi"),

  // Pusher
  PUSHER_APP_ID: z.string().min(1, "PUSHER_APP_ID wajib diisi"),
  PUSHER_KEY: z.string().min(1, "PUSHER_KEY wajib diisi"),
  PUSHER_SECRET: z.string().min(1, "PUSHER_SECRET wajib diisi"),
  PUSHER_CLUSTER: z.string().min(1, "PUSHER_CLUSTER wajib diisi"),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL harus berupa URL yang valid"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN wajib diisi"),

  // Public vars
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL harus berupa URL yang valid"),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1, "NEXT_PUBLIC_PUSHER_KEY wajib diisi"),
  NEXT_PUBLIC_PUSHER_CLUSTER: z
    .string()
    .min(1, "NEXT_PUBLIC_PUSHER_CLUSTER wajib diisi"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY wajib diisi"),

  // Sentry — opsional, hanya wajib di production
  SENTRY_DSN: z
    .string()
    .url("SENTRY_DSN harus berupa URL yang valid")
    .optional()
    .refine(
      (val) => {
        if (process.env.NODE_ENV === "production" && !val) {
          return false
        }
        return true
      },
      { message: "SENTRY_DSN wajib diisi di environment production" }
    ),
})

// ============================================================
// Validasi dan export env object
// ============================================================

function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n")

    console.error(
      `❌ Validasi environment variables gagal:\n${messages}\n\nPastikan semua variabel yang diperlukan sudah dikonfigurasi.`
    )

    // Hanya throw di production untuk menghindari gangguan development
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Environment variables tidak valid:\n${messages}`)
    }
  }

  return parsed.data ?? (process.env as unknown as z.infer<typeof envSchema>)
}

export const env = validateEnv()

export type Env = z.infer<typeof envSchema>
