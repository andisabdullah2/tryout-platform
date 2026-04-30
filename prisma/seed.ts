import { PrismaClient, Role, TipeBadge } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedKelasCPNS } from "./seed-kelas-cpns";
import { seedSoal } from "./seed-soal";
import { seedCpnsBerbayar } from "./seed-cpns-berbayar";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ============================================================
  // SEED: Admin User
  // ============================================================
  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tryout-platform.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@tryout-platform.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ============================================================
  // SEED: Instruktur User
  // ============================================================
  const instrukturPassword = await bcrypt.hash("Instruktur@12345", 12);
  const instruktur = await prisma.user.upsert({
    where: { email: "instruktur@tryout-platform.com" },
    update: {},
    create: {
      name: "Instruktur Demo",
      email: "instruktur@tryout-platform.com",
      password: instrukturPassword,
      role: Role.INSTRUKTUR,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ Instruktur user created: ${instruktur.email}`);

  // ============================================================
  // SEED: Peserta User
  // ============================================================
  const pesertaPassword = await bcrypt.hash("Peserta@12345", 12);
  const peserta = await prisma.user.upsert({
    where: { email: "peserta@tryout-platform.com" },
    update: {},
    create: {
      name: "Peserta Demo",
      email: "peserta@tryout-platform.com",
      password: pesertaPassword,
      role: Role.PESERTA,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ Peserta user created: ${peserta.email}`);

  // ============================================================
  // SEED: Badges
  // ============================================================
  const badges = [
    {
      tipe: TipeBadge.PERINGKAT_1,
      nama: "Juara 1",
      deskripsi: "Meraih peringkat 1 di leaderboard",
      ikonUrl: "/badges/rank-1.svg",
    },
    {
      tipe: TipeBadge.PERINGKAT_2,
      nama: "Juara 2",
      deskripsi: "Meraih peringkat 2 di leaderboard",
      ikonUrl: "/badges/rank-2.svg",
    },
    {
      tipe: TipeBadge.PERINGKAT_3,
      nama: "Juara 3",
      deskripsi: "Meraih peringkat 3 di leaderboard",
      ikonUrl: "/badges/rank-3.svg",
    },
    {
      tipe: TipeBadge.TRYOUT_PERTAMA,
      nama: "Tryout Pertama",
      deskripsi: "Menyelesaikan tryout pertama kali",
      ikonUrl: "/badges/first-tryout.svg",
    },
    {
      tipe: TipeBadge.LULUS_PASSING_GRADE,
      nama: "Lulus Passing Grade",
      deskripsi: "Berhasil melampaui passing grade",
      ikonUrl: "/badges/passing-grade.svg",
    },
    {
      tipe: TipeBadge.STREAK_7_HARI,
      nama: "Streak 7 Hari",
      deskripsi: "Belajar selama 7 hari berturut-turut",
      ikonUrl: "/badges/streak-7.svg",
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { tipe: badge.tipe },
      update: {},
      create: badge,
    });
  }
  console.log(`✅ ${badges.length} badges created`);

  // ============================================================
  // SEED: Paket Tryout Gratis (CPNS SKD)
  // ============================================================
  const paketCPNSGratis = await prisma.paketTryout.upsert({
    where: { slug: "tryout-skd-cpns-gratis-1" },
    update: {},
    create: {
      slug: "tryout-skd-cpns-gratis-1",
      judul: "Tryout SKD CPNS Gratis #1",
      deskripsi:
        "Paket tryout gratis untuk persiapan SKD CPNS. Terdiri dari 110 soal (TWK 35, TIU 35, TKP 40) dengan durasi 100 menit.",
      kategori: "CPNS_SKD",
      durasi: 100,
      totalSoal: 110,
      harga: 0,
      modelAkses: "GRATIS",
      status: "PUBLISHED",
      passingGrade: { twk: 65, tiu: 80, tkp: 166, total: 311 },
      konfigurasi: {
        twk: { jumlahSoal: 35, nilaiBenar: 5, nilaiSalah: 0 },
        tiu: { jumlahSoal: 35, nilaiBenar: 5, nilaiSalah: 0 },
        tkp: { jumlahSoal: 40, skala: [1, 2, 3, 4, 5] },
      },
      createdById: instruktur.id,
    },
  });
  console.log(`✅ Paket tryout CPNS gratis created: ${paketCPNSGratis.judul}`);

  // ============================================================
  // SEED: Paket Tryout Gratis (UTBK/SNBT)
  // ============================================================
  const paketUTBKGratis = await prisma.paketTryout.upsert({
    where: { slug: "tryout-utbk-snbt-gratis-1" },
    update: {},
    create: {
      slug: "tryout-utbk-snbt-gratis-1",
      judul: "Tryout UTBK/SNBT Gratis #1",
      deskripsi:
        "Paket tryout gratis untuk persiapan UTBK/SNBT. Mencakup TPS, Literasi, dan Penalaran Matematika.",
      kategori: "UTBK_SNBT",
      durasi: 195,
      totalSoal: 155,
      harga: 0,
      modelAkses: "GRATIS",
      status: "PUBLISHED",
      passingGrade: undefined,
      konfigurasi: {
        metode: "IRT",
        skalaSkor: { min: 0, max: 1000 },
      },
      createdById: instruktur.id,
    },
  });
  console.log(`✅ Paket tryout UTBK gratis created: ${paketUTBKGratis.judul}`);

  // ============================================================
  // SEED: Paket Tryout Gratis (Sekdin)
  // ============================================================
  const paketSekdinGratis = await prisma.paketTryout.upsert({
    where: { slug: "tryout-sekdin-stan-gratis-1" },
    update: {},
    create: {
      slug: "tryout-sekdin-stan-gratis-1",
      judul: "Tryout Sekdin STAN Gratis #1",
      deskripsi:
        "Paket tryout gratis untuk persiapan masuk STAN (PKN STAN). Mencakup TPA dan Bahasa Inggris.",
      kategori: "SEKDIN",
      subKategori: "STAN",
      durasi: 120,
      totalSoal: 100,
      harga: 0,
      modelAkses: "GRATIS",
      status: "PUBLISHED",
      passingGrade: undefined,
      konfigurasi: {
        tpa: { jumlahSoal: 60, nilaiBenar: 4, nilaiSalah: -1 },
        bahasaInggris: { jumlahSoal: 40, nilaiBenar: 4, nilaiSalah: -1 },
      },
      createdById: instruktur.id,
    },
  });
  console.log(
    `✅ Paket tryout Sekdin gratis created: ${paketSekdinGratis.judul}`
  );

  // ============================================================
  // SEED: Soal Dasar (imported from seed-soal.ts)
  // ============================================================
  await seedSoal(instruktur.id);

  // ============================================================
  // SEED: Kelas CPNS (imported from seed-kelas-cpns.ts)
  // ============================================================
  await seedKelasCPNS(instruktur.id);

  // ============================================================
  // SEED: Paket CPNS Berbayar (imported from seed-cpns-berbayar.ts)
  // ============================================================
  await seedCpnsBerbayar(instruktur.id);

  // ============================================================
  // SEED: Promo Code
  // ============================================================
  await prisma.promoCode.upsert({
    where: { kode: "WELCOME50" },
    update: {},
    create: {
      kode: "WELCOME50",
      deskripsi: "Diskon 50% untuk pembelian pertama",
      tipeDiskon: "PERSEN",
      nilaiDiskon: 50,
      batasUse: 100,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { kode: "HEMAT100K" },
    update: {},
    create: {
      kode: "HEMAT100K",
      deskripsi: "Potongan Rp 100.000 untuk semua produk",
      tipeDiskon: "NOMINAL",
      nilaiDiskon: 100000,
      batasUse: 50,
      isActive: true,
    },
  });
  console.log(`✅ Promo codes created`);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
