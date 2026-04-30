import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding paket CPNS SKD berbayar...");
  const instruktur = await prisma.user.findFirst({ where: { role: "INSTRUKTUR" }, select: { id: true } });
  if (!instruktur) throw new Error("Jalankan seed utama dulu.");
  const cid = instruktur.id;
  const soalIds: string[] = [];

  async function buatSoal(konten: string, topik: string, tk: string, pem: string, subtes: string, opsi: {label:string;konten:string;isBenar:boolean;nilaiTkp?:number}[]) {
    const s = await prisma.soal.create({
      data: { konten, topik, tingkatKesulitan: tk as never, pembahasanTeks: pem, kategori: "CPNS_SKD", subtes: subtes as never, tipe: "PILIHAN_GANDA", createdById: cid, opsi: { create: opsi } },
    });
    soalIds.push(s.id);
  }

  await buatSoal("Pancasila ditetapkan sebagai dasar negara pada tanggal...","Pancasila","MUDAH","Pancasila ditetapkan pada 18 Agustus 1945 oleh PPKI.","TWK",[{label:"A",konten:"17 Agustus 1945",isBenar:false},{label:"B",konten:"18 Agustus 1945",isBenar:true},{label:"C",konten:"1 Juni 1945",isBenar:false},{label:"D",konten:"22 Juni 1945",isBenar:false},{label:"E",konten:"29 Mei 1945",isBenar:false}]);
  await buatSoal("Lembaga yang berwenang mengubah UUD 1945 adalah...","UUD 1945","MUDAH","Berdasarkan Pasal 37 UUD 1945, MPR berwenang mengubah UUD.","TWK",[{label:"A",konten:"DPR",isBenar:false},{label:"B",konten:"DPD",isBenar:false},{label:"C",konten:"MPR",isBenar:true},{label:"D",konten:"Presiden",isBenar:false},{label:"E",konten:"Mahkamah Konstitusi",isBenar:false}]);
  await buatSoal("Nilai utama sila ke-2 Pancasila adalah...","Pancasila","SEDANG","Sila ke-2 mengandung nilai pengakuan harkat dan martabat manusia.","TWK",[{label:"A",konten:"Ketuhanan",isBenar:false},{label:"B",konten:"Pengakuan harkat dan martabat manusia",isBenar:true},{label:"C",konten:"Persatuan bangsa",isBenar:false},{label:"D",konten:"Musyawarah",isBenar:false},{label:"E",konten:"Keadilan distributif",isBenar:false}]);
  await buatSoal("Hak yang diatur Pasal 28C UUD 1945 adalah...","UUD 1945","SEDANG","Pasal 28C mengatur hak mengembangkan diri melalui pendidikan.","TWK",[{label:"A",konten:"Hak atas pekerjaan",isBenar:false},{label:"B",konten:"Hak mengembangkan diri melalui pendidikan",isBenar:true},{label:"C",konten:"Hak kewarganegaraan",isBenar:false},{label:"D",konten:"Hak beragama",isBenar:false},{label:"E",konten:"Hak atas kesehatan",isBenar:false}]);
  await buatSoal("Bhinneka Tunggal Ika berasal dari kitab...","Wawasan Kebangsaan","SEDANG","Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karangan Mpu Tantular.","TWK",[{label:"A",konten:"Negarakertagama",isBenar:false},{label:"B",konten:"Pararaton",isBenar:false},{label:"C",konten:"Sutasoma",isBenar:true},{label:"D",konten:"Arjunawiwaha",isBenar:false},{label:"E",konten:"Ramayana",isBenar:false}]);
  console.log("5 soal TWK dibuat");

  await buatSoal("Jika 5x - 3 = 17, maka nilai x adalah...","Matematika Dasar","MUDAH","5x - 3 = 17 maka 5x = 20 maka x = 4.","TIU",[{label:"A",konten:"2",isBenar:false},{label:"B",konten:"3",isBenar:false},{label:"C",konten:"4",isBenar:true},{label:"D",konten:"5",isBenar:false},{label:"E",konten:"6",isBenar:false}]);
  await buatSoal("Deret: 3, 6, 12, 24, 48, ... Bilangan berikutnya...","Deret Angka","MUDAH","Pola geometri rasio 2. Setelah 48: 48 x 2 = 96.","TIU",[{label:"A",konten:"72",isBenar:false},{label:"B",konten:"84",isBenar:false},{label:"C",konten:"96",isBenar:true},{label:"D",konten:"108",isBenar:false},{label:"E",konten:"120",isBenar:false}]);
  await buatSoal("DOKTER : PASIEN = GURU : ...","Analogi","MUDAH","Dokter melayani pasien, guru melayani murid.","TIU",[{label:"A",konten:"Sekolah",isBenar:false},{label:"B",konten:"Murid",isBenar:true},{label:"C",konten:"Pelajaran",isBenar:false},{label:"D",konten:"Kelas",isBenar:false},{label:"E",konten:"Buku",isBenar:false}]);
  await buatSoal("Diskon 25% untuk barang Rp 480.000. Harga setelah diskon...","Persentase","SEDANG","Diskon = 25% x 480.000 = 120.000. Harga = 480.000 - 120.000 = 360.000.","TIU",[{label:"A",konten:"Rp 320.000",isBenar:false},{label:"B",konten:"Rp 340.000",isBenar:false},{label:"C",konten:"Rp 360.000",isBenar:true},{label:"D",konten:"Rp 380.000",isBenar:false},{label:"E",konten:"Rp 400.000",isBenar:false}]);
  await buatSoal("Semua pegawai negeri wajib menaati peraturan. Budi adalah pegawai negeri. Kesimpulan...","Penalaran Logis","MUDAH","Silogisme: semua A adalah B, Budi adalah A, maka Budi wajib menaati peraturan.","TIU",[{label:"A",konten:"Budi mungkin menaati peraturan",isBenar:false},{label:"B",konten:"Budi wajib menaati peraturan",isBenar:true},{label:"C",konten:"Budi tidak perlu menaati peraturan",isBenar:false},{label:"D",konten:"Tidak dapat disimpulkan",isBenar:false},{label:"E",konten:"Budi boleh tidak menaati peraturan",isBenar:false}]);
  console.log("5 soal TIU dibuat");

  await buatSoal("Atasan memberi tugas mendadak di luar jam kerja. Sikap Anda...","Profesionalisme","MUDAH","Profesionalisme: menerima dan menyelesaikan dengan tanggung jawab.","TKP",[{label:"A",konten:"Menolak karena di luar jam kerja",isBenar:false,nilaiTkp:1},{label:"B",konten:"Menerima tapi seadanya",isBenar:false,nilaiTkp:2},{label:"C",konten:"Minta kompensasi dulu",isBenar:false,nilaiTkp:3},{label:"D",konten:"Delegasikan ke rekan",isBenar:false,nilaiTkp:4},{label:"E",konten:"Menerima dan menyelesaikan dengan tanggung jawab",isBenar:true,nilaiTkp:5}]);
  await buatSoal("Rekan kerja melakukan kecurangan kecil dalam laporan. Anda...","Integritas","SEDANG","Integritas: tegur personal dulu sebelum melaporkan.","TKP",[{label:"A",konten:"Pura-pura tidak tahu",isBenar:false,nilaiTkp:1},{label:"B",konten:"Ikut melakukan hal sama",isBenar:false,nilaiTkp:1},{label:"C",konten:"Langsung lapor atasan",isBenar:false,nilaiTkp:3},{label:"D",konten:"Tegur personal dan minta perbaiki",isBenar:true,nilaiTkp:5},{label:"E",konten:"Bicarakan dengan rekan lain",isBenar:false,nilaiTkp:2}]);
  await buatSoal("Target kerja sangat tinggi dan sulit dicapai. Sikap Anda...","Semangat Berprestasi","MUDAH","Semangat berprestasi: terima tantangan dan buat rencana terstruktur.","TKP",[{label:"A",konten:"Mengeluh dan minta target turun",isBenar:false,nilaiTkp:1},{label:"B",konten:"Terima tapi tidak berusaha keras",isBenar:false,nilaiTkp:2},{label:"C",konten:"Minta bantuan rekan",isBenar:false,nilaiTkp:3},{label:"D",konten:"Terima dan buat rencana kerja terstruktur",isBenar:true,nilaiTkp:5},{label:"E",konten:"Tunggu arahan atasan",isBenar:false,nilaiTkp:4}]);
  await buatSoal("Ide Anda ditolak mayoritas peserta rapat. Reaksi Anda...","Pengendalian Diri","SEDANG","Pengendalian diri: terima dengan lapang dada dan dukung keputusan.","TKP",[{label:"A",konten:"Marah dan tinggalkan rapat",isBenar:false,nilaiTkp:1},{label:"B",konten:"Diam dan tidak berkontribusi",isBenar:false,nilaiTkp:2},{label:"C",konten:"Paksa ide meski ditolak",isBenar:false,nilaiTkp:1},{label:"D",konten:"Terima lapang dada dan dukung keputusan",isBenar:true,nilaiTkp:5},{label:"E",konten:"Sampaikan keberatan tertulis setelah rapat",isBenar:false,nilaiTkp:4}]);
  await buatSoal("Warga kesulitan mengurus dokumen di kantor Anda. Anda...","Orientasi Pelayanan","MUDAH","Orientasi pelayanan: bantu secara proaktif dan pastikan selesai.","TKP",[{label:"A",konten:"Biarkan bukan tugas Anda",isBenar:false,nilaiTkp:1},{label:"B",konten:"Arahkan ke petugas lain tanpa memastikan",isBenar:false,nilaiTkp:3},{label:"C",konten:"Bantu jelaskan prosedur dan pastikan selesai",isBenar:true,nilaiTkp:5},{label:"D",konten:"Suruh kembali besok",isBenar:false,nilaiTkp:1},{label:"E",konten:"Laporkan ke atasan",isBenar:false,nilaiTkp:4}]);
  console.log("5 soal TKP dibuat");

  // Buat paket berbayar
  const slug = "tryout-skd-cpns-premium-paket-a";
  const existing = await prisma.paketTryout.findUnique({ where: { slug } });
  if (existing) { console.log("Paket sudah ada, skip."); return; }

  const paket = await prisma.paketTryout.create({
    data: {
      slug,
      judul: "Tryout SKD CPNS Premium — Paket A",
      deskripsi: "Paket tryout SKD CPNS premium dengan soal pilihan berkualitas tinggi. Dilengkapi pembahasan lengkap dan analisis skor per subtes.",
      kategori: "CPNS_SKD",
      durasi: 100,
      totalSoal: soalIds.length,
      harga: 75000,
      modelAkses: "BERBAYAR",
      status: "PUBLISHED",
      passingGrade: { twk: 65, tiu: 80, tkp: 166, total: 311 },
      konfigurasi: { twk: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 }, tiu: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 }, tkp: { jumlahSoal: 5, skala: [1,2,3,4,5] } },
      createdById: cid,
      soal: { create: soalIds.map((soalId, i) => ({ soalId, urutan: i + 1 })) },
    },
  });

  console.log("Paket dibuat:", paket.judul);
  console.log("Harga: Rp", paket.harga.toString());
  console.log("Total soal:", paket.totalSoal);
  console.log("Selesai!");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());