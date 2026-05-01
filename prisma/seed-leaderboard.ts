import { PrismaClient, PeriodeLeaderboard, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const NAMA_DEPAN = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Galuh", "Hana",
  "Indra", "Joko", "Kartika", "Lestari", "Muhamad", "Nadia", "Oky",
  "Putri", "Qori", "Raden", "Sari", "Tono", "Udin", "Vera", "Wahyu",
  "Xena", "Yanto", "Zahra", "Agus", "Bambang", "Cahyo", "Dian",
  "Edi", "Fitri", "Gilang", "Halim", "Iqbal", "Jasmin", "Krisna",
  "Lina", "Mira", "Nurul", "Oscar", "Pipit", "Qadri", "Rizki",
  "Sinta", "Taufik", "Ulfa", "Vino", "Wulan", "Yoga", "Zulfa",
  "Anisa", "Bagas", "Candra", "Deni", "Elsa", "Ferry", "Gita",
  "Hendra", "Irma", "Joni", "Kurnia", "Laila", "Miko", "Novi",
];

const NAMA_BELAKANG = [
  "Santoso", "Wibowo", "Permana", "Kusuma", "Rahayu", "Saputra",
  "Handoko", "Setiawan", "Pratama", "Nugroho", "Purnama", "Wijaya",
  "Suharto", "Budiman", "Wahyudi", "Susanto", "Hartono", "Mulyadi",
  "Gunawan", "Sudirman", "Supriyadi", "Kurniawan", "Hidayat", "Fauzi",
  "Rohman", "Hakim", "Ridwan", "Syahputra", "Ramadan", "Ismail",
  "Firmansyah", "Putra", "Putri", "Sari", "Dewi", "Lestari",
  "Ningrum", "Astuti", "Oktavia", "Andriani", "Fitriani", "Utami",
  "Yuliana", "Novitasari", "Rahmawati", "Puspitasari", "Anggraini",
  "Wahyuningsih", "Sulistyowati", "Kristianto",
];

function randomName(index: number): string {
  const depan = NAMA_DEPAN[index % NAMA_DEPAN.length];
  const belakang = NAMA_BELAKANG[Math.floor(index / NAMA_DEPAN.length) % NAMA_BELAKANG.length];
  return `${depan} ${belakang}`;
}

function randomScore(kategori: string, rng: () => number): number {
  switch (kategori) {
    case "CPNS_SKD": {
      // TWK max 175, TIU max 175, TKP max 200 = 550
      const twk = Math.floor(rng() * 36) * 5; // 0-175, multiples of 5
      const tiu = Math.floor(rng() * 36) * 5; // 0-175
      const tkp = Math.floor(rng() * 201);     // 0-200
      return twk + tiu + tkp;
    }
    case "UTBK_SNBT": {
      // IRT scale 0-1000, realistic range 300-800
      return Math.round(300 + rng() * 500);
    }
    case "SEKDIN": {
      // TPA + Bahasa Inggris, max ~400
      return Math.round(rng() * 380);
    }
    default: {
      return Math.round(rng() * 500);
    }
  }
}

// Seeded pseudo-random for reproducible seeds
function makePRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export async function seedLeaderboard(instrukturId?: string) {
  console.log("🌱 Seeding leaderboard with 950 random users...");

  const TOTAL_USERS = 950;
  const password = await bcrypt.hash("Peserta@12345", 12);

  // Fetch all published pakets
  const pakets = await prisma.paketTryout.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, kategori: true, judul: true },
  });

  if (pakets.length === 0) {
    console.warn("⚠️  No published pakets found. Run main seed first.");
    return;
  }
  console.log(`Found ${pakets.length} pakets: ${pakets.map((p) => p.judul).join(", ")}`);

  // Create 950 users (upsert by email for idempotency)
  console.log(`Creating ${TOTAL_USERS} peserta users...`);
  const users: { id: string }[] = [];

  const BATCH = 50;
  for (let i = 0; i < TOTAL_USERS; i += BATCH) {
    const batch = Array.from({ length: Math.min(BATCH, TOTAL_USERS - i) }, (_, j) => {
      const idx = i + j;
      return {
        name: randomName(idx),
        email: `lb.peserta.${idx + 1}@example.com`,
        password,
        role: Role.PESERTA,
        emailVerified: new Date(),
        isActive: true,
      };
    });

    const results = await Promise.all(
      batch.map((u) =>
        prisma.user.upsert({
          where: { email: u.email },
          update: {},
          create: u,
          select: { id: true },
        })
      )
    );
    users.push(...results);

    if ((i / BATCH + 1) % 4 === 0) {
      console.log(`  Created ${Math.min(i + BATCH, TOTAL_USERS)}/${TOTAL_USERS} users...`);
    }
  }
  console.log(`✅ ${users.length} users ready`);

  // For each paket × periode: assign scores, rank, bulk insert
  const periodes = Object.values(PeriodeLeaderboard);

  for (const paket of pakets) {
    for (const periode of periodes) {
      const rng = makePRNG(
        paket.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) +
          periodes.indexOf(periode) * 9999
      );

      // Build scored entries
      const scored = users.map((user) => ({
        userId: user.id,
        paketId: paket.id,
        periode,
        skor: randomScore(paket.kategori, rng),
      }));

      // Sort desc → assign peringkat
      scored.sort((a, b) => b.skor - a.skor);
      const entries = scored.map((e, i) => ({ ...e, peringkat: i + 1 }));

      // createMany skipDuplicates for idempotency
      const result = await prisma.leaderboardEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });

      console.log(
        `  [${paket.judul}] ${periode}: ${result.count} entries inserted`
      );
    }
  }

  console.log("✅ Leaderboard seed completed!");
}

// Standalone run
if (require.main === module) {
  seedLeaderboard()
    .catch((e) => {
      console.error("❌ Leaderboard seed failed:", e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
