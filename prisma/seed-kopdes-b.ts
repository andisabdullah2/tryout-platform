import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Label = "A" | "B" | "C" | "D" | "E";
type TingkatKesulitan = "MUDAH" | "SEDANG" | "SULIT";
type SubtesInternal = "TWK" | "TIU" | "TKP";
type Komponen =
  | "TPK_BAHASA"
  | "TPK_HITUNGAN"
  | "TPK_PENGETAHUAN_UMUM"
  | "TPK_POLA_GAMBAR"
  | "TPK_ABSTRAKSI_RUANG"
  | "TPK_BENTUK"
  | "KDKMP_PRINSIP_KOPERASI"
  | "KDKMP_TATA_KELOLA"
  | "KDKMP_PENGELOLAAN_USAHA"
  | "KDKMP_PENGELOLAAN_KEUANGAN"
  | "KDKMP_PELAYANAN_ANGGOTA"
  | "KDKMP_KELEMBAGAAN"
  | "MENTAL_PANCASILA"
  | "MENTAL_UUD_1945"
  | "MENTAL_NKRI"
  | "MENTAL_BHINNEKA";

type OpsiSeed = {
  label: Label;
  konten: string;
  isBenar: boolean;
  nilaiTkp?: 5;
};

type SoalSeed = {
  komponen: Komponen;
  konten: string;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  pembahasanTeks: string;
  jawaban: Label;
  opsi: Record<Label, string>;
};

const LABELS: Label[] = ["A", "B", "C", "D", "E"];
const PAKET_SLUG = "tryout-rekrutmen-kopdes-kdkmp-2026-paket-b";

const KOMPONEN_LABEL: Record<Komponen, string> = {
  TPK_BAHASA: "Tes Potensi Kognitif - Bahasa",
  TPK_HITUNGAN: "Tes Potensi Kognitif - Hitungan",
  TPK_PENGETAHUAN_UMUM: "Tes Potensi Kognitif - Pengetahuan Umum",
  TPK_POLA_GAMBAR: "Tes Potensi Kognitif - Pola Gambar",
  TPK_ABSTRAKSI_RUANG: "Tes Potensi Kognitif - Abstraksi Ruang",
  TPK_BENTUK: "Tes Potensi Kognitif - Bentuk",
  KDKMP_PRINSIP_KOPERASI: "Tes Manajemen Koperasi - Prinsip Koperasi",
  KDKMP_TATA_KELOLA: "Tes Manajemen Koperasi - Tata Kelola",
  KDKMP_PENGELOLAAN_USAHA: "Tes Manajemen Koperasi - Pengelolaan Usaha",
  KDKMP_PENGELOLAAN_KEUANGAN:
    "Tes Manajemen Koperasi - Pengelolaan Keuangan",
  KDKMP_PELAYANAN_ANGGOTA:
    "Tes Manajemen Koperasi - Pelayanan Anggota",
  KDKMP_KELEMBAGAAN: "Tes Manajemen Koperasi - Kelembagaan",
  MENTAL_PANCASILA: "Tes Mental Ideologi - Pancasila",
  MENTAL_UUD_1945: "Tes Mental Ideologi - UUD 1945",
  MENTAL_NKRI: "Tes Mental Ideologi - NKRI",
  MENTAL_BHINNEKA: "Tes Mental Ideologi - Bhinneka Tunggal Ika",
};

const KOMPONEN_TARGET: Record<Komponen, number> = {
  TPK_BAHASA: 6,
  TPK_HITUNGAN: 6,
  TPK_PENGETAHUAN_UMUM: 6,
  TPK_POLA_GAMBAR: 6,
  TPK_ABSTRAKSI_RUANG: 6,
  TPK_BENTUK: 6,
  KDKMP_PRINSIP_KOPERASI: 4,
  KDKMP_TATA_KELOLA: 4,
  KDKMP_PENGELOLAAN_USAHA: 4,
  KDKMP_PENGELOLAAN_KEUANGAN: 4,
  KDKMP_PELAYANAN_ANGGOTA: 4,
  KDKMP_KELEMBAGAAN: 4,
  MENTAL_PANCASILA: 5,
  MENTAL_UUD_1945: 5,
  MENTAL_NKRI: 5,
  MENTAL_BHINNEKA: 5,
};

function subtesInternal(komponen: Komponen): SubtesInternal {
  if (komponen.startsWith("TPK_")) return "TIU";
  if (komponen.startsWith("KDKMP_")) return "TKP";
  return "TWK";
}

function opsiPg(
  jawaban: Label,
  opsi: Record<Label, string>,
  subtes: SubtesInternal
): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: label === jawaban,
    ...(subtes === "TKP" && label === jawaban ? { nilaiTkp: 5 as const } : {}),
  }));
}

function soal(
  komponen: Komponen,
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  jawaban: Label,
  opsi: Record<Label, string>
): SoalSeed {
  return {
    komponen,
    konten,
    topik,
    tingkatKesulitan,
    pembahasanTeks,
    jawaban,
    opsi,
  };
}

// Paket B mengikuti materi pada gambar:
// TPK: Bahasa, Hitungan, Pengetahuan Umum, Pola Gambar, Abstraksi Ruang, Bentuk.
// KDKMP: Prinsip Koperasi, Tata Kelola, Pengelolaan Usaha, Pengelolaan Keuangan,
// Pelayanan Anggota, Kelembagaan.
// Mental Ideologi: Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika.
const soalKopdesB: SoalSeed[] = [
  soal("TPK_BAHASA", "Sinonim kata kolaboratif adalah...", "Sinonim", "MUDAH", "Kolaboratif berarti bersifat kerja sama atau melibatkan beberapa pihak.", "B", { A: "Mandiri", B: "Kooperatif", C: "Kompetitif", D: "Tertutup", E: "Pasif" }),
  soal("TPK_BAHASA", "Antonim kata konsisten adalah...", "Antonim", "MUDAH", "Konsisten berarti tetap atau ajek. Lawan katanya adalah berubah-ubah.", "D", { A: "Tetap", B: "Stabil", C: "Ajeg", D: "Berubah-ubah", E: "Selaras" }),
  soal("TPK_BAHASA", "Kalimat efektif yang tepat adalah...", "Kalimat Efektif", "SEDANG", "Kalimat efektif tidak memakai kata berulang yang tidak perlu.", "A", { A: "Pengurus menyampaikan laporan kepada anggota.", B: "Para pengurus-pengurus menyampaikan laporan.", C: "Pengurus menyampaikan laporan kepada para seluruh anggota.", D: "Demi untuk keterbukaan, laporan disampaikan.", E: "Laporan disampaikan pada jam pukul sembilan." }),
  soal("TPK_BAHASA", "Ide pokok paragraf berikut adalah...\n\nKoperasi desa membutuhkan pencatatan usaha yang rapi. Pencatatan membantu pengurus memantau stok, arus kas, dan kebutuhan anggota secara lebih tepat.", "Ide Pokok", "MUDAH", "Kalimat pertama menjadi gagasan utama, sedangkan kalimat kedua menjelaskan manfaatnya.", "C", { A: "Stok barang selalu habis", B: "Anggota tidak membutuhkan laporan", C: "Koperasi desa membutuhkan pencatatan usaha yang rapi", D: "Arus kas tidak perlu dipantau", E: "Pengurus hanya mencatat kebutuhan anggota" }),
  soal("TPK_BAHASA", "Hubungan kata MANAJER : PERENCANAAN setara dengan...", "Analogi", "SEDANG", "Manajer melakukan perencanaan; kasir melakukan pencatatan transaksi.", "E", { A: "Gudang : barang", B: "Anggota : rapat", C: "Modal : usaha", D: "Pengurus : desa", E: "Kasir : pencatatan" }),
  soal("TPK_BAHASA", "Negasi dari pernyataan 'Semua anggota menerima informasi rapat' adalah...", "Logika Bahasa", "SEDANG", "Negasi dari semua menerima adalah ada yang tidak menerima.", "B", { A: "Semua anggota tidak menerima informasi rapat", B: "Ada anggota yang tidak menerima informasi rapat", C: "Tidak ada rapat anggota", D: "Sebagian anggota menerima informasi rapat", E: "Informasi rapat tidak dibuat" }),

  soal("TPK_HITUNGAN", "Jika 8x - 16 = 48, nilai x adalah...", "Aljabar", "MUDAH", "8x - 16 = 48, sehingga 8x = 64 dan x = 8.", "C", { A: "6", B: "7", C: "8", D: "9", E: "10" }),
  soal("TPK_HITUNGAN", "Omzet koperasi naik dari Rp 12.000.000 menjadi Rp 15.000.000. Persentase kenaikannya adalah...", "Persentase", "SEDANG", "Kenaikan = 3.000.000. Persentase = 3.000.000/12.000.000 x 100% = 25%.", "D", { A: "15%", B: "20%", C: "22,5%", D: "25%", E: "30%" }),
  soal("TPK_HITUNGAN", "Deret 5, 10, 20, 40, ... Bilangan berikutnya adalah...", "Deret Angka", "MUDAH", "Pola deret dikali 2, sehingga setelah 40 adalah 80.", "E", { A: "55", B: "60", C: "70", D: "75", E: "80" }),
  soal("TPK_HITUNGAN", "Rata-rata penjualan 4 hari adalah 75 unit. Jika hari kelima terjual 100 unit, rata-rata 5 hari adalah...", "Rata-rata", "SEDANG", "Total 4 hari = 4 x 75 = 300. Ditambah 100 menjadi 400. Rata-rata 5 hari = 80.", "B", { A: "78", B: "80", C: "82", D: "84", E: "85" }),
  soal("TPK_HITUNGAN", "Koperasi membeli 30 barang seharga Rp 45.000 dan menjualnya Rp 52.000 per barang. Total keuntungan adalah...", "Aritmetika Sosial", "MUDAH", "Untung per barang = 52.000 - 45.000 = 7.000. Total = 30 x 7.000 = 210.000.", "A", { A: "Rp 210.000", B: "Rp 220.000", C: "Rp 230.000", D: "Rp 240.000", E: "Rp 250.000" }),
  soal("TPK_HITUNGAN", "Perbandingan simpanan A dan B adalah 2 : 5. Jika total simpanan Rp 2.100.000, simpanan B adalah...", "Perbandingan", "SEDANG", "Total bagian 7. Simpanan B = 5/7 x 2.100.000 = 1.500.000.", "C", { A: "Rp 900.000", B: "Rp 1.200.000", C: "Rp 1.500.000", D: "Rp 1.700.000", E: "Rp 1.800.000" }),

  soal("TPK_PENGETAHUAN_UMUM", "Koperasi Indonesia berasaskan...", "Koperasi Umum", "MUDAH", "Koperasi Indonesia berasaskan kekeluargaan.", "B", { A: "Monopoli", B: "Kekeluargaan", C: "Persaingan bebas", D: "Komando tunggal", E: "Individualisme" }),
  soal("TPK_PENGETAHUAN_UMUM", "Pasal UUD 1945 yang memuat perekonomian disusun sebagai usaha bersama adalah...", "Konstitusi Ekonomi", "SEDANG", "Pasal 33 UUD 1945 memuat prinsip perekonomian nasional dan asas kekeluargaan.", "D", { A: "Pasal 27", B: "Pasal 28", C: "Pasal 31", D: "Pasal 33", E: "Pasal 36" }),
  soal("TPK_PENGETAHUAN_UMUM", "BUMDes adalah singkatan dari...", "Desa", "MUDAH", "BUMDes adalah Badan Usaha Milik Desa.", "A", { A: "Badan Usaha Milik Desa", B: "Badan Urusan Masyarakat Desa", C: "Biro Usaha Mandiri Desa", D: "Balai Usaha Modal Desa", E: "Badan Usaha Masyarakat Daerah" }),
  soal("TPK_PENGETAHUAN_UMUM", "Tujuan utama transparansi laporan koperasi adalah...", "Tata Kelola", "SEDANG", "Transparansi membangun kepercayaan dan memudahkan pengawasan anggota.", "E", { A: "Menyembunyikan arus kas", B: "Mengurangi rapat anggota", C: "Membatasi informasi anggota", D: "Menghindari evaluasi", E: "Membangun kepercayaan dan pengawasan" }),
  soal("TPK_PENGETAHUAN_UMUM", "Literasi keuangan berarti kemampuan untuk...", "Keuangan Dasar", "SEDANG", "Literasi keuangan adalah kemampuan memahami dan menggunakan informasi keuangan untuk mengambil keputusan.", "C", { A: "Menghindari semua transaksi", B: "Menghafal seluruh istilah akuntansi", C: "Memahami dan menggunakan informasi keuangan", D: "Memutuskan tanpa data", E: "Mengabaikan risiko usaha" }),
  soal("TPK_PENGETAHUAN_UMUM", "Dokumen yang paling tepat sebagai bukti transaksi pembelian adalah...", "Administrasi", "MUDAH", "Nota atau faktur pembelian menjadi bukti transaksi.", "B", { A: "Daftar hadir", B: "Nota pembelian", C: "Undangan rapat", D: "Kartu anggota", E: "Susunan pengurus" }),

  soal("TPK_POLA_GAMBAR", "Pola bentuk: lingkaran, persegi, segitiga, lingkaran, persegi, ... Bentuk berikutnya adalah...", "Pola Bentuk", "MUDAH", "Pola berulang tiga bentuk: lingkaran, persegi, segitiga.", "C", { A: "Lingkaran", B: "Persegi", C: "Segitiga", D: "Trapesium", E: "Bintang" }),
  soal("TPK_POLA_GAMBAR", "Pola arah: atas, kanan, bawah, kiri, atas, ... Arah berikutnya adalah...", "Pola Rotasi", "MUDAH", "Arah berputar searah jarum jam, sehingga setelah atas adalah kanan.", "B", { A: "Atas", B: "Kanan", C: "Bawah", D: "Kiri", E: "Diagonal" }),
  soal("TPK_POLA_GAMBAR", "Pola arsiran: kosong, penuh, kosong, penuh, ... Pola berikutnya adalah...", "Pola Arsiran", "MUDAH", "Pola bergantian kosong dan penuh.", "A", { A: "Kosong", B: "Penuh", C: "Setengah", D: "Seperempat", E: "Tiga perempat" }),
  soal("TPK_POLA_GAMBAR", "Pola titik: 2, 4, 8, 16, ... Jumlah titik berikutnya adalah...", "Pola Kuantitas", "SEDANG", "Jumlah titik selalu dikali 2, sehingga setelah 16 adalah 32.", "E", { A: "20", B: "22", C: "24", D: "28", E: "32" }),
  soal("TPK_POLA_GAMBAR", "Pola posisi: kiri, tengah, kanan, tengah, kiri, ... Posisi berikutnya adalah...", "Pola Posisi", "SEDANG", "Pola bergerak kiri-tengah-kanan-tengah-kiri, sehingga berikutnya tengah.", "C", { A: "Kiri", B: "Kanan", C: "Tengah", D: "Atas", E: "Bawah" }),
  soal("TPK_POLA_GAMBAR", "Pola garis: horizontal, vertikal, horizontal, vertikal, ... Garis berikutnya adalah...", "Pola Alternasi", "MUDAH", "Pola bergantian horizontal dan vertikal.", "A", { A: "Horizontal", B: "Vertikal", C: "Diagonal kanan", D: "Diagonal kiri", E: "Lengkung" }),

  soal("TPK_ABSTRAKSI_RUANG", "Sebuah kubus memiliki jumlah sisi sebanyak...", "Bangun Ruang", "MUDAH", "Kubus memiliki 6 sisi.", "D", { A: "3", B: "4", C: "5", D: "6", E: "8" }),
  soal("TPK_ABSTRAKSI_RUANG", "Jaring-jaring kubus tersusun dari berapa persegi?", "Jaring-jaring", "MUDAH", "Kubus memiliki 6 sisi, sehingga jaring-jaringnya terdiri dari 6 persegi.", "E", { A: "3", B: "4", C: "5", D: "7", E: "6" }),
  soal("TPK_ABSTRAKSI_RUANG", "Benda yang tampak lingkaran dari atas dan persegi panjang dari samping adalah...", "Proyeksi", "SEDANG", "Tabung terlihat lingkaran dari atas dan persegi panjang dari samping.", "B", { A: "Kubus", B: "Tabung", C: "Bola", D: "Limas", E: "Kerucut" }),
  soal("TPK_ABSTRAKSI_RUANG", "Jika panah ke atas diputar 90 derajat searah jarum jam, arahnya menjadi...", "Rotasi", "MUDAH", "Rotasi 90 derajat searah jarum jam dari atas menghasilkan arah kanan.", "C", { A: "Kiri", B: "Bawah", C: "Kanan", D: "Atas", E: "Tetap" }),
  soal("TPK_ABSTRAKSI_RUANG", "Persegi dilipat pada garis diagonalnya akan membentuk...", "Lipat Bentuk", "SEDANG", "Diagonal membagi persegi menjadi dua segitiga.", "A", { A: "Segitiga", B: "Lingkaran", C: "Trapesium", D: "Persegi panjang", E: "Jajar genjang" }),
  soal("TPK_ABSTRAKSI_RUANG", "Cermin vertikal terhadap huruf L kapital membuat kaki huruf yang semula ke kanan menjadi ke...", "Refleksi", "SULIT", "Refleksi vertikal membalik kiri-kanan.", "B", { A: "Kanan", B: "Kiri", C: "Atas", D: "Bawah", E: "Tidak berubah" }),

  soal("TPK_BENTUK", "Bentuk dengan 4 sisi sama panjang dan 4 sudut siku-siku adalah...", "Identifikasi Bentuk", "MUDAH", "Ciri tersebut adalah persegi.", "A", { A: "Persegi", B: "Trapesium", C: "Segitiga", D: "Lingkaran", E: "Jajar genjang" }),
  soal("TPK_BENTUK", "Bangun datar dengan tepat satu pasang sisi sejajar adalah...", "Identifikasi Bentuk", "SEDANG", "Trapesium memiliki tepat satu pasang sisi sejajar.", "C", { A: "Persegi", B: "Belah ketupat", C: "Trapesium", D: "Lingkaran", E: "Segitiga" }),
  soal("TPK_BENTUK", "Bentuk yang tidak memiliki sudut adalah...", "Identifikasi Bentuk", "MUDAH", "Lingkaran tidak memiliki sudut.", "D", { A: "Persegi", B: "Segitiga", C: "Trapesium", D: "Lingkaran", E: "Segi lima" }),
  soal("TPK_BENTUK", "Bangun datar bersisi lima disebut...", "Nama Bentuk", "MUDAH", "Bangun datar bersisi lima disebut segi lima.", "B", { A: "Segi empat", B: "Segi lima", C: "Segi enam", D: "Segi tujuh", E: "Segi delapan" }),
  soal("TPK_BENTUK", "Dua persegi sama besar disusun berdampingan secara horizontal membentuk...", "Komposisi Bentuk", "MUDAH", "Dua persegi berdampingan membentuk persegi panjang.", "E", { A: "Segitiga", B: "Lingkaran", C: "Trapesium", D: "Belah ketupat", E: "Persegi panjang" }),
  soal("TPK_BENTUK", "Bangun ruang yang semua sisinya berbentuk persegi sama besar adalah...", "Bangun Ruang", "MUDAH", "Kubus memiliki 6 sisi persegi sama besar.", "A", { A: "Kubus", B: "Balok", C: "Tabung", D: "Kerucut", E: "Limas" }),

  soal("KDKMP_PRINSIP_KOPERASI", "Prinsip keanggotaan koperasi yang benar adalah...", "Prinsip Koperasi", "MUDAH", "Keanggotaan koperasi bersifat sukarela dan terbuka.", "B", { A: "Wajib bagi semua warga", B: "Sukarela dan terbuka", C: "Hanya untuk perangkat desa", D: "Ditentukan pemasok", E: "Berdasarkan besarnya modal saja" }),
  soal("KDKMP_PRINSIP_KOPERASI", "Prinsip satu anggota satu suara menunjukkan nilai...", "Demokrasi Koperasi", "SEDANG", "Satu anggota satu suara mencerminkan pengelolaan koperasi yang demokratis.", "D", { A: "Dominasi modal", B: "Monopoli pengurus", C: "Kekuasaan manajer", D: "Demokrasi anggota", E: "Persaingan bebas" }),
  soal("KDKMP_PRINSIP_KOPERASI", "Pembagian SHU paling sesuai prinsip koperasi jika didasarkan pada...", "SHU", "SEDANG", "SHU dibagi sesuai ketentuan dan mempertimbangkan partisipasi/jasa anggota.", "C", { A: "Kedekatan dengan pengurus", B: "Jabatan sosial anggota", C: "Partisipasi dan jasa anggota", D: "Urutan kedatangan rapat", E: "Jumlah keluarga anggota" }),
  soal("KDKMP_PRINSIP_KOPERASI", "Pendidikan perkoperasian penting karena...", "Pendidikan Koperasi", "MUDAH", "Pendidikan koperasi meningkatkan pemahaman hak, kewajiban, dan partisipasi anggota.", "A", { A: "Meningkatkan pemahaman dan partisipasi anggota", B: "Menghapus rapat anggota", C: "Mengurangi hak anggota", D: "Membatasi informasi koperasi", E: "Meniadakan laporan keuangan" }),

  soal("KDKMP_TATA_KELOLA", "Kekuasaan tertinggi dalam koperasi berada pada...", "Kelembagaan", "MUDAH", "Rapat Anggota adalah pemegang kekuasaan tertinggi koperasi.", "E", { A: "Manajer", B: "Bendahara", C: "Pemasok", D: "Kepala gudang", E: "Rapat Anggota" }),
  soal("KDKMP_TATA_KELOLA", "Fungsi pengawas koperasi adalah...", "Pengawasan", "MUDAH", "Pengawas mengawasi pengelolaan dan kebijakan koperasi.", "C", { A: "Menjadi pemilik aset", B: "Menghapus laporan", C: "Mengawasi pengelolaan koperasi", D: "Menentukan semua harga pasar", E: "Menggantikan seluruh anggota" }),
  soal("KDKMP_TATA_KELOLA", "Jika terjadi konflik kepentingan dalam pemilihan pemasok, tindakan tepat adalah...", "Etika Tata Kelola", "SULIT", "Konflik kepentingan harus diungkapkan dan diselesaikan dengan mekanisme objektif.", "B", { A: "Tetap memilih pemasok keluarga", B: "Mengungkapkan konflik dan memakai seleksi objektif", C: "Menghapus bukti pembanding", D: "Memutuskan sendiri tanpa catatan", E: "Membatalkan pengadaan selamanya" }),
  soal("KDKMP_TATA_KELOLA", "Transparansi tata kelola koperasi diwujudkan dengan...", "Transparansi", "SEDANG", "Transparansi dilakukan melalui laporan, akses informasi, dan forum pertanggungjawaban yang jelas.", "D", { A: "Menyembunyikan laporan dari anggota", B: "Menghindari rapat", C: "Mencatat transaksi hanya saat diminta", D: "Menyampaikan laporan dan informasi secara terbuka", E: "Memberi akses hanya kepada pengurus" }),

  soal("KDKMP_PENGELOLAAN_USAHA", "Langkah awal saat penjualan unit usaha menurun adalah...", "Analisis Usaha", "SEDANG", "Penurunan usaha perlu dianalisis berdasarkan data sebelum menentukan strategi.", "A", { A: "Menganalisis data penjualan dan kebutuhan anggota", B: "Langsung menutup unit usaha", C: "Menaikkan harga semua barang", D: "Menyalahkan anggota", E: "Mengabaikan karena pasti pulih" }),
  soal("KDKMP_PENGELOLAAN_USAHA", "Pengadaan barang koperasi sebaiknya memperhatikan...", "Pengadaan", "SEDANG", "Pengadaan harus sesuai kebutuhan, efisien, transparan, dan dapat dipertanggungjawabkan.", "E", { A: "Pemasok paling dekat dengan pengurus", B: "Barang sebanyak mungkin tanpa rencana", C: "Harga tanpa pembanding", D: "Tidak perlu bukti transaksi", E: "Kebutuhan anggota, efisiensi, dan transparansi" }),
  soal("KDKMP_PENGELOLAAN_USAHA", "Indikator keberhasilan unit usaha koperasi adalah...", "Evaluasi Usaha", "SEDANG", "Usaha koperasi berhasil jika memberi manfaat anggota dan kinerja usaha meningkat.", "C", { A: "Transaksi tanpa bukti", B: "Keluhan tidak dicatat", C: "Manfaat anggota dan kinerja usaha meningkat", D: "Harga selalu paling mahal", E: "Rapat anggota jarang dilakukan" }),
  soal("KDKMP_PENGELOLAAN_USAHA", "Manajer koperasi perlu membuat rencana usaha agar...", "Perencanaan Usaha", "MUDAH", "Rencana usaha membantu menentukan target, kebutuhan modal, dan langkah operasional.", "B", { A: "Semua keputusan bisa tanpa data", B: "Target dan langkah operasional jelas", C: "Laporan keuangan tidak diperlukan", D: "Anggota tidak perlu dilibatkan", E: "Risiko usaha diabaikan" }),

  soal("KDKMP_PENGELOLAAN_KEUANGAN", "Simpanan yang dibayar satu kali saat menjadi anggota disebut...", "Permodalan", "MUDAH", "Simpanan pokok dibayar satu kali saat masuk menjadi anggota.", "A", { A: "Simpanan pokok", B: "Simpanan wajib", C: "Simpanan sukarela", D: "Pinjaman anggota", E: "Dana cadangan" }),
  soal("KDKMP_PENGELOLAAN_KEUANGAN", "Risiko utama transaksi tidak dicatat adalah...", "Administrasi Keuangan", "MUDAH", "Transaksi yang tidak dicatat membuat laporan tidak akurat dan rawan penyalahgunaan.", "D", { A: "Laporan makin akurat", B: "Pengawasan makin mudah", C: "SHU otomatis naik", D: "Laporan tidak akurat dan rawan penyalahgunaan", E: "Anggota tidak perlu rapat" }),
  soal("KDKMP_PENGELOLAAN_KEUANGAN", "Saat menemukan selisih kas harian, tindakan pertama adalah...", "Pengendalian Kas", "SEDANG", "Selisih kas harus direkonsiliasi dengan bukti transaksi.", "B", { A: "Langsung menyalahkan kasir", B: "Merekonsiliasi kas dengan bukti transaksi", C: "Menghapus transaksi", D: "Menutup laporan tanpa catatan", E: "Mengganti dengan dana pribadi tanpa pemeriksaan" }),
  soal("KDKMP_PENGELOLAAN_KEUANGAN", "Laporan keuangan koperasi yang baik harus...", "Pelaporan Keuangan", "MUDAH", "Laporan keuangan harus akurat, transparan, dan dapat dipertanggungjawabkan.", "E", { A: "Rahasia dari semua anggota", B: "Tanpa bukti transaksi", C: "Dibuat hanya saat diminta", D: "Berdasarkan perkiraan", E: "Akurat dan dapat dipertanggungjawabkan" }),

  soal("KDKMP_PELAYANAN_ANGGOTA", "Pelayanan anggota yang baik ditunjukkan dengan...", "Pelayanan", "MUDAH", "Koperasi harus melayani anggota secara adil, ramah, dan sesuai prosedur.", "C", { A: "Mengutamakan kerabat pengurus", B: "Membatasi informasi anggota baru", C: "Melayani adil, ramah, dan sesuai prosedur", D: "Menerima keluhan hanya setahun sekali", E: "Memberi layanan tanpa pencatatan" }),
  soal("KDKMP_PELAYANAN_ANGGOTA", "Jika anggota mengajukan keluhan, manajer sebaiknya...", "Keluhan Anggota", "SEDANG", "Keluhan perlu dicatat, diverifikasi, dan ditindaklanjuti.", "A", { A: "Mencatat, memverifikasi, dan menindaklanjuti", B: "Menolak agar citra koperasi aman", C: "Meminta anggota diam", D: "Menyalahkan petugas tanpa cek", E: "Mengabaikan keluhan lisan" }),
  soal("KDKMP_PELAYANAN_ANGGOTA", "Informasi produk koperasi kepada anggota sebaiknya disampaikan secara...", "Komunikasi Layanan", "MUDAH", "Informasi layanan harus jelas, benar, dan mudah dipahami anggota.", "D", { A: "Rahasia", B: "Berubah-ubah", C: "Hanya kepada pengurus", D: "Jelas dan mudah dipahami", E: "Tanpa bukti" }),
  soal("KDKMP_PELAYANAN_ANGGOTA", "Pelayanan koperasi yang inklusif berarti...", "Inklusi Layanan", "SEDANG", "Inklusif berarti layanan dapat diakses secara adil oleh anggota dengan berbagai kondisi.", "B", { A: "Hanya melayani anggota lama", B: "Memberi akses adil bagi berbagai anggota", C: "Menolak anggota yang banyak bertanya", D: "Membatasi layanan berdasarkan kelompok", E: "Menghapus prosedur layanan" }),

  soal("KDKMP_KELEMBAGAAN", "Dokumen dasar yang memuat aturan pokok organisasi koperasi adalah...", "AD/ART", "MUDAH", "Anggaran Dasar/Anggaran Rumah Tangga memuat aturan pokok organisasi koperasi.", "C", { A: "Nota pembelian", B: "Daftar harga", C: "AD/ART", D: "Buku kas harian", E: "Kartu stok" }),
  soal("KDKMP_KELEMBAGAAN", "Rapat Anggota Tahunan biasanya membahas...", "RAT", "SEDANG", "RAT membahas laporan pertanggungjawaban, rencana kerja, dan keputusan penting koperasi.", "E", { A: "Harga nasional semua komoditas", B: "Urusan pribadi pengurus", C: "Penghapusan semua simpanan", D: "Penunjukan pemasok tanpa laporan", E: "Pertanggungjawaban dan rencana kerja" }),
  soal("KDKMP_KELEMBAGAAN", "Aset koperasi perlu dicatat dalam inventaris untuk...", "Inventaris", "MUDAH", "Inventaris membantu pengendalian dan pertanggungjawaban aset.", "A", { A: "Memudahkan pengendalian aset", B: "Menghindari pengawasan", C: "Menyembunyikan aset", D: "Menghapus laporan", E: "Mengganti rapat anggota" }),
  soal("KDKMP_KELEMBAGAAN", "Kelembagaan koperasi yang sehat ditandai dengan...", "Kelembagaan", "SEDANG", "Kelembagaan sehat memiliki peran jelas, administrasi tertib, dan pertanggungjawaban berjalan.", "D", { A: "Peran pengurus tidak jelas", B: "Rapat tidak pernah dilakukan", C: "Dokumen tidak diarsipkan", D: "Peran jelas dan pertanggungjawaban berjalan", E: "Keputusan hanya oleh satu orang" }),

  soal("MENTAL_PANCASILA", "Gotong royong dalam koperasi paling sesuai dengan nilai Pancasila terutama sila...", "Pancasila", "MUDAH", "Gotong royong erat dengan semangat persatuan dan keadilan sosial, dalam konteks koperasi paling tampak pada keadilan sosial.", "E", { A: "Pertama", B: "Kedua", C: "Ketiga", D: "Keempat", E: "Kelima" }),
  soal("MENTAL_PANCASILA", "Musyawarah anggota koperasi mencerminkan sila...", "Pancasila", "MUDAH", "Musyawarah mufakat mencerminkan sila keempat Pancasila.", "D", { A: "Pertama", B: "Kedua", C: "Ketiga", D: "Keempat", E: "Kelima" }),
  soal("MENTAL_PANCASILA", "Sikap adil dalam membagikan pelayanan koperasi mencerminkan sila...", "Pancasila", "MUDAH", "Keadilan dalam pelayanan berkaitan dengan sila kelima.", "E", { A: "Pertama", B: "Kedua", C: "Ketiga", D: "Keempat", E: "Kelima" }),
  soal("MENTAL_PANCASILA", "Menolak perlakuan istimewa bagi keluarga pengurus mencerminkan nilai...", "Integritas Pancasila", "SEDANG", "Sikap tersebut mencerminkan keadilan, integritas, dan antikorupsi.", "B", { A: "Nepotisme", B: "Keadilan dan integritas", C: "Eksklusivitas", D: "Dominasi pengurus", E: "Kepentingan pribadi" }),
  soal("MENTAL_PANCASILA", "Menghormati anggota yang berbeda keyakinan saat rapat koperasi merupakan penerapan sila...", "Pancasila", "MUDAH", "Menghormati keyakinan mencerminkan sila pertama.", "A", { A: "Pertama", B: "Kedua", C: "Ketiga", D: "Keempat", E: "Kelima" }),

  soal("MENTAL_UUD_1945", "Pasal UUD 1945 yang memuat asas kekeluargaan dalam perekonomian adalah...", "UUD 1945", "MUDAH", "Pasal 33 UUD 1945 memuat perekonomian sebagai usaha bersama berdasarkan asas kekeluargaan.", "C", { A: "Pasal 27", B: "Pasal 31", C: "Pasal 33", D: "Pasal 34", E: "Pasal 36" }),
  soal("MENTAL_UUD_1945", "Pembukaan UUD 1945 alinea keempat memuat...", "UUD 1945", "SEDANG", "Alinea keempat memuat tujuan negara dan dasar negara.", "A", { A: "Tujuan negara", B: "Daftar kementerian", C: "Nama kepala daerah", D: "Rincian APBD", E: "Teknis koperasi desa" }),
  soal("MENTAL_UUD_1945", "Negara Indonesia adalah negara hukum diatur dalam Pasal...", "UUD 1945", "MUDAH", "Pasal 1 ayat (3) menyatakan Indonesia adalah negara hukum.", "D", { A: "1 ayat (1)", B: "1 ayat (2)", C: "2 ayat (1)", D: "1 ayat (3)", E: "3 ayat (1)" }),
  soal("MENTAL_UUD_1945", "Hak warga negara untuk mendapat pendidikan tercantum dalam Pasal...", "UUD 1945", "MUDAH", "Pasal 31 ayat (1) mengatur hak warga negara mendapat pendidikan.", "B", { A: "30 ayat (1)", B: "31 ayat (1)", C: "32 ayat (1)", D: "33 ayat (3)", E: "34 ayat (1)" }),
  soal("MENTAL_UUD_1945", "Bumi, air, dan kekayaan alam dikuasai negara untuk kemakmuran rakyat tercantum dalam Pasal...", "UUD 1945", "SEDANG", "Ketentuan tersebut terdapat pada Pasal 33 ayat (3).", "E", { A: "27 ayat (2)", B: "28A", C: "31 ayat (1)", D: "33 ayat (1)", E: "33 ayat (3)" }),

  soal("MENTAL_NKRI", "Bentuk negara Indonesia adalah...", "NKRI", "MUDAH", "Indonesia adalah negara kesatuan yang berbentuk republik.", "A", { A: "Negara kesatuan berbentuk republik", B: "Negara federal", C: "Konfederasi desa", D: "Kerajaan konstitusional", E: "Persekutuan daerah mandiri" }),
  soal("MENTAL_NKRI", "Sikap yang memperkuat NKRI dalam pengelolaan koperasi desa adalah...", "NKRI", "SEDANG", "Koperasi desa harus mengutamakan kepentingan bersama dan tetap menjaga persatuan.", "C", { A: "Mendahulukan suku tertentu", B: "Menolak warga pendatang", C: "Melayani warga secara adil untuk kepentingan bersama", D: "Membatasi informasi pada kelompok sendiri", E: "Memisahkan aturan desa dari hukum nasional" }),
  soal("MENTAL_NKRI", "Otonomi daerah dalam NKRI bertujuan untuk...", "NKRI", "SEDANG", "Otonomi daerah mendekatkan pelayanan dan pembangunan kepada masyarakat dalam kerangka NKRI.", "D", { A: "Membentuk negara bagian", B: "Menghapus pemerintah pusat", C: "Mengganti ideologi negara", D: "Mendekatkan pelayanan kepada masyarakat", E: "Memisahkan daerah dari hukum nasional" }),
  soal("MENTAL_NKRI", "Menjaga fasilitas koperasi desa sebagai aset bersama merupakan bentuk...", "NKRI", "MUDAH", "Menjaga fasilitas umum/bersama menunjukkan tanggung jawab warga dan cinta tanah air di level lokal.", "B", { A: "Kepentingan pribadi", B: "Tanggung jawab terhadap kepentingan bersama", C: "Persaingan bebas", D: "Dominasi pengurus", E: "Penghindaran kewajiban" }),
  soal("MENTAL_NKRI", "Bentuk NKRI tidak dapat diubah berdasarkan UUD 1945 Pasal 37 ayat...", "NKRI", "SULIT", "Pasal 37 ayat (5) menegaskan bentuk NKRI tidak dapat dilakukan perubahan.", "E", { A: "(1)", B: "(2)", C: "(3)", D: "(4)", E: "(5)" }),

  soal("MENTAL_BHINNEKA", "Makna Bhinneka Tunggal Ika adalah...", "Bhinneka Tunggal Ika", "MUDAH", "Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu.", "A", { A: "Berbeda-beda tetapi tetap satu", B: "Semua perbedaan harus dihapus", C: "Setiap kelompok hidup terpisah", D: "Satu budaya menggantikan semua budaya", E: "Perbedaan selalu menjadi konflik" }),
  soal("MENTAL_BHINNEKA", "Sikap yang sesuai Bhinneka Tunggal Ika dalam koperasi desa adalah...", "Bhinneka Tunggal Ika", "MUDAH", "Bhinneka menuntut penghargaan terhadap perbedaan dalam kerja sama.", "D", { A: "Memilih anggota berdasarkan suku", B: "Mengabaikan pendapat minoritas", C: "Membatasi layanan pada kelompok sendiri", D: "Bekerja sama tanpa membedakan latar belakang", E: "Menolak budaya berbeda" }),
  soal("MENTAL_BHINNEKA", "Semboyan Bhinneka Tunggal Ika berasal dari kitab...", "Bhinneka Tunggal Ika", "MUDAH", "Semboyan Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karya Mpu Tantular.", "C", { A: "Pararaton", B: "Negarakertagama", C: "Sutasoma", D: "Arjunawiwaha", E: "Ramayana" }),
  soal("MENTAL_BHINNEKA", "Jika terjadi perbedaan pendapat antaranggota koperasi, sikap yang tepat adalah...", "Bhinneka Tunggal Ika", "SEDANG", "Perbedaan perlu dikelola dengan musyawarah dan penghargaan terhadap pendapat.", "B", { A: "Memaksa pendapat mayoritas tanpa diskusi", B: "Bermusyawarah dan menghormati perbedaan", C: "Mengeluarkan anggota yang berbeda", D: "Menyebarkan konflik ke luar rapat", E: "Mengabaikan keputusan bersama" }),
  soal("MENTAL_BHINNEKA", "Keberagaman anggota koperasi sebaiknya dipandang sebagai...", "Bhinneka Tunggal Ika", "SEDANG", "Keberagaman adalah potensi untuk memperkuat kerja sama dan memperluas manfaat koperasi.", "E", { A: "Hambatan yang harus dihapus", B: "Alasan membatasi layanan", C: "Penyebab utama kegagalan", D: "Dasar memilih kelompok tertentu", E: "Potensi memperkuat kerja sama" }),
];

function assertSeedData() {
  const counts = Object.fromEntries(
    Object.keys(KOMPONEN_TARGET).map((key) => [key, 0])
  ) as Record<Komponen, number>;

  for (const [index, item] of soalKopdesB.entries()) {
    counts[item.komponen] += 1;

    if (Object.keys(item.opsi).length !== 5) {
      throw new Error(`Soal ke-${index + 1} tidak memiliki 5 opsi.`);
    }

    const opsi = opsiPg(item.jawaban, item.opsi, subtesInternal(item.komponen));
    const correctCount = opsi.filter((o) => o.isBenar).length;
    if (correctCount !== 1) {
      throw new Error(`Soal ke-${index + 1} harus punya tepat 1 jawaban benar.`);
    }
  }

  for (const [komponen, target] of Object.entries(KOMPONEN_TARGET)) {
    const count = counts[komponen as Komponen];
    if (count !== target) {
      throw new Error(`${komponen} harus ${target} soal, ditemukan ${count}.`);
    }
  }
}

export async function seedKopdesB(createdById: string) {
  console.log("Seeding Tryout Rekrutmen Kopdes/KDKMP 2026 Paket B...");

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required.");
  }

  assertSeedData();

  const existing = await prisma.paketTryout.findUnique({
    where: { slug: PAKET_SLUG },
  });

  if (existing) {
    console.log("Paket Kopdes B sudah ada, skip.");
    return;
  }

  const paket = await prisma.$transaction(
    async (tx) => {
      const soalIds: string[] = [];

      for (const item of soalKopdesB) {
        const subtes = subtesInternal(item.komponen);
        const created = await tx.soal.create({
          data: {
            konten: item.konten,
            topik: `${KOMPONEN_LABEL[item.komponen]} - ${item.topik}`,
            tingkatKesulitan: item.tingkatKesulitan as never,
            pembahasanTeks: item.pembahasanTeks,
            kategori: "CPNS_SKD",
            subtes,
            tipe: "PILIHAN_GANDA",
            createdById,
            opsi: { create: opsiPg(item.jawaban, item.opsi, subtes) },
          },
        });

        soalIds.push(created.id);
      }

      return tx.paketTryout.create({
        data: {
          slug: PAKET_SLUG,
          judul: "Tryout Rekrutmen Kopdes/KDKMP 2026 - Paket B",
          deskripsi:
            "Paket latihan Rekrutmen Kopdes/KDKMP Paket B sesuai materi pada gambar: Tes Potensi Kognitif, Tes Manajemen Koperasi, dan Tes Mental Ideologi.",
          kategori: "CPNS_SKD",
          subKategori: "KOPDES_KDKMP_2026",
          durasi: 75,
          totalSoal: soalIds.length,
          harga: 0,
          modelAkses: "GRATIS",
          status: "PUBLISHED",
          passingGrade: { twk: 0, tiu: 110, tkp: 0, total: 110 },
          konfigurasi: {
            blueprint: "REKRUTMEN_KOPDES_KDKMP_2026_PAKET_B",
            kategoriInternal: "CPNS_SKD",
            subKategori: "KOPDES_KDKMP_2026",
            acuanMateriGambar: {
              tesPotensiKognitif: [
                "Bahasa",
                "Hitungan",
                "Pengetahuan Umum",
                "Pola Gambar",
                "Abstraksi Ruang",
                "Bentuk",
              ],
              tesManajemenKoperasiKDKMP: [
                "Prinsip Koperasi",
                "Tata Kelola",
                "Pengelolaan Usaha",
                "Pengelolaan Keuangan",
                "Pelayanan Anggota",
                "Kelembagaan",
              ],
              tesMentalIdeologi: [
                "Pancasila",
                "UUD 1945",
                "NKRI",
                "Bhinneka Tunggal Ika",
              ],
              tesManajemenKelautanPerikananKNMP: {
                masukPaket: false,
                alasan:
                  "KNMP pada gambar untuk jalur kelautan/perikanan, bukan paket Kopdes/KDKMP.",
              },
            },
            catatan:
              "Soal latihan orisinal; materi mengikuti gambar, bukan salinan soal resmi.",
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
              TKP: "Tes Manajemen Koperasi (KDKMP)",
              TWK: "Tes Mental Ideologi",
            },
            komponen: Object.entries(KOMPONEN_TARGET).map(
              ([kode, jumlahSoal]) => ({
                kode,
                label: KOMPONEN_LABEL[kode as Komponen],
                subtesInternal: subtesInternal(kode as Komponen),
                jumlahSoal,
                nilaiBenar: 5,
                nilaiSalah: 0,
              })
            ),
            ringkasanSkor: {
              totalSoal: 80,
              tesPotensiKognitif: {
                jumlahSoal: 36,
                skorMaksimal: 180,
                passingGrade: 110,
              },
              tesManajemenKoperasiKDKMP: {
                jumlahSoal: 24,
                skorMaksimal: 120,
              },
              tesMentalIdeologi: {
                jumlahSoal: 20,
                skorMaksimal: 100,
              },
              skorMaksimal: 400,
            },
            prioritasPemeringkatan: [
              "nilaiManajemenKoperasi",
              "nilaiMentalIdeologi",
              "nilaiPotensiKognitif",
              "IPK",
              "usia",
            ],
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

  await seedKopdesB(instruktur.id);
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
