# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                 # Dev server on :3000
npm run build               # Production build
npm run lint                # ESLint
npm run format              # Prettier

# Database
npm run db:generate         # Generate Prisma Client
npm run db:migrate          # Run migrations (dev)
npm run db:push             # Push schema without migration file
npm run db:seed             # Seed with tsx prisma/seed.ts
npm run db:studio           # Prisma Studio GUI
npm run db:migrate:prod     # Deploy migrations (prod)

# Testing
npm run test                # Vitest (unit)
npm run test:watch          # Vitest watch
npm run test:e2e            # Playwright E2E
npm run test:e2e:ui         # Playwright UI mode
```

## Architecture

### Stack

Next.js 15 App Router · TypeScript · Prisma + PostgreSQL · NextAuth v5 (beta)

Third-party: Midtrans (payments), Mux (video), Pusher (realtime), Upstash Redis (cache), Cloudflare R2 (file storage, S3-compatible), Resend (email), Sentry (monitoring).

### Route Groups

```
app/
  (auth)/         # Guest-only: login, register, forgot/reset-password
  (dashboard)/    # Authenticated users: tryout, kelas, profil, riwayat, leaderboard
  (admin)/        # ADMIN role only: bank-soal, tryout, kelas, bundel, modul, transaksi, promo
  api/            # All API routes
```

`middleware.ts` enforces RBAC using NextAuth session — roles: `ADMIN`, `INSTRUKTUR`, `PESERTA`.

### Key `lib/` Modules

| Path | Purpose |
|------|---------|
| `lib/auth.ts` / `lib/auth-edge.ts` | NextAuth config (standard + Edge runtime) |
| `lib/prisma.ts` | Prisma client singleton (uses Accelerate) |
| `lib/redis.ts` | Upstash Redis client |
| `lib/storage.ts` | Cloudflare R2 via AWS S3 SDK |
| `lib/mux.ts` | Mux video client |
| `lib/env.ts` | Zod-validated env vars — import `env` from here, not `process.env` directly |
| `lib/payment/` | Midtrans helpers |
| `lib/scoring/` | Tryout scoring logic per category |
| `lib/tryout/` | Session/cache helpers |
| `lib/soal/` | Question bank utilities |
| `lib/security/` | Rate limiting, lockout logic |

### Database Schema Domains

1. **Auth** — `User` (role: ADMIN/INSTRUKTUR/PESERTA), `Account`, `Session`, `VerificationToken`
2. **Bank Soal** — `Soal` (Markdown+LaTeX), `OpsiJawaban`; enums: `KategoriUjian` (CPNS_SKD/SEKDIN/UTBK_SNBT), `SubtesType` (TWK/TIU/TKP + UTBK variants), `TipeSoal`
3. **Paket Tryout** — `PaketTryout`, `PaketTryoutSoal`, `BundelTryout`, `BundelTryoutPaket`
4. **Sesi Tryout** — `TryoutSession` (status: ACTIVE/COMPLETED/EXPIRED/ABANDONED), `JawabanPeserta`, `HasilTryout` (`skorPerSubtes` as JSON `{ TWK: 85, TIU: 90, TKP: 150 }`)
5. **Kelas & Modul** — `Kelas`, `Modul`, `KontenModul` (tipe: TEKS/PDF/VIDEO/LINK_EKSTERNAL), `Enrollment`, `VideoProgress`
6. **Live Class** — `LiveClass` (status: SCHEDULED/LIVE/ENDED), `LiveClassChat`
7. **Transaksi** — `Transaction`, `TransactionItem`; status: PENDING/PROCESSING/SUCCESS/FAILED/EXPIRED/CANCELLED
8. **Gamifikasi** — `LeaderboardEntry`, `UserBadge`, `Subscription`

### API Route Pattern

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // validate role for admin routes: session.user.role !== "ADMIN"
  // validate body with Zod
  // return NextResponse.json(data)
}
```

### Payment Flow (Midtrans)

1. `POST /api/payment/create` → creates `Transaction` + Midtrans Snap token
2. Frontend loads Snap script, user pays
3. `POST /api/payment/webhook/midtrans` → updates Transaction status → grants access (Enrollment or tryout unlock)

Sandbox keys prefixed `SB-Mid-`. CSP in `next.config.ts` allows Midtrans domains.

### File Uploads

- Images/PDFs → `POST /api/upload` returns presigned R2 URL → client uploads directly to R2
- Videos → `POST /api/upload/mux` creates Mux asset → webhook at `/api/webhooks/mux` stores `muxPlaybackId`

### Realtime

Pusher channels for `LiveClass` chat. Private channel auth at `/api/pusher/auth`.

### Seeding

- Entry: `prisma/seed.ts` (orchestrates imports)
- Separated files: `prisma/seed-kelas-cpns.ts`, `prisma/seed-paket-tryout.ts`, `prisma/cpns-berbayar.seed.ts`, `prisma/cpns-paket-c.seed.ts`, `prisma/cpns-paket-d.seed.ts`, `prisma/cpns-paket-e.seed.ts`
- Add new seeds as separate files and import in `seed.ts`

## Important Notes

- `ignoreBuildErrors: true` in `next.config.ts` — TypeScript/ESLint errors won't fail the build but should be fixed before production
- Database uses Prisma Accelerate (`DATABASE_URL = prisma://`); migrations need `DIRECT_URL` (direct PostgreSQL connection)
- All env vars validated via Zod in `lib/env.ts` — always use `env.VAR_NAME` not `process.env.VAR_NAME`
- Cron job: `GET /api/cron/subscription-check` (requires `CRON_SECRET` header)
- Next.js output mode: `standalone` (Docker-friendly)
