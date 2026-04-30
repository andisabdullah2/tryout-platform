-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "bundelId" TEXT;

-- CreateTable
CREATE TABLE "BundelTryout" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriUjian" NOT NULL,
    "thumbnailUrl" TEXT,
    "harga" DECIMAL(12,2) NOT NULL,
    "status" "StatusPaket" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundelTryout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundelTryoutPaket" (
    "id" TEXT NOT NULL,
    "bundelId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundelTryoutPaket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BundelTryout_slug_key" ON "BundelTryout"("slug");

-- CreateIndex
CREATE INDEX "BundelTryout_kategori_idx" ON "BundelTryout"("kategori");

-- CreateIndex
CREATE INDEX "BundelTryout_status_idx" ON "BundelTryout"("status");

-- CreateIndex
CREATE INDEX "BundelTryout_slug_idx" ON "BundelTryout"("slug");

-- CreateIndex
CREATE INDEX "BundelTryoutPaket_bundelId_idx" ON "BundelTryoutPaket"("bundelId");

-- CreateIndex
CREATE UNIQUE INDEX "BundelTryoutPaket_bundelId_paketId_key" ON "BundelTryoutPaket"("bundelId", "paketId");

-- AddForeignKey
ALTER TABLE "BundelTryoutPaket" ADD CONSTRAINT "BundelTryoutPaket_bundelId_fkey" FOREIGN KEY ("bundelId") REFERENCES "BundelTryout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundelTryoutPaket" ADD CONSTRAINT "BundelTryoutPaket_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketTryout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_bundelId_fkey" FOREIGN KEY ("bundelId") REFERENCES "BundelTryout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
