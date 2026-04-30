# Panduan Deployment Produksi

## Prasyarat

- Node.js 18+
- PostgreSQL 14+
- Akun Vercel (atau server self-hosted)
- Semua layanan third-party dikonfigurasi (lihat `.env.production.example`)

## 1. Persiapan Database Produksi (20.2)

### Opsi A: Prisma Accelerate (Recommended untuk Vercel)
```bash
# Install Prisma Accelerate
npm install @prisma/extension-accelerate

# Update DATABASE_URL ke format Prisma Accelerate
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

### Opsi B: PgBouncer (Self-hosted)
```bash
# Konfigurasi PgBouncer untuk connection pooling
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:6432/tryout_platform?pgbouncer=true"
```

### Jalankan Migrasi
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 2. Deployment ke Vercel (20.3)

### Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub Integration
1. Push ke repository GitHub
2. Connect repository di Vercel Dashboard
3. Set environment variables di Vercel Dashboard
4. Deploy otomatis pada setiap push ke `main`

### Environment Variables di Vercel
Tambahkan semua variabel dari `.env.production.example` di:
`Vercel Dashboard → Project → Settings → Environment Variables`

## 3. Setup Monitoring Sentry (20.4)

```bash
# Install Sentry
npm install @sentry/nextjs

# Jalankan wizard Sentry
npx @sentry/wizard@latest -i nextjs

# Set environment variables
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=tryout-platform
SENTRY_AUTH_TOKEN=your-auth-token
```

## 4. Konfigurasi Domain dan SSL (20.5)

### Di Vercel
1. Buka `Project → Settings → Domains`
2. Tambahkan domain kustom
3. Update DNS records sesuai instruksi Vercel
4. SSL certificate otomatis di-provision oleh Vercel (Let's Encrypt)

### Self-hosted dengan Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 5. Checklist Pre-Launch

- [ ] Semua environment variables production dikonfigurasi
- [ ] Database migration berhasil dijalankan
- [ ] Seed data produksi (badges, paket gratis) tersedia
- [ ] Midtrans production keys aktif
- [ ] Google OAuth redirect URI diupdate ke domain produksi
- [ ] Pusher app dikonfigurasi untuk production
- [ ] Upstash Redis production instance aktif
- [ ] Sentry DSN dikonfigurasi
- [ ] Domain dan SSL aktif
- [ ] Webhook Midtrans URL diupdate ke domain produksi
- [ ] Webhook Mux URL diupdate ke domain produksi
- [ ] Rate limiting Redis berfungsi
- [ ] Backup database dikonfigurasi

## 6. Monitoring Post-Launch

- Pantau Sentry untuk error tracking
- Pantau Vercel Analytics untuk performa
- Pantau Upstash Redis untuk cache hit rate
- Setup alert untuk error rate tinggi
