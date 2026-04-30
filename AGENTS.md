# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**tryout-platform** is an online exam platform for Indonesian standardized tests (CPNS SKD, UTBK/SNBT, Sekdin). Built with Next.js 15, PostgreSQL/Prisma, and NextAuth v5. Supports tryout sessions, video courses (Mux), payments (Midtrans), and real-time features (Pusher).

## Development Commands

```bash
# Development
npm run dev                 # Start dev server on :3000

# Database
npm run db:generate         # Generate Prisma Client
npm run db:migrate          # Run migrations (dev)
npm run db:push             # Push schema changes without migration
npm run db:seed             # Seed database with test data
npm run db:studio           # Open Prisma Studio

# Production Database
npm run db:migrate:prod     # Deploy migrations (prod)
npm run db:generate:prod    # Generate client (prod)

# Testing
npm run test                # Run Vitest tests
npm run test:watch          # Run Vitest in watch mode
npm run test:ui             # Open Vitest UI
npm run test:e2e            # Run Playwright E2E tests
npm run test:e2e:ui         # Open Playwright UI
npm run test:e2e:report     # Show Playwright report

# Build & Deploy
npm run build               # Production build
npm run start               # Start production server
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
```

## Architecture

### Route Groups & Access Control

Next.js App Router with route group-based auth:

- `(auth)/*` - Guest-only: login, register, forgot-password, reset-password
- `(dashboard)/*` - Authenticated users: tryout sessions, kelas, profil, leaderboard, riwayat
- `(admin)/*` - Admin-only: bank-soal, tryout management, kelas, bundel, modul, pengguna, transaksi, promo, analitik

Middleware (`middleware.ts`) enforces role-based access using NextAuth session.

### Database Schema (Prisma)

**Key domains in `prisma/schema.prisma`:**

1. **Autentikasi & Pengguna**
   - `User` (role: ADMIN | INSTRUKTUR | PESERTA)
   - NextAuth tables: Account, Session, VerificationToken

2. **Bank Soal**
   - `Soal` - Questions with Markdown+LaTeX support
   - `OpsiJawaban` - Answer options
   - Enums: `KategoriUjian` (CPNS_SKD, SEKDIN, UTBK_SNBT), `SubtesType` (TWK, TIU, TKP, etc.), `TingkatKesulitan`, `TipeSoal`

3. **Paket Tryout**
   - `PaketTryout` - Exam packages
   - `PaketTryoutSoal` - Questions linked to packages
   - `BundelTryout` / `BundelTryoutPaket` - Package bundles

4. **Sesi Tryout**
   - `TryoutSession` - Active exam sessions
   - `JawabanPeserta` - User answers
   - `StatusSesi`: ACTIVE, COMPLETED, EXPIRED, ABANDONED

5. **Kelas & Modul**
   - `Kelas` - Video courses
   - `Modul` - Course modules
   - `KontenModul` - Module content (VIDEO, ARTIKEL, LATIHAN, QUIZ)
   - `Enrollment` - User-class enrollment

6. **Transaksi & Pembayaran**
   - `Transaction` - Payment records
   - `TransactionItem` - Items (tryout/bundel/kelas)
   - `StatusTransaksi`: PENDING, PROCESSING, SUCCESS, FAILED, EXPIRED, CANCELLED

7. **Live Class & Leaderboard**
   - `LiveClass` - Real-time classes with Pusher chat
   - `LeaderboardEntry` - Tryout rankings
   - `UserBadge` - Achievements

### Authentication Flow

- **NextAuth v5** with Prisma adapter
- **Providers**: Google OAuth + Credentials (bcrypt)
- **Security**: Account lockout after 5 failed attempts (15 min), email validation
- **Auth files**: `lib/auth.ts` (standard), `lib/auth-edge.ts` (Edge runtime for middleware)

### Key API Patterns

All API routes in `app/api/**/route.ts`:

- **Auth check**: Use `auth()` from `@/lib/auth`
- **Role check**: Verify `session.user.role` for ADMIN/INSTRUKTUR routes
- **Validation**: Zod schemas for request bodies
- **Error handling**: Return `NextResponse.json({ error: "message" }, { status: code })`

**Example API structure:**
```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ... logic
}
```

### Third-Party Services

**Configuration in `.env` (see `.env.example`):**

- **Database**: PostgreSQL via `DATABASE_URL` + `DIRECT_URL` (for migrations)
- **Auth**: NextAuth (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`) + Google OAuth
- **Storage**: Cloudflare R2 (S3-compatible, `R2_*` vars)
- **Video**: Mux streaming (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`)
- **Payment**: Midtrans (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`) - sandbox prefixed `SB-Mid-`
- **Real-time**: Pusher (`PUSHER_*` vars)
- **Cache**: Upstash Redis (`UPSTASH_REDIS_*`)
- **Email**: Resend (`RESEND_API_KEY`)
- **Monitoring**: Sentry (configured in `next.config.ts`)

**Client-side env vars** (`NEXT_PUBLIC_*`): APP_URL, PUSHER_KEY, PUSHER_CLUSTER, MIDTRANS_CLIENT_KEY

### Midtrans Payment Flow

1. User initiates checkout → `POST /api/payment/create` creates Transaction + Midtrans Snap token
2. Frontend loads Midtrans Snap (`loadSnapScript` in checkout components)
3. User completes payment → Midtrans webhook `POST /api/payment/webhook/midtrans` updates Transaction status
4. Webhook handler grants access (creates Enrollment for Kelas or activates Tryout access)

**Important**: CSP in `next.config.ts` allows Midtrans domains for script/frame/connect.

### Content Rendering

- **Markdown+LaTeX**: `react-markdown` + `remark-math` + `rehype-katex` for Soal/KontenModul
- **Video**: `@mux/mux-player-react` for video streaming
- **Images**: Cloudflare R2 via S3 SDK, presigned URLs for uploads

### Real-time Features

- **Pusher** for live chat in `LiveClass` (`/api/live-class/[liveClassId]/chat`)
- Private channels auth via `/api/pusher/auth`

## Testing

- **Vitest** for unit/integration tests (no test files exist yet)
- **Playwright** for E2E tests in `/e2e` directory
- **Test helpers**: `e2e/helpers/auth.ts` for auth setup

## Deployment

- **Output**: `standalone` (configured in `next.config.ts`)
- **Production migrations**: Run `npm run db:migrate:prod` before deploy
- **Cron jobs**: `/api/cron/subscription-check` checks expired subscriptions (requires `CRON_SECRET` header)

## Seeding

- Primary seed: `prisma/seed.ts`
- Extracted seeds: `prisma/seed-paket-tryout.ts`, `prisma/cpns-berbayar.seed.ts` (separate CPNS SKD data)
- Run: `npm run db:seed`

## Security Headers

`next.config.ts` sets strict CSP, X-Frame-Options, HSTS (prod only), and allows third-party services (Midtrans, Mux, R2, Sentry, Upstash, Pusher).

## Recent Work (Context)

- Admin CRUD for Modul management (`/admin/modul`)
- Kelas → Modul relationship (nested in Kelas admin)
- Midtrans integration with CSP fixes
- Payment webhook → Enrollment/access granting flow

## Common Patterns

- **Creating protected pages**: Wrap in route group `(dashboard)` or `(admin)`, check session in page component
- **File uploads**: `POST /api/upload` returns presigned R2 URL → client uploads directly
- **Video uploads**: `POST /api/upload/mux` creates Mux asset → webhook `/api/webhooks/mux` updates playback URL
- **Seeding data**: Add to `prisma/seed.ts` or create separate seed file + import in main seed

## Notes

- TypeScript/ESLint errors ignored during build (`ignoreBuildErrors: true`) - fix before production
- Uses Prisma Accelerate connection pooling (check `directUrl` for migrations)
- All timestamps in UTC, handle timezone conversions client-side if needed


<claude-mem-context>
# Memory Context

# [tryout-platform] recent context, 2026-04-30 7:28pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 17 obs (4,498t read) | 71,529t work | 94% savings

### Apr 30, 2026
596 6:53p 🟣 CPNS Seed File Paket C - New Question Bank
598 " 🔵 CPNS Berbayar Seed File Structure - TWK Question Pattern
600 6:54p 🔵 Main seed.ts Orchestration Pattern - Modular Seed Imports
603 " 🔵 Prisma Seed File Inventory - CPNS Related Files
606 6:55p 🟣 CPNS Paket C Seed File Creation Request
612 6:59p 🟣 CPNS Soal Paket C Seed File Created
616 " 🟣 CPNS Seed File Paket C - Request Initiated
618 7:01p 🟣 CPNS Paket C Seed File Created with 30 TWK Questions
620 " 🟣 CPNS Paket C Contains 35 TIU Questions
622 " 🔵 Git Status Reveals Broader Uncommitted Changes in tryout-platform
624 7:03p 🟣 CPNS Tryout Paket C Seed File Creation Requested
626 7:04p 🟣 CPNS SKD Paket C Seed File Created
628 " 🟣 seedCpnsPaketC Function and PaketTryout Config Defined
630 " 🔵 Git Status Reveals Untracked Seed Files and Modified App Routes
637 7:08p ⚖️ CPNS Paket C Seed File Separated from cpns-berbayar.seed.ts
641 7:12p 🟣 User Requested Paket E Creation
644 7:16p 🟣 CPNS SKD Paket E Seed File Created

Access 72k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>