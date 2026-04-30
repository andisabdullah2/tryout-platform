# ============================================================
# Multi-stage Dockerfile untuk Next.js (standalone output)
# Stage 1: deps     — install dependencies
# Stage 2: builder  — build aplikasi
# Stage 3: runner   — production image
# ============================================================

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps

# Install libc6-compat untuk kompatibilitas Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install semua dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate


# ---- Stage 2: builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules dari stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment untuk build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build aplikasi Next.js
RUN npm run build


# ---- Stage 3: runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy file publik
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema dan migrations (untuk runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Gunakan user non-root
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan aplikasi
CMD ["node", "server.js"]
