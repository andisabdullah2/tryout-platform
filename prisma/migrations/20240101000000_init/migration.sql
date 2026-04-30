-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INSTRUKTUR', 'PESERTA');

-- CreateEnum
CREATE TYPE "KategoriUjian" AS ENUM ('CPNS_SKD', 'SEKDIN', 'UTBK_SNBT');

-- CreateEnum
CREATE TYPE "SubtesType" AS ENUM ('TWK', 'TIU', 'TKP', 'TPS_PENALARAN_UMUM', 'TPS_PPU', 'TPS_PBM', 'TPS_PK', 'LITERASI_IND', 'LITERASI_ENG', 'PENALARAN_MATEMATIKA', 'UMUM', 'MATEMATIKA', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'PENGETAHUAN_UMUM', 'WAWASAN_KEBANGSAAN');

-- CreateEnum
CREATE TYPE "TingkatKesulitan" AS ENUM ('MUDAH', 'SEDANG', 'SULIT');

-- CreateEnum
CREATE TYPE "TipeSoal" AS ENUM ('PILIHAN_GANDA', 'PILIHAN_GANDA_KOMPLEKS', 'ISIAN_SINGKAT');

-- CreateEnum
CREATE TYPE "StatusPaket" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ModelAkses" AS ENUM ('GRATIS', 'BERBAYAR', 'LANGGANAN');

-- CreateEnum
CREATE TYPE "StatusSesi" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "StatusKelas" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TipeKonten" AS ENUM ('TEKS', 'PDF', 'VIDEO', 'LINK_EKSTERNAL');

-- CreateEnum
CREATE TYPE "StatusLiveClass" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TRANSFER_BANK', 'KARTU_KREDIT', 'GOPAY', 'OVO', 'DANA', 'QRIS', 'VIRTUAL_ACCOUNT');

-- CreateEnum
CREATE TYPE "TipeLangganan" AS ENUM ('BULANAN', 'TAHUNAN');

-- CreateEnum
CREATE TYPE "PeriodeLeaderboard" AS ENUM ('ALL_TIME', 'MINGGUAN', 'BULANAN');

-- CreateEnum
CREATE TYPE "TipeBadge" AS ENUM ('PERINGKAT_1', 'PERINGKAT_2', 'PERINGKAT_3', 'TRYOUT_PERTAMA', 'LULUS_PASSING_GRADE', 'STREAK_7_HARI');

-- CreateEnum
CREATE TYPE "TipeNotifikasi" AS ENUM ('TRYOUT_RESULT', 'LIVE_CLASS_REMINDER', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING', 'NEW_CONTENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PESERTA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "useAlias" BOOLEAN NOT NULL DEFAULT false,
    "alias" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Soal" (
    "id" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "gambarUrl" TEXT,
    "tipe" "TipeSoal" NOT NULL DEFAULT 'PILIHAN_GANDA',
    "kategori" "KategoriUjian" NOT NULL,
    "subtes" "SubtesType" NOT NULL,
    "topik" TEXT NOT NULL,
    "tingkatKesulitan" "TingkatKesulitan" NOT NULL DEFAULT 'SEDANG',
    "pembahasanTeks" TEXT,
    "pembahasanVideoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalDijawab" INTEGER NOT NULL DEFAULT 0,
    "totalBenar" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsiJawaban" (
    "id" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "isBenar" BOOLEAN NOT NULL DEFAULT false,
    "nilaiTkp" INTEGER,

    CONSTRAINT "OpsiJawaban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaketTryout" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriUjian" NOT NULL,
    "subKategori" TEXT,
    "durasi" INTEGER NOT NULL,
    "totalSoal" INTEGER NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "modelAkses" "ModelAkses" NOT NULL DEFAULT 'GRATIS',
    "status" "StatusPaket" NOT NULL DEFAULT 'DRAFT',
    "passingGrade" JSONB,
    "konfigurasi" JSONB,
    "thumbnailUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaketTryout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaketTryoutSoal" (
    "id" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "bobotNilai" DECIMAL(5,2),

    CONSTRAINT "PaketTryoutSoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TryoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "status" "StatusSesi" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urutanSoal" JSONB NOT NULL,
    "snapshotJawaban" JSONB NOT NULL DEFAULT '{}',
    "activityLog" JSONB NOT NULL DEFAULT '[]',
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "TryoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JawabanPeserta" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "opsiId" TEXT,
    "isBenar" BOOLEAN,
    "nilaiDapat" DECIMAL(5,2),
    "waktuJawab" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JawabanPeserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilTryout" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "skorTotal" DECIMAL(8,2) NOT NULL,
    "skorPerSubtes" JSONB NOT NULL,
    "jumlahBenar" INTEGER NOT NULL,
    "jumlahSalah" INTEGER NOT NULL,
    "jumlahKosong" INTEGER NOT NULL,
    "lulus" BOOLEAN NOT NULL DEFAULT false,
    "durasiPengerjaan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HasilTryout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriUjian" NOT NULL,
    "thumbnailUrl" TEXT,
    "harga" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "modelAkses" "ModelAkses" NOT NULL DEFAULT 'GRATIS',
    "status" "StatusKelas" NOT NULL DEFAULT 'DRAFT',
    "instrukturId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modul" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isKuisAktif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontenModul" (
    "id" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "tipe" "TipeKonten" NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "durasi" INTEGER,
    "urutan" INTEGER NOT NULL,
    "muxAssetId" TEXT,
    "muxPlaybackId" TEXT,

    CONSTRAINT "KontenModul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "posisiDetik" INTEGER NOT NULL DEFAULT 0,
    "isSelesai" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveClass" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "instrukturId" TEXT NOT NULL,
    "jadwalMulai" TIMESTAMP(3) NOT NULL,
    "durasiEstimasi" INTEGER NOT NULL,
    "status" "StatusLiveClass" NOT NULL DEFAULT 'SCHEDULED',
    "streamUrl" TEXT,
    "recordingUrl" TEXT,
    "jumlahHadir" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveClassChat" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveClassChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'PENDING',
    "metode" "MetodePembayaran",
    "gateway" TEXT NOT NULL,
    "gatewayTxId" TEXT,
    "gatewayResponse" JSONB,
    "promoId" TEXT,
    "diskon" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expiredAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "paketId" TEXT,
    "kelasId" TEXT,
    "langgananId" TEXT,
    "nama" TEXT NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipe" "TipeLangganan" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tipeDiskon" TEXT NOT NULL,
    "nilaiDiskon" DECIMAL(10,2) NOT NULL,
    "batasUse" INTEGER,
    "totalUsed" INTEGER NOT NULL DEFAULT 0,
    "expiredAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "periode" "PeriodeLeaderboard" NOT NULL,
    "skor" DECIMAL(8,2) NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "ikonUrl" TEXT NOT NULL,
    "tipe" "TipeBadge" NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "paketId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipe" "TipeNotifikasi" NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Soal_kategori_subtes_idx" ON "Soal"("kategori", "subtes");
CREATE INDEX "Soal_topik_idx" ON "Soal"("topik");
CREATE INDEX "Soal_tingkatKesulitan_idx" ON "Soal"("tingkatKesulitan");

-- CreateIndex
CREATE INDEX "OpsiJawaban_soalId_idx" ON "OpsiJawaban"("soalId");

-- CreateIndex
CREATE UNIQUE INDEX "PaketTryout_slug_key" ON "PaketTryout"("slug");
CREATE INDEX "PaketTryout_kategori_idx" ON "PaketTryout"("kategori");
CREATE INDEX "PaketTryout_status_idx" ON "PaketTryout"("status");
CREATE INDEX "PaketTryout_slug_idx" ON "PaketTryout"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PaketTryoutSoal_paketId_soalId_key" ON "PaketTryoutSoal"("paketId", "soalId");
CREATE INDEX "PaketTryoutSoal_paketId_idx" ON "PaketTryoutSoal"("paketId");

-- CreateIndex
CREATE INDEX "TryoutSession_userId_idx" ON "TryoutSession"("userId");
CREATE INDEX "TryoutSession_paketId_idx" ON "TryoutSession"("paketId");
CREATE INDEX "TryoutSession_status_idx" ON "TryoutSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JawabanPeserta_sessionId_soalId_key" ON "JawabanPeserta"("sessionId", "soalId");
CREATE INDEX "JawabanPeserta_sessionId_idx" ON "JawabanPeserta"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "HasilTryout_sessionId_key" ON "HasilTryout"("sessionId");
CREATE INDEX "HasilTryout_userId_idx" ON "HasilTryout"("userId");
CREATE INDEX "HasilTryout_paketId_idx" ON "HasilTryout"("paketId");

-- CreateIndex
CREATE UNIQUE INDEX "Kelas_slug_key" ON "Kelas"("slug");
CREATE INDEX "Kelas_kategori_idx" ON "Kelas"("kategori");
CREATE INDEX "Kelas_status_idx" ON "Kelas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Modul_kelasId_urutan_key" ON "Modul"("kelasId", "urutan");
CREATE INDEX "Modul_kelasId_idx" ON "Modul"("kelasId");

-- CreateIndex
CREATE INDEX "KontenModul_modulId_idx" ON "KontenModul"("modulId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProgress_userId_modulId_key" ON "VideoProgress"("userId", "modulId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_kelasId_key" ON "Enrollment"("userId", "kelasId");
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "LiveClass_kelasId_idx" ON "LiveClass"("kelasId");
CREATE INDEX "LiveClass_jadwalMulai_idx" ON "LiveClass"("jadwalMulai");

-- CreateIndex
CREATE INDEX "LiveClassChat_liveClassId_idx" ON "LiveClassChat"("liveClassId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_endDate_idx" ON "Subscription"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_kode_key" ON "PromoCode"("kode");
CREATE INDEX "PromoCode_kode_idx" ON "PromoCode"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_paketId_periode_key" ON "LeaderboardEntry"("userId", "paketId", "periode");
CREATE INDEX "LeaderboardEntry_paketId_periode_peringkat_idx" ON "LeaderboardEntry"("paketId", "periode", "peringkat");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_tipe_key" ON "Badge"("tipe");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_paketId_key" ON "UserBadge"("userId", "badgeId", "paketId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsiJawaban" ADD CONSTRAINT "OpsiJawaban_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaketTryoutSoal" ADD CONSTRAINT "PaketTryoutSoal_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketTryout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaketTryoutSoal" ADD CONSTRAINT "PaketTryoutSoal_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutSession" ADD CONSTRAINT "TryoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutSession" ADD CONSTRAINT "TryoutSession_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketTryout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanPeserta" ADD CONSTRAINT "JawabanPeserta_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TryoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanPeserta" ADD CONSTRAINT "JawabanPeserta_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilTryout" ADD CONSTRAINT "HasilTryout_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TryoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontenModul" ADD CONSTRAINT "KontenModul_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClassChat" ADD CONSTRAINT "LiveClassChat_liveClassId_fkey" FOREIGN KEY ("liveClassId") REFERENCES "LiveClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketTryout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketTryout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
