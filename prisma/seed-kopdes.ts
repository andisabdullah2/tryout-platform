import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Label = "A" | "B" | "C" | "D" | "E";
type TingkatKesulitan = "MUDAH" | "SEDANG" | "SULIT";
type KomponenKopdes =
  | "KOGNITIF_BAHASA"
  | "KOGNITIF_HITUNGAN"
  | "KOGNITIF_PENGETAHUAN_UMUM"
  | "KOGNITIF_POLA_GAMBAR"
  | "KOGNITIF_ABSTRAKSI_RUANG"
  | "KOGNITIF_MENENTUKAN_BENTUK"
  | "MANAJEMEN_KOPERASI";

type OpsiSeed = {
  label: Label;
  konten: string;
  isBenar: boolean;
};

type SoalSeed = {
  konten: string;
  komponen: KomponenKopdes;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  pembahasanTeks: string;
  jawaban: Label;
  opsi: Record<Label, string>;
};

const LABELS: Label[] = ["A", "B", "C", "D", "E"];
const PAKET_SLUG = "tryout-rekrutmen-kopdes-kdkmp-2026-1";

const KOMPONEN_LABEL: Record<KomponenKopdes, string> = {
  KOGNITIF_BAHASA: "Kognitif Bahasa",
  KOGNITIF_HITUNGAN: "Kognitif Hitungan",
  KOGNITIF_PENGETAHUAN_UMUM: "Kognitif Pengetahuan Umum",
  KOGNITIF_POLA_GAMBAR: "Kognitif Pola Gambar",
  KOGNITIF_ABSTRAKSI_RUANG: "Kognitif Abstraksi Ruang",
  KOGNITIF_MENENTUKAN_BENTUK: "Kognitif Menentukan Bentuk",
  MANAJEMEN_KOPERASI: "Manajemen Koperasi",
};

const KOMPONEN_TARGET: Record<KomponenKopdes, number> = {
  KOGNITIF_BAHASA: 10,
  KOGNITIF_HITUNGAN: 10,
  KOGNITIF_PENGETAHUAN_UMUM: 10,
  KOGNITIF_POLA_GAMBAR: 10,
  KOGNITIF_ABSTRAKSI_RUANG: 10,
  KOGNITIF_MENENTUKAN_BENTUK: 10,
  MANAJEMEN_KOPERASI: 20,
};

function opsiPg(jawaban: Label, opsi: Record<Label, string>): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: label === jawaban,
  }));
}

function soal(
  komponen: KomponenKopdes,
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  jawaban: Label,
  opsi: Record<Label, string>
): SoalSeed {
  return {
    konten,
    komponen,
    topik,
    tingkatKesulitan,
    pembahasanTeks,
    jawaban,
    opsi,
  };
}

// Latihan orisinal untuk Rekrutmen Kopdes/KDKMP 2026.
// Blueprint mengikuti informasi publik pedoman seleksi: Tes Potensi Kognitif
// 6 subtes + Tes Manajemen Koperasi 20 soal, skor benar 5 dan salah/kosong 0.
const soalKopdes: SoalSeed[] = [
  soal(
    "KOGNITIF_BAHASA",
    "Makna kata akuntabel dalam kalimat 'Pengelolaan dana koperasi harus akuntabel' adalah...",
    "Sinonim",
    "MUDAH",
    "Akuntabel berarti dapat dipertanggungjawabkan, terutama dalam penggunaan kewenangan dan keuangan.",
    "B",
    {
      A: "Cepat diselesaikan",
      B: "Dapat dipertanggungjawabkan",
      C: "Mudah disembunyikan",
      D: "Bersifat sementara",
      E: "Tidak perlu dilaporkan",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Antonim kata transparan dalam konteks tata kelola adalah...",
    "Antonim",
    "MUDAH",
    "Transparan berarti terbuka. Lawan katanya adalah tertutup.",
    "D",
    {
      A: "Jelas",
      B: "Terbuka",
      C: "Terang",
      D: "Tertutup",
      E: "Terukur",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Kalimat yang paling efektif adalah...",
    "Kalimat Efektif",
    "SEDANG",
    "Kalimat efektif hemat kata, jelas, dan tidak memakai bentuk berlebihan.",
    "C",
    {
      A: "Para anggota-anggota koperasi hadir semua.",
      B: "Rapat akan dimulai pada jam pukul 09.00.",
      C: "Anggota koperasi menghadiri rapat tahunan.",
      D: "Demi untuk kemajuan koperasi, anggota harus aktif.",
      E: "Manajer melakukan koordinasi kepada para seluruh pengurus.",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Pernyataan 'Semua laporan bulanan harus diverifikasi' paling dekat maknanya dengan...",
    "Pemahaman Kalimat",
    "MUDAH",
    "Jika semua laporan bulanan harus diverifikasi, maka tidak ada laporan bulanan yang boleh langsung diterima tanpa pemeriksaan.",
    "A",
    {
      A: "Tidak ada laporan bulanan yang boleh diterima tanpa verifikasi",
      B: "Sebagian laporan bulanan tidak perlu diverifikasi",
      C: "Laporan tahunan harus selalu ditolak",
      D: "Verifikasi hanya dilakukan jika ada kesalahan",
      E: "Laporan bulanan boleh diverifikasi setelah disetujui",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Ide pokok paragraf berikut adalah...\n\nKoperasi desa dapat menjadi pusat layanan ekonomi warga. Agar berjalan baik, koperasi perlu dikelola transparan, melibatkan anggota, dan memiliki pencatatan keuangan yang rapi.",
    "Ide Pokok",
    "MUDAH",
    "Kalimat pertama memuat gagasan utama, lalu kalimat kedua menjelaskan syarat pengelolaan yang baik.",
    "E",
    {
      A: "Pencatatan keuangan koperasi selalu sulit",
      B: "Anggota koperasi tidak perlu dilibatkan",
      C: "Koperasi desa hanya melayani simpan pinjam",
      D: "Transparansi tidak penting bagi koperasi desa",
      E: "Koperasi desa dapat menjadi pusat layanan ekonomi warga",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Hubungan kata pada pasangan MANAJER : KOORDINASI setara dengan...",
    "Analogi Verbal",
    "SEDANG",
    "Manajer melakukan koordinasi. Auditor melakukan pemeriksaan.",
    "B",
    {
      A: "Anggota : simpanan",
      B: "Auditor : pemeriksaan",
      C: "Gudang : barang",
      D: "Modal : usaha",
      E: "Rapat : keputusan",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Kata yang tidak sekelompok adalah...",
    "Klasifikasi Verbal",
    "MUDAH",
    "Simpanan pokok, simpanan wajib, simpanan sukarela, dan pinjaman adalah istilah koperasi keuangan. Inventaris adalah aset/barang, bukan jenis simpanan/pinjaman anggota.",
    "D",
    {
      A: "Simpanan pokok",
      B: "Simpanan wajib",
      C: "Simpanan sukarela",
      D: "Inventaris",
      E: "Pinjaman anggota",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Kesimpulan dari premis 'Semua pengurus wajib membuat laporan. Sari adalah pengurus' adalah...",
    "Penalaran Verbal",
    "MUDAH",
    "Silogisme: semua A wajib B; Sari adalah A; maka Sari wajib B.",
    "A",
    {
      A: "Sari wajib membuat laporan",
      B: "Sari tidak perlu membuat laporan",
      C: "Semua pembuat laporan adalah pengurus",
      D: "Sari mungkin bukan pengurus",
      E: "Tidak dapat disimpulkan",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Negasi dari kalimat 'Semua anggota hadir dalam rapat' adalah...",
    "Logika Bahasa",
    "SEDANG",
    "Negasi dari 'semua hadir' adalah 'ada yang tidak hadir'.",
    "C",
    {
      A: "Semua anggota tidak hadir dalam rapat",
      B: "Sebagian anggota hadir dalam rapat",
      C: "Ada anggota yang tidak hadir dalam rapat",
      D: "Tidak ada anggota koperasi",
      E: "Rapat tidak dilaksanakan",
    }
  ),
  soal(
    "KOGNITIF_BAHASA",
    "Kalimat berikut perlu diperbaiki: 'Laporan keuangan koperasi harus dilaporkan secara rutin tiap bulan sekali.' Perbaikan paling tepat adalah...",
    "Penyuntingan",
    "SEDANG",
    "Frasa 'tiap bulan' dan 'sekali' berlebihan. Kalimat efektif cukup memakai 'setiap bulan'.",
    "E",
    {
      A: "Laporan keuangan koperasi harus dilaporkan rutin tiap bulan sekali.",
      B: "Laporan keuangan koperasi harus dilaporkan secara rutin tiap-tiap bulan sekali.",
      C: "Laporan keuangan koperasi harus dilaporkan dengan secara rutin.",
      D: "Laporan keuangan koperasi harus dilaporkan tiap bulan sekali secara rutin.",
      E: "Laporan keuangan koperasi harus dilaporkan secara rutin setiap bulan.",
    }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Jika 7x - 12 = 44, nilai x adalah...",
    "Aljabar",
    "MUDAH",
    "7x - 12 = 44, maka 7x = 56 dan x = 8.",
    "D",
    { A: "5", B: "6", C: "7", D: "8", E: "9" }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Modal awal koperasi Rp 25.000.000 bertambah 12%. Besar pertambahan modal adalah...",
    "Persentase",
    "MUDAH",
    "12% x 25.000.000 = 3.000.000.",
    "A",
    {
      A: "Rp 3.000.000",
      B: "Rp 3.250.000",
      C: "Rp 3.500.000",
      D: "Rp 4.000.000",
      E: "Rp 4.250.000",
    }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Deret 4, 8, 16, 32, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Pola deret adalah dikali 2, sehingga setelah 32 adalah 64.",
    "C",
    { A: "48", B: "56", C: "64", D: "72", E: "80" }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Deret 3, 7, 15, 31, 63, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Pola deret adalah dikali 2 lalu ditambah 1. Setelah 63 menjadi 127.",
    "E",
    { A: "95", B: "111", C: "119", D: "125", E: "127" }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Rata-rata omzet 5 hari adalah Rp 800.000. Jika omzet hari keenam Rp 1.100.000, rata-rata 6 hari menjadi...",
    "Rata-rata",
    "SEDANG",
    "Total 5 hari = 5 x 800.000 = 4.000.000. Ditambah 1.100.000 menjadi 5.100.000. Rata-rata 6 hari = 850.000.",
    "B",
    {
      A: "Rp 825.000",
      B: "Rp 850.000",
      C: "Rp 875.000",
      D: "Rp 900.000",
      E: "Rp 925.000",
    }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Perbandingan anggota laki-laki dan perempuan adalah 3 : 5. Jika total anggota 96 orang, jumlah anggota perempuan adalah...",
    "Perbandingan",
    "MUDAH",
    "Total bagian 8. Perempuan = 5/8 x 96 = 60.",
    "D",
    { A: "36", B: "48", C: "54", D: "60", E: "64" }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Koperasi membeli 40 paket sembako seharga Rp 72.000 per paket dan menjualnya Rp 80.000 per paket. Total keuntungan adalah...",
    "Aritmetika Sosial",
    "MUDAH",
    "Keuntungan per paket = 80.000 - 72.000 = 8.000. Total keuntungan = 40 x 8.000 = 320.000.",
    "C",
    {
      A: "Rp 240.000",
      B: "Rp 280.000",
      C: "Rp 320.000",
      D: "Rp 360.000",
      E: "Rp 400.000",
    }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Jika 2/5 dari dana operasional adalah Rp 6.000.000, total dana operasional adalah...",
    "Pecahan",
    "SEDANG",
    "2/5 x total = 6.000.000, maka total = 6.000.000 x 5/2 = 15.000.000.",
    "E",
    {
      A: "Rp 10.000.000",
      B: "Rp 12.000.000",
      C: "Rp 13.500.000",
      D: "Rp 14.000.000",
      E: "Rp 15.000.000",
    }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Sebuah rapat dimulai pukul 08.35 dan berlangsung 2 jam 45 menit. Rapat selesai pukul...",
    "Aritmetika Waktu",
    "MUDAH",
    "08.35 + 2 jam 45 menit = 11.20.",
    "B",
    { A: "11.10", B: "11.20", C: "11.25", D: "11.30", E: "11.40" }
  ),
  soal(
    "KOGNITIF_HITUNGAN",
    "Jika harga jual Rp 150.000 menghasilkan laba 25% dari harga beli, harga belinya adalah...",
    "Aritmetika Sosial",
    "SULIT",
    "Harga jual = 125% harga beli. Harga beli = 150.000 / 1,25 = 120.000.",
    "A",
    {
      A: "Rp 120.000",
      B: "Rp 122.500",
      C: "Rp 125.000",
      D: "Rp 130.000",
      E: "Rp 135.000",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Koperasi di Indonesia berlandaskan pada asas...",
    "Koperasi Umum",
    "MUDAH",
    "Koperasi Indonesia berasaskan kekeluargaan.",
    "B",
    {
      A: "Individualisme",
      B: "Kekeluargaan",
      C: "Persaingan bebas",
      D: "Komando tunggal",
      E: "Monopoli usaha",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Pasal UUD 1945 yang sering dikaitkan dengan perekonomian berdasarkan asas kekeluargaan adalah...",
    "Konstitusi Ekonomi",
    "SEDANG",
    "Pasal 33 UUD 1945 mengatur perekonomian nasional, termasuk asas kekeluargaan.",
    "D",
    {
      A: "Pasal 27",
      B: "Pasal 28",
      C: "Pasal 31",
      D: "Pasal 33",
      E: "Pasal 36",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Lembaga yang bertugas mengawasi pengelolaan dan tanggung jawab keuangan negara adalah...",
    "Lembaga Negara",
    "MUDAH",
    "BPK bertugas memeriksa pengelolaan dan tanggung jawab keuangan negara.",
    "C",
    {
      A: "DPR",
      B: "MPR",
      C: "BPK",
      D: "KPU",
      E: "Komisi Yudisial",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Musyawarah untuk mufakat dalam organisasi mencerminkan nilai Pancasila sila...",
    "Pancasila",
    "MUDAH",
    "Musyawarah untuk mufakat mencerminkan sila keempat Pancasila.",
    "D",
    { A: "Pertama", B: "Kedua", C: "Ketiga", D: "Keempat", E: "Kelima" }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "BUMDes adalah singkatan dari...",
    "Desa dan Ekonomi Lokal",
    "MUDAH",
    "BUMDes adalah Badan Usaha Milik Desa.",
    "A",
    {
      A: "Badan Usaha Milik Desa",
      B: "Badan Urusan Masyarakat Desa",
      C: "Biro Usaha Mandiri Desa",
      D: "Badan Utama Modal Desa",
      E: "Balai Usaha Masyarakat Desa",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Prinsip transparansi dalam lembaga ekonomi desa terutama bertujuan untuk...",
    "Tata Kelola",
    "SEDANG",
    "Transparansi membantu membangun kepercayaan, mencegah penyimpangan, dan memudahkan pengawasan anggota.",
    "E",
    {
      A: "Menyembunyikan data keuangan dari anggota",
      B: "Mengurangi keterlibatan anggota",
      C: "Mempercepat keputusan tanpa laporan",
      D: "Menghindari rapat anggota",
      E: "Membangun kepercayaan dan memudahkan pengawasan",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Dokumen yang biasanya menjadi dasar pencatatan transaksi pembelian adalah...",
    "Administrasi",
    "MUDAH",
    "Nota atau faktur pembelian menjadi bukti transaksi untuk pencatatan.",
    "B",
    {
      A: "Daftar hadir",
      B: "Nota pembelian",
      C: "Surat undangan",
      D: "Risalah rapat",
      E: "Kartu anggota",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Literasi keuangan paling tepat diartikan sebagai kemampuan untuk...",
    "Keuangan Dasar",
    "SEDANG",
    "Literasi keuangan adalah kemampuan memahami dan menggunakan informasi keuangan untuk mengambil keputusan yang tepat.",
    "C",
    {
      A: "Menghindari seluruh kegiatan usaha",
      B: "Menghafal semua istilah akuntansi",
      C: "Memahami dan menggunakan informasi keuangan",
      D: "Membuat keputusan tanpa data",
      E: "Meminjam modal tanpa perhitungan",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Salah satu manfaat digitalisasi layanan koperasi adalah...",
    "Digitalisasi",
    "MUDAH",
    "Digitalisasi dapat mempercepat pencatatan, akses informasi, dan pemantauan transaksi.",
    "A",
    {
      A: "Mempercepat pencatatan dan akses informasi",
      B: "Menghapus kebutuhan pengawasan",
      C: "Meniadakan laporan keuangan",
      D: "Membuat data tidak perlu diamankan",
      E: "Menghilangkan peran anggota",
    }
  ),
  soal(
    "KOGNITIF_PENGETAHUAN_UMUM",
    "Dalam pelayanan publik, konflik kepentingan terjadi ketika...",
    "Etika Pelayanan",
    "SEDANG",
    "Konflik kepentingan muncul saat kepentingan pribadi berpotensi memengaruhi keputusan jabatan atau organisasi.",
    "D",
    {
      A: "Keputusan dibuat berdasarkan data",
      B: "Laporan disampaikan terbuka",
      C: "Anggota dilibatkan dalam rapat",
      D: "Kepentingan pribadi memengaruhi keputusan organisasi",
      E: "Transaksi dicatat sesuai bukti",
    }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola bentuk: lingkaran, segitiga, persegi, lingkaran, segitiga, ... Bentuk berikutnya adalah...",
    "Pola Berulang",
    "MUDAH",
    "Pola berulang setiap tiga bentuk: lingkaran, segitiga, persegi.",
    "C",
    {
      A: "Lingkaran",
      B: "Segitiga",
      C: "Persegi",
      D: "Trapesium",
      E: "Bintang",
    }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola arah: atas, kanan, bawah, kiri, atas, ... Arah berikutnya adalah...",
    "Pola Rotasi",
    "MUDAH",
    "Arah berputar searah jarum jam: atas, kanan, bawah, kiri, lalu atas, kanan.",
    "B",
    { A: "Atas", B: "Kanan", C: "Bawah", D: "Kiri", E: "Diagonal" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola arsiran: kosong, setengah, penuh, kosong, setengah, ... Pola berikutnya adalah...",
    "Pola Arsiran",
    "MUDAH",
    "Pola berulang: kosong, setengah, penuh.",
    "D",
    {
      A: "Kosong",
      B: "Seperempat",
      C: "Setengah",
      D: "Penuh",
      E: "Tiga perempat",
    }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Urutan jumlah sisi: 3, 4, 5, 6, ... Bentuk berikutnya memiliki jumlah sisi...",
    "Pola Sisi",
    "MUDAH",
    "Jumlah sisi bertambah satu, sehingga setelah 6 adalah 7.",
    "E",
    { A: "4", B: "5", C: "6", D: "8", E: "7" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola ukuran: kecil, sedang, besar, kecil, sedang, ... Ukuran berikutnya adalah...",
    "Pola Ukuran",
    "MUDAH",
    "Pola berulang: kecil, sedang, besar.",
    "C",
    {
      A: "Kecil",
      B: "Sedang",
      C: "Besar",
      D: "Sangat kecil",
      E: "Sangat besar",
    }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Jika sebuah panah diputar 90 derajat searah jarum jam dari arah atas, arah panah menjadi...",
    "Rotasi Bentuk",
    "MUDAH",
    "Panah arah atas diputar 90 derajat searah jarum jam menjadi arah kanan.",
    "A",
    { A: "Kanan", B: "Kiri", C: "Bawah", D: "Atas", E: "Tetap" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola warna: merah, merah, biru, merah, merah, biru, ... Warna berikutnya adalah...",
    "Pola Warna",
    "MUDAH",
    "Pola berulang setiap tiga warna: merah, merah, biru.",
    "B",
    { A: "Biru", B: "Merah", C: "Hijau", D: "Kuning", E: "Putih" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola jumlah titik: 1, 2, 4, 8, ... Jumlah titik berikutnya adalah...",
    "Pola Kuantitas",
    "SEDANG",
    "Jumlah titik selalu dikali 2, sehingga setelah 8 adalah 16.",
    "D",
    { A: "10", B: "12", C: "14", D: "16", E: "18" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola posisi objek: kiri, tengah, kanan, tengah, kiri, ... Posisi berikutnya adalah...",
    "Pola Posisi",
    "SEDANG",
    "Pola bergerak kiri-tengah-kanan-tengah-kiri, sehingga berikutnya tengah.",
    "C",
    { A: "Kiri", B: "Kanan", C: "Tengah", D: "Atas", E: "Bawah" }
  ),
  soal(
    "KOGNITIF_POLA_GAMBAR",
    "Pola garis: horizontal, vertikal, horizontal, vertikal, ... Garis berikutnya adalah...",
    "Pola Alternasi",
    "MUDAH",
    "Pola bergantian antara horizontal dan vertikal.",
    "A",
    {
      A: "Horizontal",
      B: "Vertikal",
      C: "Diagonal kanan",
      D: "Diagonal kiri",
      E: "Lengkung",
    }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Sebuah kubus memiliki 6 sisi. Jika 2 sisi dicat merah dan sisanya biru, jumlah sisi biru adalah...",
    "Kubus Dasar",
    "MUDAH",
    "Kubus memiliki 6 sisi. Jika 2 sisi merah, sisi biru = 6 - 2 = 4.",
    "B",
    { A: "3", B: "4", C: "5", D: "6", E: "8" }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Jika sebuah balok dilihat dari depan berbentuk persegi panjang, maka bidang depan balok memiliki...",
    "Visualisasi Ruang",
    "MUDAH",
    "Bidang depan balok berupa persegi panjang dengan 4 sisi.",
    "C",
    { A: "2 sisi", B: "3 sisi", C: "4 sisi", D: "5 sisi", E: "6 sisi" }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Sebuah kubus diputar 180 derajat. Bentuk kubus setelah diputar adalah...",
    "Rotasi Ruang",
    "MUDAH",
    "Rotasi tidak mengubah bentuk dasar kubus.",
    "A",
    {
      A: "Tetap kubus",
      B: "Menjadi balok",
      C: "Menjadi prisma segitiga",
      D: "Menjadi limas",
      E: "Menjadi tabung",
    }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Jaring-jaring kubus yang benar harus memiliki jumlah persegi sebanyak...",
    "Jaring-jaring",
    "MUDAH",
    "Kubus memiliki 6 sisi, sehingga jaring-jaringnya tersusun dari 6 persegi.",
    "D",
    { A: "3", B: "4", C: "5", D: "6", E: "8" }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Jika sebuah dadu standar menunjukkan angka 1 di atas dan 6 di bawah, maka 1 dan 6 merupakan sisi...",
    "Relasi Sisi",
    "SEDANG",
    "Pada dadu standar, angka pada sisi atas dan bawah saling berhadapan.",
    "B",
    {
      A: "Bersebelahan",
      B: "Berhadapan",
      C: "Bertumpuk",
      D: "Berimpit",
      E: "Sejajar pada sisi sama",
    }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Sebuah benda dilihat dari atas berbentuk lingkaran dan dari samping berbentuk persegi panjang. Benda tersebut paling mungkin...",
    "Proyeksi",
    "SEDANG",
    "Tabung jika dilihat dari atas tampak lingkaran, dan dari samping tampak persegi panjang.",
    "E",
    { A: "Kubus", B: "Kerucut", C: "Bola", D: "Limas", E: "Tabung" }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Jika sebuah persegi dilipat tepat pada garis diagonalnya, hasil lipatannya berbentuk...",
    "Lipat Bentuk",
    "SEDANG",
    "Persegi yang dilipat pada diagonal akan membentuk segitiga.",
    "A",
    {
      A: "Segitiga",
      B: "Lingkaran",
      C: "Persegi panjang",
      D: "Trapesium",
      E: "Jajar genjang",
    }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Bangun ruang yang memiliki alas dan tutup berbentuk lingkaran adalah...",
    "Bangun Ruang",
    "MUDAH",
    "Tabung memiliki dua bidang lingkaran sebagai alas dan tutup.",
    "C",
    { A: "Kubus", B: "Balok", C: "Tabung", D: "Limas", E: "Prisma segitiga" }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Jika sebuah objek digeser ke kanan tanpa diputar, maka yang berubah adalah...",
    "Transformasi",
    "MUDAH",
    "Pergeseran mengubah posisi, bukan bentuk atau orientasi objek.",
    "D",
    {
      A: "Bentuknya",
      B: "Jumlah sisinya",
      C: "Warnanya",
      D: "Posisinya",
      E: "Jenis bangunnya",
    }
  ),
  soal(
    "KOGNITIF_ABSTRAKSI_RUANG",
    "Bayangan cermin dari huruf L kapital terhadap cermin vertikal akan mengubah posisi kaki huruf ke arah...",
    "Refleksi",
    "SULIT",
    "Cermin vertikal membalik kiri-kanan, sehingga kaki L yang semula ke kanan menjadi ke kiri.",
    "B",
    { A: "Kanan", B: "Kiri", C: "Atas", D: "Bawah", E: "Tidak berubah" }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Gabungan dua segitiga siku-siku yang sama besar pada sisi miringnya dapat membentuk...",
    "Komposisi Bentuk",
    "MUDAH",
    "Dua segitiga siku-siku sama besar dapat digabungkan menjadi persegi atau persegi panjang; opsi paling umum adalah persegi.",
    "A",
    { A: "Persegi", B: "Lingkaran", C: "Tabung", D: "Kerucut", E: "Bola" }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Sebuah bentuk memiliki 4 sisi sama panjang dan 4 sudut siku-siku. Bentuk tersebut adalah...",
    "Identifikasi Bentuk",
    "MUDAH",
    "Empat sisi sama panjang dan empat sudut siku-siku adalah ciri persegi.",
    "C",
    {
      A: "Belah ketupat",
      B: "Persegi panjang",
      C: "Persegi",
      D: "Trapesium",
      E: "Layang-layang",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Bentuk dengan satu sisi lengkung tertutup sempurna dan tidak memiliki sudut adalah...",
    "Identifikasi Bentuk",
    "MUDAH",
    "Lingkaran tidak memiliki sudut dan berupa garis lengkung tertutup.",
    "D",
    {
      A: "Segitiga",
      B: "Persegi",
      C: "Trapesium",
      D: "Lingkaran",
      E: "Belah ketupat",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Jika sebuah persegi panjang dipotong menjadi dua bagian sama besar secara diagonal, masing-masing bagian berbentuk...",
    "Dekomposisi Bentuk",
    "MUDAH",
    "Diagonal persegi panjang membagi bentuk menjadi dua segitiga siku-siku.",
    "E",
    {
      A: "Persegi",
      B: "Trapesium",
      C: "Lingkaran",
      D: "Jajar genjang",
      E: "Segitiga siku-siku",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Bangun datar dengan tepat satu pasang sisi sejajar disebut...",
    "Identifikasi Bentuk",
    "SEDANG",
    "Trapesium memiliki tepat satu pasang sisi sejajar.",
    "B",
    {
      A: "Persegi",
      B: "Trapesium",
      C: "Belah ketupat",
      D: "Segitiga",
      E: "Lingkaran",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Bentuk yang memiliki 5 sisi disebut...",
    "Nama Bentuk",
    "MUDAH",
    "Bangun datar bersisi lima disebut segi lima atau pentagon.",
    "A",
    {
      A: "Segi lima",
      B: "Segi empat",
      C: "Segi enam",
      D: "Segi tujuh",
      E: "Segi delapan",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Jika dua persegi sama besar disusun berdampingan secara horizontal, bentuk luarnya menjadi...",
    "Komposisi Bentuk",
    "MUDAH",
    "Dua persegi sama besar yang berdampingan membentuk persegi panjang.",
    "C",
    {
      A: "Segitiga",
      B: "Lingkaran",
      C: "Persegi panjang",
      D: "Trapesium",
      E: "Belah ketupat",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Bangun ruang yang semua sisinya berbentuk persegi sama besar adalah...",
    "Bangun Ruang",
    "MUDAH",
    "Kubus memiliki 6 sisi yang semuanya berbentuk persegi sama besar.",
    "D",
    { A: "Balok", B: "Limas", C: "Tabung", D: "Kubus", E: "Kerucut" }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Bentuk yang paling tepat untuk menggambarkan roda adalah...",
    "Asosiasi Bentuk",
    "MUDAH",
    "Roda secara umum berbentuk lingkaran.",
    "E",
    {
      A: "Segitiga",
      B: "Persegi",
      C: "Trapesium",
      D: "Segi lima",
      E: "Lingkaran",
    }
  ),
  soal(
    "KOGNITIF_MENENTUKAN_BENTUK",
    "Jika sebuah lingkaran dipotong tepat melalui pusatnya menjadi dua bagian sama besar, tiap bagian disebut...",
    "Dekomposisi Bentuk",
    "SEDANG",
    "Lingkaran yang dibagi dua melalui pusat menghasilkan dua setengah lingkaran.",
    "B",
    {
      A: "Juring kecil",
      B: "Setengah lingkaran",
      C: "Segitiga",
      D: "Persegi",
      E: "Busur penuh",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Kekuasaan tertinggi dalam koperasi berada pada...",
    "Kelembagaan Koperasi",
    "MUDAH",
    "Rapat Anggota merupakan pemegang kekuasaan tertinggi dalam koperasi.",
    "C",
    {
      A: "Manajer",
      B: "Pengawas",
      C: "Rapat Anggota",
      D: "Kepala desa",
      E: "Bendahara",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Simpanan yang wajib dibayarkan saat seseorang pertama kali menjadi anggota koperasi disebut...",
    "Permodalan Koperasi",
    "MUDAH",
    "Simpanan pokok dibayarkan satu kali saat masuk menjadi anggota.",
    "A",
    {
      A: "Simpanan pokok",
      B: "Simpanan wajib",
      C: "Simpanan sukarela",
      D: "Dana cadangan",
      E: "Sisa hasil usaha",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Simpanan yang dibayarkan anggota secara berkala sesuai ketentuan koperasi disebut...",
    "Permodalan Koperasi",
    "MUDAH",
    "Simpanan wajib dibayarkan secara berkala oleh anggota sesuai keputusan koperasi.",
    "B",
    {
      A: "Simpanan pokok",
      B: "Simpanan wajib",
      C: "Simpanan sukarela",
      D: "Pinjaman anggota",
      E: "Dana hibah",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "SHU dalam koperasi adalah singkatan dari...",
    "Keuangan Koperasi",
    "MUDAH",
    "SHU adalah Sisa Hasil Usaha.",
    "D",
    {
      A: "Saldo Harian Usaha",
      B: "Sistem Hasil Utama",
      C: "Sumber Hak Usaha",
      D: "Sisa Hasil Usaha",
      E: "Simpanan Hasil Umum",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Pembagian SHU yang paling sesuai prinsip koperasi adalah berdasarkan...",
    "Keuangan Koperasi",
    "SEDANG",
    "SHU dibagikan sesuai ketentuan koperasi, antara lain mempertimbangkan jasa usaha dan partisipasi anggota.",
    "E",
    {
      A: "Kedekatan anggota dengan pengurus",
      B: "Urutan kedatangan saat rapat",
      C: "Jumlah keluarga anggota",
      D: "Jabatan sosial anggota di desa",
      E: "Partisipasi dan jasa usaha anggota",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Fungsi utama pengawas koperasi adalah...",
    "Tata Kelola",
    "MUDAH",
    "Pengawas bertugas mengawasi kebijakan dan pengelolaan koperasi.",
    "C",
    {
      A: "Menjadi pemilik tunggal koperasi",
      B: "Menghapus rapat anggota",
      C: "Mengawasi pengelolaan koperasi",
      D: "Membagikan pinjaman tanpa aturan",
      E: "Menentukan harga pasar nasional",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Manajer koperasi desa paling tepat berperan sebagai...",
    "Peran Manajer",
    "SEDANG",
    "Manajer mengelola operasional harian koperasi sesuai mandat, target, dan kebijakan pengurus/rapat anggota.",
    "A",
    {
      A: "Pengelola operasional harian koperasi secara profesional",
      B: "Pemilik seluruh aset koperasi",
      C: "Pengganti rapat anggota",
      D: "Pemberi pinjaman pribadi kepada anggota",
      E: "Penghapus kewajiban laporan keuangan",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Prinsip satu anggota satu suara dalam koperasi menunjukkan nilai...",
    "Prinsip Koperasi",
    "SEDANG",
    "Satu anggota satu suara mencerminkan demokrasi koperasi, bukan besarnya modal semata.",
    "B",
    {
      A: "Monopoli modal",
      B: "Demokrasi anggota",
      C: "Kekuasaan manajer",
      D: "Dominasi pengurus",
      E: "Persaingan bebas",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Tindakan pertama saat menemukan selisih kas harian adalah...",
    "Pengendalian Internal",
    "SEDANG",
    "Selisih kas perlu direkonsiliasi dengan bukti transaksi sebelum disimpulkan penyebabnya.",
    "D",
    {
      A: "Menutup laporan tanpa catatan",
      B: "Mengganti uang dengan dana pribadi tanpa pemeriksaan",
      C: "Menyalahkan kasir langsung",
      D: "Merekonsiliasi kas dengan bukti transaksi",
      E: "Menghapus transaksi yang berbeda",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Laporan keuangan koperasi yang baik harus bersifat...",
    "Pelaporan Keuangan",
    "MUDAH",
    "Laporan keuangan harus akurat, transparan, dan dapat dipertanggungjawabkan.",
    "A",
    {
      A: "Akurat dan dapat dipertanggungjawabkan",
      B: "Rahasia dari semua anggota",
      C: "Berdasarkan perkiraan tanpa bukti",
      D: "Hanya dibuat saat ada pemeriksaan",
      E: "Tidak perlu arsip pendukung",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Jika usaha koperasi desa mengalami penurunan penjualan, langkah manajerial paling tepat adalah...",
    "Analisis Usaha",
    "SEDANG",
    "Penurunan penjualan perlu dianalisis berdasarkan data sebelum menentukan strategi perbaikan.",
    "E",
    {
      A: "Langsung menaikkan harga semua barang",
      B: "Menghentikan semua layanan koperasi",
      C: "Mengabaikan karena penjualan pasti pulih sendiri",
      D: "Menyalahkan anggota yang jarang belanja",
      E: "Menganalisis data penjualan dan kebutuhan anggota",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Dalam pengadaan barang koperasi, prinsip yang perlu dijaga adalah...",
    "Pengadaan",
    "SEDANG",
    "Pengadaan harus transparan, efisien, sesuai kebutuhan, dan dapat dipertanggungjawabkan.",
    "C",
    {
      A: "Memilih pemasok milik keluarga tanpa pembanding",
      B: "Membeli barang sebanyak mungkin tanpa perhitungan",
      C: "Transparan, efisien, dan sesuai kebutuhan anggota",
      D: "Menghindari pencatatan agar cepat",
      E: "Menentukan harga tanpa data pasar",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Pelayanan anggota yang baik ditunjukkan dengan...",
    "Pelayanan Anggota",
    "MUDAH",
    "Koperasi harus melayani anggota secara adil, ramah, dan sesuai prosedur.",
    "B",
    {
      A: "Mengutamakan anggota yang dekat dengan pengurus",
      B: "Melayani adil, ramah, dan sesuai prosedur",
      C: "Membatasi informasi bagi anggota baru",
      D: "Menerima keluhan hanya saat rapat tahunan",
      E: "Memberi layanan tanpa pencatatan",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Risiko utama jika transaksi koperasi tidak dicatat adalah...",
    "Administrasi Keuangan",
    "MUDAH",
    "Transaksi yang tidak dicatat menyebabkan laporan tidak akurat dan membuka risiko penyalahgunaan.",
    "D",
    {
      A: "Laporan menjadi lebih lengkap",
      B: "Pengawasan menjadi lebih mudah",
      C: "Anggota lebih percaya",
      D: "Laporan tidak akurat dan rawan penyalahgunaan",
      E: "SHU lebih mudah dihitung",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Aset koperasi sebaiknya dicatat dalam inventaris untuk...",
    "Aset Koperasi",
    "MUDAH",
    "Inventaris membantu pengendalian, pemeliharaan, dan pertanggungjawaban aset.",
    "A",
    {
      A: "Memudahkan pengendalian dan pertanggungjawaban aset",
      B: "Menghapus kebutuhan perawatan aset",
      C: "Menyembunyikan aset dari anggota",
      D: "Menghindari audit",
      E: "Menentukan SHU tanpa laporan",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Jika anggota mengajukan keluhan atas layanan koperasi, sikap manajer yang tepat adalah...",
    "Penanganan Keluhan",
    "SEDANG",
    "Keluhan perlu diterima, dicatat, diverifikasi, dan ditindaklanjuti sesuai prosedur.",
    "C",
    {
      A: "Menolak keluhan agar reputasi koperasi aman",
      B: "Meminta anggota tidak membahas masalah",
      C: "Mencatat, memverifikasi, dan menindaklanjuti keluhan",
      D: "Menyalahkan petugas loket",
      E: "Mengabaikan jika keluhan hanya lisan",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Rencana kerja koperasi paling baik disusun berdasarkan...",
    "Perencanaan",
    "SEDANG",
    "Rencana kerja sebaiknya berbasis kebutuhan anggota, data usaha, kemampuan sumber daya, dan keputusan organisasi.",
    "E",
    {
      A: "Keinginan satu orang manajer",
      B: "Tren tanpa data",
      C: "Instruksi informal pemasok",
      D: "Perkiraan tanpa evaluasi",
      E: "Kebutuhan anggota dan data usaha",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Indikator sederhana keberhasilan usaha koperasi adalah...",
    "Evaluasi Usaha",
    "SEDANG",
    "Keberhasilan usaha dapat dilihat dari manfaat bagi anggota, kinerja usaha, kepatuhan administrasi, dan keberlanjutan.",
    "D",
    {
      A: "Jumlah rapat yang dibatalkan",
      B: "Banyaknya transaksi tanpa bukti",
      C: "Besarnya pinjaman tanpa pengembalian",
      D: "Manfaat anggota dan kinerja usaha yang meningkat",
      E: "Minimnya laporan kepada anggota",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Jika terjadi konflik kepentingan dalam pemilihan pemasok, manajer sebaiknya...",
    "Etika Manajemen",
    "SULIT",
    "Konflik kepentingan harus diungkapkan dan keputusan dilakukan melalui mekanisme objektif.",
    "A",
    {
      A: "Mengungkapkan konflik kepentingan dan memakai mekanisme seleksi objektif",
      B: "Tetap memilih pemasok keluarga karena lebih dikenal",
      C: "Menghindari pencatatan agar tidak dipersoalkan",
      D: "Memutuskan sendiri tanpa pembanding",
      E: "Membatalkan semua pengadaan selamanya",
    }
  ),
  soal(
    "MANAJEMEN_KOPERASI",
    "Digitalisasi koperasi perlu disertai perlindungan data anggota karena...",
    "Digitalisasi Koperasi",
    "SEDANG",
    "Data anggota bersifat sensitif dan harus dijaga agar tidak disalahgunakan.",
    "C",
    {
      A: "Data anggota bebas dibagikan kepada siapa pun",
      B: "Digitalisasi membuat pengawasan tidak perlu",
      C: "Data anggota dapat disalahgunakan jika tidak dilindungi",
      D: "Laporan keuangan tidak lagi diperlukan",
      E: "Semua transaksi otomatis benar",
    }
  ),
];

function assertSeedData() {
  const counts = Object.fromEntries(
    Object.keys(KOMPONEN_TARGET).map((key) => [key, 0])
  ) as Record<KomponenKopdes, number>;

  for (const [index, item] of soalKopdes.entries()) {
    counts[item.komponen] += 1;

    if (Object.keys(item.opsi).length !== 5) {
      throw new Error(`Soal ke-${index + 1} tidak memiliki 5 opsi.`);
    }

    const opsi = opsiPg(item.jawaban, item.opsi);
    const correctCount = opsi.filter((o) => o.isBenar).length;
    if (correctCount !== 1) {
      throw new Error(
        `Soal ke-${index + 1} harus punya tepat 1 jawaban benar.`
      );
    }
  }

  for (const [komponen, target] of Object.entries(KOMPONEN_TARGET)) {
    const count = counts[komponen as KomponenKopdes];
    if (count !== target) {
      throw new Error(`${komponen} harus ${target} soal, ditemukan ${count}.`);
    }
  }
}

export async function seedKopdes(createdById: string) {
  console.log("Seeding Tryout Rekrutmen Kopdes/KDKMP 2026...");

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required.");
  }

  assertSeedData();

  const existing = await prisma.paketTryout.findUnique({
    where: { slug: PAKET_SLUG },
  });

  if (existing) {
    console.log("Paket Rekrutmen Kopdes/KDKMP sudah ada, skip.");
    return;
  }

  const paket = await prisma.$transaction(
    async (tx) => {
      const soalIds: string[] = [];

      for (const item of soalKopdes) {
        const created = await tx.soal.create({
          data: {
            konten: item.konten,
            topik: `${KOMPONEN_LABEL[item.komponen]} - ${item.topik}`,
            tingkatKesulitan: item.tingkatKesulitan as never,
            pembahasanTeks: item.pembahasanTeks,
            kategori: "CPNS_SKD",
            // Mapping internal agar tetap kompatibel dengan enum & scoring CPNS:
            // TIU = Tes Potensi Kognitif, TWK = Tes Manajemen Koperasi.
            subtes: item.komponen === "MANAJEMEN_KOPERASI" ? "TWK" : "TIU",
            tipe: "PILIHAN_GANDA",
            createdById,
            opsi: { create: opsiPg(item.jawaban, item.opsi) },
          },
        });

        soalIds.push(created.id);
      }

      return tx.paketTryout.create({
        data: {
          slug: PAKET_SLUG,
          judul: "Tryout Rekrutmen Kopdes/KDKMP 2026 #1",
          deskripsi:
            "Paket latihan khusus Rekrutmen Koperasi Desa/Kelurahan Merah Putih (KDKMP) 2026. Materi mengikuti pola seleksi kompetensi CAT: Tes Potensi Kognitif dan Tes Manajemen Koperasi.",
          kategori: "CPNS_SKD",
          subKategori: "KOPDES_KDKMP_2026",
          durasi: 50,
          totalSoal: soalIds.length,
          harga: 0,
          modelAkses: "GRATIS",
          status: "PUBLISHED",
          passingGrade: { twk: 0, tiu: 110, tkp: 0, total: 110 },
          konfigurasi: {
            blueprint: "REKRUTMEN_KOPDES_KDKMP_2026",
            kategoriInternal: "CPNS_SKD",
            subKategori: "KOPDES_KDKMP_2026",
            sistemTes: "CAT BKN",
            durasiMenit: 50,
            sumberReferensi: [
              "Pedoman Seleksi Pengadaan SDM KDKMP dan KNMP Tahun 2026",
              "Informasi publik PHTC Panselnas/BKN tentang seleksi kompetensi berbasis CAT",
            ],
            catatan:
              "Soal latihan orisinal; topik dan konfigurasi mengikuti pola rekrutmen Kopdes/KDKMP 2026, bukan salinan soal resmi.",
            skor: {
              nilaiBenar: 5,
              nilaiSalah: 0,
              nilaiKosong: 0,
            },
            passingGrade: {
              tesPotensiKognitif: 110,
            },
            mappingSubtesInternal: {
              TIU: "Tes Potensi Kognitif",
              TWK: "Tes Manajemen Koperasi",
            },
            komponen: [
              {
                kode: "KOGNITIF_BAHASA",
                label: "Bahasa",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "KOGNITIF_HITUNGAN",
                label: "Hitungan",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "KOGNITIF_PENGETAHUAN_UMUM",
                label: "Pengetahuan Umum",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "KOGNITIF_POLA_GAMBAR",
                label: "Pola Gambar",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "KOGNITIF_ABSTRAKSI_RUANG",
                label: "Abstraksi Ruang",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "KOGNITIF_MENENTUKAN_BENTUK",
                label: "Menentukan Bentuk",
                subtesInternal: "TIU",
                jumlahSoal: 10,
                nilaiBenar: 5,
                nilaiSalah: 0,
              },
              {
                kode: "MANAJEMEN_KOPERASI",
                label: "Tes Manajemen Koperasi",
                subtesInternal: "TWK",
                jumlahSoal: 20,
                nilaiBenar: 5,
                nilaiSalah: 0,
                prioritasRanking: 1,
              },
            ],
            ringkasanSkor: {
              totalSoal: 80,
              tesPotensiKognitif: {
                jumlahSoal: 60,
                skorMaksimal: 300,
                passingGrade: 110,
              },
              tesManajemenKoperasi: {
                jumlahSoal: 20,
                skorMaksimal: 100,
              },
              skorMaksimal: 400,
            },
            prioritasPemeringkatan: ["nilaiManajemenKoperasi", "IPK", "usia"],
          },
          createdById,
          soal: {
            create: soalIds.map((soalId, index) => ({
              soalId,
              urutan: index + 1,
            })),
          },
        },
      });
    },
    { maxWait: 10_000, timeout: 60_000 }
  );

  console.log("Paket dibuat:", paket.judul);
  console.log("Kategori internal:", paket.kategori);
  console.log("Subkategori:", paket.subKategori);
  console.log("Total soal:", paket.totalSoal);
  console.log("Selesai!");
}

async function run() {
  const instruktur = await prisma.user.findFirst({
    where: { role: "INSTRUKTUR" },
    select: { id: true },
  });

  if (!instruktur) {
    throw new Error("Instruktur not found. Jalankan seed utama dulu.");
  }

  await seedKopdes(instruktur.id);
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
