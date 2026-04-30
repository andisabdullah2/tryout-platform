import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedKelasCPNS(instrukturId: string) {
  console.log("🌱 Seeding Kelas CPNS...");

  // ============================================================
  // SEED: Kelas Gratis CPNS
  // ============================================================
  const kelasGratis = await prisma.kelas.upsert({
    where: { slug: "persiapan-cpns-skd-dasar" },
    update: {},
    create: {
      slug: "persiapan-cpns-skd-dasar",
      judul: "Persiapan CPNS SKD Dasar",
      deskripsi:
        "Kelas persiapan CPNS SKD untuk pemula. Mencakup materi TWK, TIU, dan TKP secara komprehensif.",
      kategori: "CPNS_SKD",
      harga: 0,
      modelAkses: "GRATIS",
      status: "PUBLISHED",
      instrukturId,
    },
  });
  console.log(`✅ Kelas gratis created: ${kelasGratis.judul}`);

  // ============================================================
  // SEED: Modul untuk Kelas Gratis
  // ============================================================
  const modulData = [
    {
      judul: "Pengenalan SKD CPNS",
      deskripsi: "Memahami struktur dan format ujian SKD CPNS",
      urutan: 1,
    },
    {
      judul: "Tes Wawasan Kebangsaan (TWK)",
      deskripsi: "Materi dan strategi mengerjakan soal TWK",
      urutan: 2,
    },
    {
      judul: "Tes Intelegensia Umum (TIU)",
      deskripsi: "Materi dan strategi mengerjakan soal TIU",
      urutan: 3,
    },
    {
      judul: "Tes Karakteristik Pribadi (TKP)",
      deskripsi: "Materi dan strategi mengerjakan soal TKP",
      urutan: 4,
    },
  ];

  const createdModuls = [];
  for (const modul of modulData) {
    const created = await prisma.modul.upsert({
      where: {
        kelasId_urutan: {
          kelasId: kelasGratis.id,
          urutan: modul.urutan,
        },
      },
      update: {},
      create: {
        ...modul,
        kelasId: kelasGratis.id,
      },
    });
    createdModuls.push(created);
  }
  console.log(`✅ ${modulData.length} modul created for kelas gratis`);

  // ============================================================
  // SEED: Konten untuk Modul
  // ============================================================
  const kontenData = [
    // Modul 1: Pengenalan SKD CPNS
    {
      modulUrutan: 1,
      konten: [
        {
          tipe: "TEKS",
          judul: "Apa itu SKD CPNS?",
          konten: `# Apa itu SKD CPNS?

SKD (Seleksi Kompetensi Dasar) adalah tahap pertama dalam seleksi CPNS yang wajib diikuti oleh semua peserta.

## Komponen SKD

SKD terdiri dari 3 komponen utama:

1. **TWK (Tes Wawasan Kebangsaan)** - 35 soal
   - Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika

2. **TIU (Tes Intelegensia Umum)** - 30 soal
   - Verbal, numerik, figural, logika

3. **TKP (Tes Karakteristik Pribadi)** - 45 soal
   - Pelayanan publik, integritas, kerjasama

## Sistem Penilaian

- TWK & TIU: benar +5, salah -1, kosong 0
- TKP: skala 1-5 (tidak ada nilai minus)
- Passing grade: 126 (TWK), 80 (TIU), 156 (TKP)`,
          urutan: 1,
        },
        {
          tipe: "VIDEO",
          judul: "Strategi Menghadapi SKD CPNS",
          fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durasi: 600,
          urutan: 2,
        },
        {
          tipe: "PDF",
          judul: "Jadwal dan Timeline SKD 2024",
          fileUrl: "https://example.com/jadwal-skd-2024.pdf",
          urutan: 3,
        },
      ],
    },
    // Modul 2: TWK
    {
      modulUrutan: 2,
      konten: [
        {
          tipe: "TEKS",
          judul: "Materi Pancasila",
          konten: `# Pancasila

Pancasila adalah dasar negara Indonesia yang terdiri dari 5 sila.

## Lima Sila Pancasila

1. Ketuhanan Yang Maha Esa
2. Kemanusiaan yang Adil dan Beradab
3. Persatuan Indonesia
4. Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan
5. Keadilan Sosial bagi Seluruh Rakyat Indonesia

## Nilai-nilai Pancasila

- **Religius**: Toleransi beragama
- **Humanis**: Menghargai HAM
- **Nasionalis**: Cinta tanah air
- **Demokratis**: Musyawarah mufakat
- **Berkeadilan**: Kesejahteraan sosial`,
          urutan: 1,
        },
        {
          tipe: "TEKS",
          judul: "UUD 1945 dan Amandemen",
          konten: `# UUD 1945

UUD 1945 telah mengalami 4 kali amandemen (1999-2002).

## Struktur UUD 1945

- Pembukaan (tidak dapat diubah)
- Pasal-pasal (21 bab, 73 pasal)
- Aturan Peralihan
- Aturan Tambahan

## Pokok-pokok Amandemen

1. **Amandemen I (1999)**: Pembatasan kekuasaan presiden
2. **Amandemen II (2000)**: Pemerintahan daerah, HAM
3. **Amandemen III (2001)**: Asas dan pemilu
4. **Amandemen IV (2002)**: Kelembagaan negara`,
          urutan: 2,
        },
        {
          tipe: "LINK_EKSTERNAL",
          judul: "Kuis TWK Online",
          linkUrl: "https://example.com/kuis-twk",
          urutan: 3,
        },
      ],
    },
    // Modul 3: TIU
    {
      modulUrutan: 3,
      konten: [
        {
          tipe: "TEKS",
          judul: "Penalaran Logis",
          konten: `# Penalaran Logis

Kemampuan berpikir secara logis dan sistematis.

## Jenis Soal

1. **Silogisme**: Penarikan kesimpulan dari dua premis
2. **Analogi**: Kesepadanan hubungan
3. **Penalaran Deduktif**: Dari umum ke khusus
4. **Penalaran Induktif**: Dari khusus ke umum

## Tips

- Baca soal dengan teliti
- Identifikasi pola hubungan
- Buang opsi yang jelas salah
- Latihan rutin`,
          urutan: 1,
        },
        {
          tipe: "TEKS",
          judul: "Tes Numerik",
          konten: `# Tes Numerik

Kemampuan berhitung dan menganalisis data numerik.

## Topik Utama

1. Aritmatika dasar
2. Deret angka
3. Perbandingan
4. Persentase
5. Diagram dan grafik

## Rumus Penting

- Persentase: (bagian/total) × 100%
- Rata-rata: jumlah/banyak data
- Kecepatan: jarak/waktu`,
          urutan: 2,
        },
        {
          tipe: "VIDEO",
          judul: "Cara Cepat Hitung Deret Angka",
          fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durasi: 480,
          urutan: 3,
        },
      ],
    },
    // Modul 4: TKP
    {
      modulUrutan: 4,
      konten: [
        {
          tipe: "TEKS",
          judul: "Pelayanan Publik",
          konten: `# Pelayanan Publik

Sikap dan perilaku dalam melayani masyarakat.

## Prinsip Pelayanan Publik

1. **Profesional**: Kompeten dan ahli
2. **Responsif**: Cepat tanggap
3. **Akuntabel**: Dapat dipertanggungjawabkan
4. **Transparan**: Terbuka dan jelas
5. **Adil**: Tidak diskriminatif

## Karakteristik ASN Ideal

- Integritas tinggi
- Berorientasi pada kepentingan umum
- Netral dan tidak partisan
- Inovatif dan adaptif`,
          urutan: 1,
        },
        {
          tipe: "TEKS",
          judul: "Strategi Menjawab TKP",
          konten: `# Strategi Menjawab TKP

TKP mengukur karakteristik pribadi dengan skala 1-5.

## Tips Penting

1. **Pilih jawaban paling ideal**, bukan yang paling realistis
2. **Hindari jawaban ekstrem** (terlalu pasif atau agresif)
3. **Prioritaskan kepentingan publik** di atas pribadi
4. **Tunjukkan sikap proaktif** dan bertanggung jawab
5. **Tidak ada jawaban salah**, tapi ada yang lebih baik

## Contoh Kasus

*Atasan meminta Anda lembur tanpa kompensasi*

- ❌ Menolak mentah-mentah (nilai 1)
- ✅ Bersedia demi penyelesaian tugas penting (nilai 5)`,
          urutan: 2,
        },
        {
          tipe: "PDF",
          judul: "Kumpulan Soal TKP dan Pembahasan",
          fileUrl: "https://example.com/soal-tkp.pdf",
          urutan: 3,
        },
      ],
    },
  ];

  for (const { modulUrutan, konten } of kontenData) {
    const targetModul = createdModuls.find((m) => m.urutan === modulUrutan);
    if (!targetModul) continue;

    for (const k of konten) {
      await prisma.kontenModul.create({
        data: {
          modulId: targetModul.id,
          tipe: k.tipe as any,
          judul: k.judul,
          konten: k.konten || null,
          fileUrl: k.fileUrl || null,
          linkUrl: k.linkUrl || null,
          durasi: k.durasi || null,
          urutan: k.urutan,
        },
      });
    }
  }
  console.log(`✅ Konten created for all modul`);

  console.log("✅ Kelas CPNS seeding completed");
}

// Standalone execution
// Standalone execution
if (require.main === module) {
  async function main() {
    // Ambil instruktur pertama dari DB
    const instruktur = await prisma.user.findFirst({
      where: { role: 'INSTRUKTUR' },
      select: { id: true, name: true },
    });

    if (!instruktur) {
      console.error('❌ Tidak ada user dengan role INSTRUKTUR di database!');
      console.error('   Buat user instruktur dulu, atau ganti role user yang ada.');
      process.exit(1);
    }

    console.log(`👤 Menggunakan instruktur: ${instruktur.name} (${instruktur.id})`);
    await seedKelasCPNS(instruktur.id);
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
