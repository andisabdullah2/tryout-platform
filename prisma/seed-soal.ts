import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSoal(createdById: string) {
  console.log("🌱 Seeding contoh soal...");

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required for seeding soal.");
  }

  // ============================================================
  // SOAL TWK (Tes Wawasan Kebangsaan) — CPNS SKD
  // ============================================================
  const soalTWK = [
    {
      konten: "Pancasila sebagai dasar negara Indonesia pertama kali dirumuskan oleh...",
      topik: "Pancasila",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Pancasila dirumuskan oleh BPUPKI (Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia) yang dibentuk pada 29 April 1945.",
      opsi: [
        { label: "A", konten: "BPUPKI", isBenar: true },
        { label: "B", konten: "PPKI", isBenar: false },
        { label: "C", konten: "MPR", isBenar: false },
        { label: "D", konten: "DPR", isBenar: false },
        { label: "E", konten: "Konstituante", isBenar: false },
      ],
    },
    {
      konten: "Sila ke-3 Pancasila berbunyi...",
      topik: "Pancasila",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Sila ke-3 Pancasila adalah 'Persatuan Indonesia', yang mencerminkan semangat persatuan dan kesatuan bangsa.",
      opsi: [
        { label: "A", konten: "Ketuhanan Yang Maha Esa", isBenar: false },
        { label: "B", konten: "Kemanusiaan yang Adil dan Beradab", isBenar: false },
        { label: "C", konten: "Persatuan Indonesia", isBenar: true },
        { label: "D", konten: "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan", isBenar: false },
        { label: "E", konten: "Keadilan Sosial bagi Seluruh Rakyat Indonesia", isBenar: false },
      ],
    },
    {
      konten: "Undang-Undang Dasar 1945 disahkan oleh PPKI pada tanggal...",
      topik: "UUD 1945",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "UUD 1945 disahkan oleh PPKI (Panitia Persiapan Kemerdekaan Indonesia) pada tanggal 18 Agustus 1945, sehari setelah proklamasi kemerdekaan.",
      opsi: [
        { label: "A", konten: "17 Agustus 1945", isBenar: false },
        { label: "B", konten: "18 Agustus 1945", isBenar: true },
        { label: "C", konten: "19 Agustus 1945", isBenar: false },
        { label: "D", konten: "1 Juni 1945", isBenar: false },
        { label: "E", konten: "22 Juni 1945", isBenar: false },
      ],
    },
    {
      konten: "Bhinneka Tunggal Ika merupakan semboyan negara Indonesia yang berasal dari bahasa...",
      topik: "Wawasan Kebangsaan",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Bhinneka Tunggal Ika berasal dari bahasa Jawa Kuno (Kawi), yang terdapat dalam Kitab Sutasoma karangan Mpu Tantular pada abad ke-14.",
      opsi: [
        { label: "A", konten: "Sansekerta", isBenar: false },
        { label: "B", konten: "Jawa Kuno (Kawi)", isBenar: true },
        { label: "C", konten: "Melayu Kuno", isBenar: false },
        { label: "D", konten: "Bali Kuno", isBenar: false },
        { label: "E", konten: "Latin", isBenar: false },
      ],
    },
    {
      konten: "Amandemen UUD 1945 dilakukan sebanyak berapa kali?",
      topik: "UUD 1945",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "UUD 1945 telah diamandemen sebanyak 4 kali: Amandemen I (1999), Amandemen II (2000), Amandemen III (2001), dan Amandemen IV (2002).",
      opsi: [
        { label: "A", konten: "2 kali", isBenar: false },
        { label: "B", konten: "3 kali", isBenar: false },
        { label: "C", konten: "4 kali", isBenar: true },
        { label: "D", konten: "5 kali", isBenar: false },
        { label: "E", konten: "6 kali", isBenar: false },
      ],
    },
  ];

  // ============================================================
  // SOAL TIU (Tes Intelegensia Umum) — CPNS SKD
  // ============================================================
  const soalTIU = [
    {
      konten: "Jika 3x + 7 = 22, maka nilai x adalah...",
      topik: "Matematika Dasar",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "3x + 7 = 22 → 3x = 22 - 7 = 15 → x = 15/3 = 5",
      opsi: [
        { label: "A", konten: "3", isBenar: false },
        { label: "B", konten: "4", isBenar: false },
        { label: "C", konten: "5", isBenar: true },
        { label: "D", konten: "6", isBenar: false },
        { label: "E", konten: "7", isBenar: false },
      ],
    },
    {
      konten: "Deret berikut: 2, 4, 8, 16, 32, ... Bilangan selanjutnya adalah...",
      topik: "Deret Angka",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Pola deret adalah perkalian 2 (deret geometri dengan rasio 2). Setelah 32, bilangan berikutnya adalah 32 × 2 = 64.",
      opsi: [
        { label: "A", konten: "48", isBenar: false },
        { label: "B", konten: "56", isBenar: false },
        { label: "C", konten: "60", isBenar: false },
        { label: "D", konten: "64", isBenar: true },
        { label: "E", konten: "72", isBenar: false },
      ],
    },
    {
      konten: "Sebuah persegi panjang memiliki panjang 12 cm dan lebar 8 cm. Luas persegi panjang tersebut adalah...",
      topik: "Geometri",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Luas persegi panjang = panjang × lebar = 12 × 8 = 96 cm²",
      opsi: [
        { label: "A", konten: "80 cm²", isBenar: false },
        { label: "B", konten: "88 cm²", isBenar: false },
        { label: "C", konten: "96 cm²", isBenar: true },
        { label: "D", konten: "104 cm²", isBenar: false },
        { label: "E", konten: "112 cm²", isBenar: false },
      ],
    },
    {
      konten: "MEJA : KAYU = BAJU : ...",
      topik: "Analogi",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Meja terbuat dari kayu, maka baju terbuat dari kain. Hubungannya adalah benda dan bahan pembuatnya.",
      opsi: [
        { label: "A", konten: "Benang", isBenar: false },
        { label: "B", konten: "Kain", isBenar: true },
        { label: "C", konten: "Jahit", isBenar: false },
        { label: "D", konten: "Warna", isBenar: false },
        { label: "E", konten: "Pakaian", isBenar: false },
      ],
    },
    {
      konten: "Jika semua A adalah B, dan semua B adalah C, maka...",
      topik: "Penalaran Logis",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "Dari premis 'semua A adalah B' dan 'semua B adalah C', dapat disimpulkan bahwa semua A adalah C (silogisme).",
      opsi: [
        { label: "A", konten: "Semua C adalah A", isBenar: false },
        { label: "B", konten: "Semua A adalah C", isBenar: true },
        { label: "C", konten: "Tidak ada A yang C", isBenar: false },
        { label: "D", konten: "Sebagian A adalah C", isBenar: false },
        { label: "E", konten: "Semua C adalah B", isBenar: false },
      ],
    },
    {
      konten: "Rata-rata nilai ujian 5 siswa adalah 75. Jika nilai seorang siswa ditambahkan dan rata-rata menjadi 76, maka nilai siswa tersebut adalah...",
      topik: "Statistika",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "Total nilai 5 siswa = 5 × 75 = 375. Total nilai 6 siswa = 6 × 76 = 456. Nilai siswa ke-6 = 456 - 375 = 81.",
      opsi: [
        { label: "A", konten: "78", isBenar: false },
        { label: "B", konten: "79", isBenar: false },
        { label: "C", konten: "80", isBenar: false },
        { label: "D", konten: "81", isBenar: true },
        { label: "E", konten: "82", isBenar: false },
      ],
    },
  ];

  // ============================================================
  // SOAL TKP (Tes Karakteristik Pribadi) — CPNS SKD
  // ============================================================
  const soalTKP = [
    {
      konten: "Anda baru saja menyelesaikan tugas penting dan hasilnya sangat memuaskan. Reaksi Anda adalah...",
      topik: "Integritas",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Sikap terbaik adalah melaporkan hasil kerja kepada atasan dan mendokumentasikannya untuk pembelajaran ke depan.",
      opsi: [
        { label: "A", konten: "Merayakan keberhasilan sendiri tanpa memberitahu siapapun", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Langsung mengerjakan tugas berikutnya tanpa evaluasi", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Melaporkan hasil kepada atasan dan mendokumentasikan prosesnya", isBenar: true, nilaiTkp: 5 },
        { label: "D", konten: "Meminta penghargaan dari atasan atas keberhasilan tersebut", isBenar: false, nilaiTkp: 3 },
        { label: "E", konten: "Berbagi pengalaman dengan rekan kerja agar mereka bisa belajar", isBenar: false, nilaiTkp: 4 },
      ],
    },
    {
      konten: "Rekan kerja Anda sering datang terlambat dan hal ini mengganggu produktivitas tim. Apa yang Anda lakukan?",
      topik: "Orientasi pada Orang Lain",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "Pendekatan terbaik adalah berbicara langsung dengan rekan secara personal dan konstruktif sebelum melibatkan atasan.",
      opsi: [
        { label: "A", konten: "Membiarkan saja karena bukan urusan Anda", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Langsung melaporkan ke atasan tanpa bicara dengan rekan tersebut", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Menegur di depan seluruh tim agar menjadi pelajaran", isBenar: false, nilaiTkp: 3 },
        { label: "D", konten: "Berbicara secara personal dan konstruktif dengan rekan tersebut", isBenar: true, nilaiTkp: 5 },
        { label: "E", konten: "Mendiskusikan masalah ini dengan rekan lain untuk mencari solusi bersama", isBenar: false, nilaiTkp: 4 },
      ],
    },
    {
      konten: "Anda diberi tugas baru yang belum pernah Anda kerjakan sebelumnya. Sikap Anda adalah...",
      topik: "Semangat Berprestasi",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Sikap proaktif dengan mempelajari tugas baru dan meminta bimbingan menunjukkan semangat berprestasi yang tinggi.",
      opsi: [
        { label: "A", konten: "Menolak karena tidak sesuai dengan keahlian Anda", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Menerima tapi mengerjakan seadanya", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Menerima dan langsung mengerjakan tanpa persiapan", isBenar: false, nilaiTkp: 3 },
        { label: "D", konten: "Mempelajari tugas tersebut dan meminta bimbingan jika diperlukan", isBenar: true, nilaiTkp: 5 },
        { label: "E", konten: "Mendelegasikan tugas tersebut kepada rekan yang lebih ahli", isBenar: false, nilaiTkp: 4 },
      ],
    },
  ];

  // ============================================================
  // SOAL UTBK/SNBT — TPS Penalaran Umum
  // ============================================================
  const soalUTBK = [
    {
      konten: "Semua mahasiswa wajib mengikuti ujian akhir. Budi adalah mahasiswa. Kesimpulan yang tepat adalah...",
      topik: "Penalaran Deduktif",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Dari premis 'semua mahasiswa wajib ujian' dan 'Budi adalah mahasiswa', maka Budi wajib mengikuti ujian akhir.",
      opsi: [
        { label: "A", konten: "Budi mungkin mengikuti ujian akhir", isBenar: false },
        { label: "B", konten: "Budi wajib mengikuti ujian akhir", isBenar: true },
        { label: "C", konten: "Budi tidak perlu mengikuti ujian akhir", isBenar: false },
        { label: "D", konten: "Budi boleh tidak mengikuti ujian akhir", isBenar: false },
        { label: "E", konten: "Tidak dapat disimpulkan", isBenar: false },
      ],
    },
    {
      konten: "Bacalah teks berikut:\n\n*Polusi udara di kota-kota besar semakin meningkat setiap tahunnya. Hal ini disebabkan oleh bertambahnya jumlah kendaraan bermotor dan aktivitas industri. Dampaknya, angka penderita penyakit pernapasan meningkat signifikan.*\n\nIde pokok paragraf tersebut adalah...",
      topik: "Pemahaman Bacaan",
      tingkatKesulitan: "MUDAH" as const,
      pembahasanTeks: "Ide pokok adalah gagasan utama yang menjadi inti paragraf. Kalimat pertama menyatakan polusi udara meningkat, yang kemudian dijelaskan penyebab dan dampaknya.",
      opsi: [
        { label: "A", konten: "Penyebab polusi udara di kota besar", isBenar: false },
        { label: "B", konten: "Dampak polusi udara terhadap kesehatan", isBenar: false },
        { label: "C", konten: "Peningkatan polusi udara di kota-kota besar", isBenar: true },
        { label: "D", konten: "Jumlah kendaraan bermotor yang bertambah", isBenar: false },
        { label: "E", konten: "Penyakit pernapasan akibat polusi", isBenar: false },
      ],
    },
    {
      konten: "Jika p = 4 dan q = 3, maka nilai dari $p^2 + 2pq - q^2$ adalah...",
      topik: "Pengetahuan Kuantitatif",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "p² + 2pq - q² = 4² + 2(4)(3) - 3² = 16 + 24 - 9 = 31",
      opsi: [
        { label: "A", konten: "25", isBenar: false },
        { label: "B", konten: "28", isBenar: false },
        { label: "C", konten: "31", isBenar: true },
        { label: "D", konten: "34", isBenar: false },
        { label: "E", konten: "37", isBenar: false },
      ],
    },
  ];

  // ============================================================
  // SOAL SEKDIN — Matematika
  // ============================================================
  const soalSekdin = [
    {
      konten: "Sebuah kereta berangkat dari kota A pukul 07.00 dengan kecepatan 80 km/jam. Kereta lain berangkat dari kota B (berjarak 320 km dari A) pukul 08.00 dengan kecepatan 60 km/jam menuju kota A. Kedua kereta akan berpapasan pada pukul...",
      topik: "Kecepatan dan Jarak",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "Pada pukul 08.00, kereta A sudah menempuh 80 km. Sisa jarak = 320 - 80 = 240 km. Kecepatan relatif = 80 + 60 = 140 km/jam. Waktu berpapasan = 240/140 = 12/7 jam ≈ 1 jam 43 menit. Jadi berpapasan pukul 08.00 + 1:43 = 09.43.",
      opsi: [
        { label: "A", konten: "09.00", isBenar: false },
        { label: "B", konten: "09.30", isBenar: false },
        { label: "C", konten: "09.43", isBenar: true },
        { label: "D", konten: "10.00", isBenar: false },
        { label: "E", konten: "10.20", isBenar: false },
      ],
    },
    {
      konten: "Harga sebuah barang dinaikkan 20%, kemudian diturunkan 20%. Persentase perubahan harga dari harga awal adalah...",
      topik: "Persentase",
      tingkatKesulitan: "SEDANG" as const,
      pembahasanTeks: "Misalkan harga awal = 100. Setelah naik 20% = 120. Setelah turun 20% dari 120 = 120 × 0,8 = 96. Perubahan = 96 - 100 = -4, jadi turun 4%.",
      opsi: [
        { label: "A", konten: "Tidak berubah (0%)", isBenar: false },
        { label: "B", konten: "Turun 2%", isBenar: false },
        { label: "C", konten: "Turun 4%", isBenar: true },
        { label: "D", konten: "Naik 2%", isBenar: false },
        { label: "E", konten: "Naik 4%", isBenar: false },
      ],
    },
  ];

  let totalDibuat = 0;

  // Seed soal TWK
  for (const data of soalTWK) {
    const { opsi, ...soalData } = data;
    await prisma.soal.create({
      data: {
        ...soalData,
        kategori: "CPNS_SKD",
        subtes: "TWK",
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: opsi },
      },
    });
    totalDibuat++;
  }
  console.log(`✅ ${soalTWK.length} soal TWK dibuat`);

  // Seed soal TIU
  for (const data of soalTIU) {
    const { opsi, ...soalData } = data;
    await prisma.soal.create({
      data: {
        ...soalData,
        kategori: "CPNS_SKD",
        subtes: "TIU",
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: opsi },
      },
    });
    totalDibuat++;
  }
  console.log(`✅ ${soalTIU.length} soal TIU dibuat`);

  // Seed soal TKP
  for (const data of soalTKP) {
    const { opsi, ...soalData } = data;
    await prisma.soal.create({
      data: {
        ...soalData,
        kategori: "CPNS_SKD",
        subtes: "TKP",
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: opsi },
      },
    });
    totalDibuat++;
  }
  console.log(`✅ ${soalTKP.length} soal TKP dibuat`);

  // Seed soal UTBK
  for (const data of soalUTBK) {
    const { opsi, ...soalData } = data;
    await prisma.soal.create({
      data: {
        ...soalData,
        kategori: "UTBK_SNBT",
        subtes: "TPS_PENALARAN_UMUM",
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: opsi },
      },
    });
    totalDibuat++;
  }
  console.log(`✅ ${soalUTBK.length} soal UTBK/SNBT dibuat`);

  // Seed soal Sekdin
  for (const data of soalSekdin) {
    const { opsi, ...soalData } = data;
    await prisma.soal.create({
      data: {
        ...soalData,
        kategori: "SEKDIN",
        subtes: "MATEMATIKA",
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: opsi },
      },
    });
    totalDibuat++;
  }
  console.log(`✅ ${soalSekdin.length} soal Sekdin dibuat`);

  console.log(`\n🎉 Total ${totalDibuat} soal berhasil dibuat!`);
}

if (require.main === module) {
  async function run() {
    const instruktur = await prisma.user.findFirst({
      where: { role: "INSTRUKTUR" },
      select: { id: true },
    });
    if (!instruktur) throw new Error("Instruktur not found");
    await seedSoal(instruktur.id);
  }
  run()
    .catch((e) => {
      console.error("❌ Seed soal gagal:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
