seed = '''import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding paket CPNS SKD berbayar...");

  const instruktur = await prisma.user.findFirst({ where: { role: "INSTRUKTUR" }, select: { id: true } });
  if (!instruktur) throw new Error("Jalankan seed utama dulu.");
  const cid = instruktur.id;

  // ── TWK (5 soal) ──────────────────────────────────────────
  const twkSoal = [
    {
      konten: "Pancasila ditetapkan sebagai dasar negara Indonesia pada tanggal...",
      topik: "Pancasila", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Pancasila ditetapkan sebagai dasar negara pada 18 Agustus 1945 oleh PPKI.",
      opsi: [
        { label: "A", konten: "17 Agustus 1945", isBenar: false },
        { label: "B", konten: "18 Agustus 1945", isBenar: true },
        { label: "C", konten: "1 Juni 1945", isBenar: false },
        { label: "D", konten: "22 Juni 1945", isBenar: false },
        { label: "E", konten: "29 Mei 1945", isBenar: false },
      ],
    },
    {
      konten: "Lembaga negara yang berwenang mengubah UUD 1945 adalah...",
      topik: "UUD 1945", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Berdasarkan Pasal 37 UUD 1945, MPR adalah lembaga yang berwenang mengubah UUD.",
      opsi: [
        { label: "A", konten: "DPR", isBenar: false },
        { label: "B", konten: "DPD", isBenar: false },
        { label: "C", konten: "MPR", isBenar: true },
        { label: "D", konten: "Presiden", isBenar: false },
        { label: "E", konten: "Mahkamah Konstitusi", isBenar: false },
      ],
    },
    {
      konten: "Nilai-nilai yang terkandung dalam sila ke-2 Pancasila adalah...",
      topik: "Pancasila", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Sila ke-2 'Kemanusiaan yang Adil dan Beradab' mengandung nilai pengakuan harkat dan martabat manusia.",
      opsi: [
        { label: "A", konten: "Ketuhanan dan keimanan", isBenar: false },
        { label: "B", konten: "Pengakuan harkat dan martabat manusia", isBenar: true },
        { label: "C", konten: "Persatuan dan kesatuan bangsa", isBenar: false },
        { label: "D", konten: "Musyawarah mufakat", isBenar: false },
        { label: "E", konten: "Keadilan distributif", isBenar: false },
      ],
    },
    {
      konten: "Hak warga negara yang diatur dalam Pasal 28C UUD 1945 adalah...",
      topik: "UUD 1945", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Pasal 28C mengatur hak untuk mengembangkan diri melalui pemenuhan kebutuhan dasar dan pendidikan.",
      opsi: [
        { label: "A", konten: "Hak atas pekerjaan", isBenar: false },
        { label: "B", konten: "Hak mengembangkan diri melalui pendidikan", isBenar: true },
        { label: "C", konten: "Hak atas kewarganegaraan", isBenar: false },
        { label: "D", konten: "Hak beragama", isBenar: false },
        { label: "E", konten: "Hak atas kesehatan", isBenar: false },
      ],
    },
    {
      konten: "Semboyan Bhinneka Tunggal Ika pertama kali ditemukan dalam kitab...",
      topik: "Wawasan Kebangsaan", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karangan Mpu Tantular pada masa Majapahit.",
      opsi: [
        { label: "A", konten: "Negarakertagama", isBenar: false },
        { label: "B", konten: "Pararaton", isBenar: false },
        { label: "C", konten: "Sutasoma", isBenar: true },
        { label: "D", konten: "Arjunawiwaha", isBenar: false },
        { label: "E", konten: "Ramayana", isBenar: false },
      ],
    },
  ];

  // ── TIU (5 soal) ──────────────────────────────────────────
  const tiuSoal = [
    {
      konten: "Jika 5x - 3 = 17, maka nilai x adalah...",
      topik: "Matematika Dasar", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "5x - 3 = 17 → 5x = 20 → x = 4",
      opsi: [
        { label: "A", konten: "2", isBenar: false },
        { label: "B", konten: "3", isBenar: false },
        { label: "C", konten: "4", isBenar: true },
        { label: "D", konten: "5", isBenar: false },
        { label: "E", konten: "6", isBenar: false },
      ],
    },
    {
      konten: "Deret: 3, 6, 12, 24, 48, ... Bilangan berikutnya adalah...",
      topik: "Deret Angka", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Pola deret geometri dengan rasio 2. Setelah 48: 48 × 2 = 96.",
      opsi: [
        { label: "A", konten: "72", isBenar: false },
        { label: "B", konten: "84", isBenar: false },
        { label: "C", konten: "96", isBenar: true },
        { label: "D", konten: "108", isBenar: false },
        { label: "E", konten: "120", isBenar: false },
      ],
    },
    {
      konten: "DOKTER : PASIEN = GURU : ...",
      topik: "Analogi", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Dokter melayani pasien, guru melayani murid. Hubungan profesi dengan objek layanannya.",
      opsi: [
        { label: "A", konten: "Sekolah", isBenar: false },
        { label: "B", konten: "Murid", isBenar: true },
        { label: "C", konten: "Pelajaran", isBenar: false },
        { label: "D", konten: "Kelas", isBenar: false },
        { label: "E", konten: "Buku", isBenar: false },
      ],
    },
    {
      konten: "Sebuah toko memberikan diskon 25% untuk barang seharga Rp 480.000. Harga setelah diskon adalah...",
      topik: "Persentase", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Diskon = 25% × 480.000 = 120.000. Harga setelah diskon = 480.000 - 120.000 = 360.000.",
      opsi: [
        { label: "A", konten: "Rp 320.000", isBenar: false },
        { label: "B", konten: "Rp 340.000", isBenar: false },
        { label: "C", konten: "Rp 360.000", isBenar: true },
        { label: "D", konten: "Rp 380.000", isBenar: false },
        { label: "E", konten: "Rp 400.000", isBenar: false },
      ],
    },
    {
      konten: "Semua pegawai negeri wajib menaati peraturan. Budi adalah pegawai negeri. Kesimpulan yang tepat...",
      topik: "Penalaran Logis", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Silogisme: semua A adalah B, Budi adalah A, maka Budi adalah B (wajib menaati peraturan).",
      opsi: [
        { label: "A", konten: "Budi mungkin menaati peraturan", isBenar: false },
        { label: "B", konten: "Budi wajib menaati peraturan", isBenar: true },
        { label: "C", konten: "Budi tidak perlu menaati peraturan", isBenar: false },
        { label: "D", konten: "Tidak dapat disimpulkan", isBenar: false },
        { label: "E", konten: "Budi boleh tidak menaati peraturan", isBenar: false },
      ],
    },
  ];

  // ── TKP (5 soal) ──────────────────────────────────────────
  const tkpSoal = [
    {
      konten: "Atasan Anda memberikan tugas mendadak di luar jam kerja. Sikap Anda...",
      topik: "Profesionalisme", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Sikap profesional adalah menyelesaikan tugas dengan penuh tanggung jawab.",
      opsi: [
        { label: "A", konten: "Menolak karena sudah di luar jam kerja", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Menerima tapi mengerjakan seadanya", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Meminta kompensasi lembur terlebih dahulu", isBenar: false, nilaiTkp: 3 },
        { label: "D", konten: "Mendelegasikan ke rekan yang masih di kantor", isBenar: false, nilaiTkp: 4 },
        { label: "E", konten: "Menerima dan menyelesaikan dengan penuh tanggung jawab", isBenar: true, nilaiTkp: 5 },
      ],
    },
    {
      konten: "Anda menemukan rekan kerja melakukan kecurangan kecil dalam laporan. Anda...",
      topik: "Integritas", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Integritas mengharuskan kita menegur secara personal dulu sebelum melaporkan.",
      opsi: [
        { label: "A", konten: "Pura-pura tidak tahu", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Ikut-ikutan melakukan hal yang sama", isBenar: false, nilaiTkp: 1 },
        { label: "C", konten: "Langsung melaporkan ke atasan tanpa bicara dulu", isBenar: false, nilaiTkp: 3 },
        { label: "D", konten: "Menegur secara personal dan memintanya memperbaiki", isBenar: true, nilaiTkp: 5 },
        { label: "E", konten: "Membicarakan dengan rekan lain", isBenar: false, nilaiTkp: 2 },
      ],
    },
    {
      konten: "Anda diberi target kerja yang sangat tinggi dan sulit dicapai. Sikap Anda...",
      topik: "Semangat Berprestasi", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Semangat berprestasi ditunjukkan dengan menerima tantangan dan berusaha maksimal.",
      opsi: [
        { label: "A", konten: "Mengeluh dan meminta target diturunkan", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Menerima tapi tidak berusaha keras", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Meminta bantuan rekan agar target terbagi", isBenar: false, nilaiTkp: 3 },
        { label: "D", konten: "Menerima dan membuat rencana kerja yang terstruktur", isBenar: true, nilaiTkp: 5 },
        { label: "E", konten: "Menunggu arahan lebih lanjut dari atasan", isBenar: false, nilaiTkp: 4 },
      ],
    },
    {
      konten: "Saat rapat, ide Anda ditolak oleh mayoritas peserta. Reaksi Anda...",
      topik: "Pengendalian Diri", tingkatKesulitan: "SEDANG",
      pembahasanTeks: "Pengendalian diri yang baik adalah menerima keputusan dengan lapang dada dan tetap berkontribusi.",
      opsi: [
        { label: "A", konten: "Marah dan meninggalkan rapat", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Diam dan tidak mau berkontribusi lagi", isBenar: false, nilaiTkp: 2 },
        { label: "C", konten: "Memaksakan ide meski sudah ditolak", isBenar: false, nilaiTkp: 1 },
        { label: "D", konten: "Menerima dengan lapang dada dan mendukung keputusan rapat", isBenar: true, nilaiTkp: 5 },
        { label: "E", konten: "Menyampaikan keberatan secara tertulis setelah rapat", isBenar: false, nilaiTkp: 4 },
      ],
    },
    {
      konten: "Anda melihat warga kesulitan mengurus dokumen di kantor Anda. Anda...",
      topik: "Orientasi Pelayanan", tingkatKesulitan: "MUDAH",
      pembahasanTeks: "Orientasi pelayanan terbaik adalah membantu secara proaktif.",
      opsi: [
        { label: "A", konten: "Membiarkan karena bukan tugas Anda", isBenar: false, nilaiTkp: 1 },
        { label: "B", konten: "Mengarahkan ke petugas lain tanpa memastikan terbantu", isBenar: false, nilaiTkp: 3 },
        { label: "C", konten: "Membantu menjelaskan prosedur dan memastikan selesai", isBenar: true, nilaiTkp: 5 },
        { label: "D", konten: "Menyuruh kembali besok", isBenar: false, nilaiTkp: 1 },
        { label: "E", konten: "Melaporkan ke atasan agar ditangani", isBenar: false, nilaiTkp: 4 },
      ],
    },
  ];

  // Buat soal dan kumpulkan ID
  const soalIds: string[] = [];

  for (const s of twkSoal) {
    const { opsi, ...d } = s;
    const soal = await prisma.soal.create({
      data: { ...d, tingkatKesulitan: d.tingkatKesulitan as never, kategori: "CPNS_SKD", subtes: "TWK", tipe: "PILIHAN_GANDA", createdById, opsi: { create: opsi } },
    });
    soalIds.push(soal.id);
  }
  console.log("5 soal TWK dibuat");

  for (const s of tiuSoal) {
    const { opsi, ...d } = s;
    const soal = await prisma.soal.create({
      data: { ...d, tingkatKesulitan: d.tingkatKesulitan as never, kategori: "CPNS_SKD", subtes: "TIU", tipe: "PILIHAN_GANDA", createdById, opsi: { create: opsi } },
    });
    soalIds.push(soal.id);
  }
  console.log("5 soal TIU dibuat");

  for (const s of tkpSoal) {
    const { opsi, ...d } = s;
    const soal = await prisma.soal.create({
      data: { ...d, tingkatKesulitan: d.tingkatKesulitan as never, kategori: "CPNS_SKD", subtes: "TKP", tipe: "PILIHAN_GANDA", createdById, opsi: { create: opsi } },
    });
    soalIds.push(soal.id);
  }
  console.log("5 soal TKP dibuat");

  // Buat paket berbayar
  const slug = "tryout-skd-cpns-premium-paket-a";
  const existing = await prisma.paketTryout.findUnique({ where: { slug } });
  if (existing) {
    console.log("Paket sudah ada, skip.");
    return;
  }

  const paket = await prisma.paketTryout.create({
    data: {
      slug,
      judul: "Tryout SKD CPNS Premium — Paket A",
      deskripsi: "Paket tryout SKD CPNS premium dengan soal pilihan berkualitas tinggi. Dilengkapi pembahasan lengkap dan analisis skor per subtes. Cocok untuk persiapan ujian CPNS tingkat nasional.",
      kategori: "CPNS_SKD",
      durasi: 100,
      totalSoal: soalIds.length,
      harga: 75000,
      modelAkses: "BERBAYAR",
      status: "PUBLISHED",
      passingGrade: { twk: 65, tiu: 80, tkp: 166, total: 311 },
      konfigurasi: {
        twk: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 },
        tiu: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 },
        tkp: { jumlahSoal: 5, skala: [1, 2, 3, 4, 5] },
      },
      createdById: instruktur.id,
      soal: {
        create: soalIds.map((soalId, i) => ({ soalId, urutan: i + 1 })),
      },
    },
  });

  console.log("Paket berbayar dibuat:", paket.judul);
  console.log("Harga: Rp", paket.harga.toString());
  console.log("Total soal:", paket.totalSoal);
  console.log("Selesai!");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
'''

with open('prisma/seed-cpns-berbayar.ts', 'w') as f:
    f.write(seed)
print("Written:", len(seed), "chars")
