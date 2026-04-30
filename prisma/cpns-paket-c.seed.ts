import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Label = "A" | "B" | "C" | "D" | "E";
type TingkatKesulitan = "MUDAH" | "SEDANG" | "SULIT";
type Subtes = "TWK" | "TIU" | "TKP";
type NilaiTkp = 1 | 2 | 3 | 4 | 5;

type OpsiSeed = {
  label: Label;
  konten: string;
  isBenar: boolean;
  nilaiTkp?: NilaiTkp;
};

type SoalSeed = {
  konten: string;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  pembahasanTeks: string;
  subtes: Subtes;
  opsi: OpsiSeed[];
};

const LABELS: Label[] = ["A", "B", "C", "D", "E"];
const PAKET_SLUG = "tryout-skd-cpns-premium-paket-c";
const BANK_SOAL_REFERENCE =
  "Bank soal CPNS SKD tahun lalu - acuan pola topik, bukan salinan soal resmi.";

function makePg(jawaban: Label, opsi: Record<Label, string>): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: label === jawaban,
  }));
}

function makeTkp(
  scores: Record<Label, NilaiTkp>,
  opsi: Record<Label, string>
): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: scores[label] === 5,
    nilaiTkp: scores[label],
  }));
}

function pg(
  subtes: Exclude<Subtes, "TKP">,
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  jawaban: Label,
  opsi: Record<Label, string>
): SoalSeed {
  return {
    konten,
    topik,
    tingkatKesulitan,
    pembahasanTeks,
    subtes,
    opsi: makePg(jawaban, opsi),
  };
}

function tkp(
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  scores: Record<Label, NilaiTkp>,
  opsi: Record<Label, string>
): SoalSeed {
  return {
    konten,
    topik,
    tingkatKesulitan,
    pembahasanTeks,
    subtes: "TKP",
    opsi: makeTkp(scores, opsi),
  };
}

// Paket C disusun sebagai variasi orisinal dengan pola dari bank soal CPNS SKD tahun lalu:
// TWK 30, TIU 35, TKP 45; bukan salinan soal ujian resmi.
const soalCpnsSkdPaketC: SoalSeed[] = [
  pg(
    "TWK",
    "Pancasila sebagai sumber dari segala sumber hukum negara bermakna...",
    "Pancasila",
    "SEDANG",
    "Pancasila menjadi dasar nilai dan rujukan utama dalam pembentukan seluruh peraturan perundang-undangan di Indonesia.",
    "B",
    {
      A: "Pancasila hanya berlaku untuk lembaga eksekutif",
      B: "Semua peraturan perundang-undangan harus sesuai dengan nilai Pancasila",
      C: "Pancasila dapat diganti melalui peraturan pemerintah",
      D: "Pancasila hanya menjadi pedoman upacara kenegaraan",
      E: "Pancasila berada di bawah undang-undang",
    }
  ),
  pg(
    "TWK",
    "Perilaku yang paling mencerminkan sila ketiga Pancasila di lingkungan kerja adalah...",
    "Pancasila",
    "MUDAH",
    "Sila Persatuan Indonesia menekankan kepentingan bangsa dan kebersamaan di atas kepentingan kelompok sempit.",
    "D",
    {
      A: "Memilih rekan satu suku untuk semua proyek",
      B: "Menghindari kerja sama dengan unit lain",
      C: "Menonjolkan kepentingan kelompok sendiri",
      D: "Bekerja sama lintas latar belakang untuk tujuan organisasi",
      E: "Membatasi informasi hanya untuk tim sendiri",
    }
  ),
  pg(
    "TWK",
    "Makna hikmat kebijaksanaan dalam sila keempat Pancasila adalah...",
    "Pancasila",
    "SEDANG",
    "Hikmat kebijaksanaan berarti keputusan diambil secara arif, rasional, dan mengutamakan kepentingan bersama.",
    "A",
    {
      A: "Mengambil keputusan dengan pertimbangan bijak untuk kepentingan bersama",
      B: "Mengikuti pendapat pihak yang paling kuat",
      C: "Menunda keputusan sampai semua pihak puas",
      D: "Mengutamakan suara kelompok mayoritas tanpa musyawarah",
      E: "Memberikan hak veto kepada pemimpin rapat",
    }
  ),
  pg(
    "TWK",
    "Keputusan penting Sidang PPKI tanggal 18 Agustus 1945 adalah...",
    "Sejarah Nasional",
    "MUDAH",
    "Sidang PPKI 18 Agustus 1945 mengesahkan UUD 1945 serta memilih Presiden dan Wakil Presiden.",
    "C",
    {
      A: "Membentuk BPUPKI",
      B: "Menyusun Piagam Jakarta",
      C: "Mengesahkan UUD 1945 dan memilih Presiden serta Wakil Presiden",
      D: "Mencetuskan Sumpah Pemuda",
      E: "Mengeluarkan Dekrit Presiden",
    }
  ),
  pg(
    "TWK",
    "BPUPKI dibentuk dengan tujuan utama...",
    "Sejarah Nasional",
    "SEDANG",
    "BPUPKI dibentuk untuk menyelidiki dan mempersiapkan hal-hal penting terkait kemerdekaan Indonesia.",
    "E",
    {
      A: "Mengatur pemerintahan daerah setelah kemerdekaan",
      B: "Memilih Presiden dan Wakil Presiden",
      C: "Menjalankan pemerintahan sementara",
      D: "Menyusun kabinet pertama Republik Indonesia",
      E: "Menyelidiki usaha-usaha persiapan kemerdekaan Indonesia",
    }
  ),
  pg(
    "TWK",
    "Pembukaan UUD 1945 alinea pertama menegaskan bahwa kemerdekaan adalah...",
    "UUD 1945",
    "MUDAH",
    "Alinea pertama Pembukaan UUD 1945 menyatakan bahwa kemerdekaan ialah hak segala bangsa.",
    "A",
    {
      A: "Hak segala bangsa",
      B: "Hadiah dari bangsa lain",
      C: "Kewajiban pemerintah pusat",
      D: "Hak kelompok mayoritas",
      E: "Urusan internal pemerintah",
    }
  ),
  pg(
    "TWK",
    "Tujuan negara melindungi segenap bangsa Indonesia tercantum dalam...",
    "UUD 1945",
    "MUDAH",
    "Tujuan negara Indonesia tercantum dalam Pembukaan UUD 1945 alinea keempat.",
    "D",
    {
      A: "Pasal 1 ayat (1) UUD 1945",
      B: "Aturan Peralihan UUD 1945",
      C: "Pembukaan UUD 1945 alinea kedua",
      D: "Pembukaan UUD 1945 alinea keempat",
      E: "Penjelasan UUD 1945",
    }
  ),
  pg(
    "TWK",
    "Kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD merupakan bunyi UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 1 ayat (2) UUD 1945 menegaskan kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD.",
    "B",
    {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (1)",
    }
  ),
  pg(
    "TWK",
    "Hak dan kewajiban warga negara dalam upaya pembelaan negara diatur dalam UUD 1945 Pasal...",
    "Bela Negara",
    "SEDANG",
    "Pasal 27 ayat (3) UUD 1945 mengatur bahwa setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara.",
    "C",
    {
      A: "27 ayat (1)",
      B: "27 ayat (2)",
      C: "27 ayat (3)",
      D: "28A",
      E: "29 ayat (2)",
    }
  ),
  pg(
    "TWK",
    "Kebebasan memeluk agama dan beribadat menurut agama dan kepercayaannya dijamin dalam UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 29 ayat (2) UUD 1945 menjamin kemerdekaan tiap penduduk untuk memeluk agama dan beribadat.",
    "E",
    {
      A: "27 ayat (1)",
      B: "28C ayat (1)",
      C: "30 ayat (1)",
      D: "31 ayat (1)",
      E: "29 ayat (2)",
    }
  ),
  pg(
    "TWK",
    "Tiap-tiap warga negara berhak dan wajib ikut serta dalam usaha pertahanan dan keamanan negara diatur dalam...",
    "Bela Negara",
    "MUDAH",
    "Pasal 30 ayat (1) UUD 1945 memuat hak dan kewajiban warga negara dalam usaha pertahanan dan keamanan negara.",
    "A",
    {
      A: "Pasal 30 ayat (1)",
      B: "Pasal 31 ayat (1)",
      C: "Pasal 33 ayat (3)",
      D: "Pasal 34 ayat (1)",
      E: "Pasal 36A",
    }
  ),
  pg(
    "TWK",
    "Hak setiap warga negara untuk mendapat pendidikan tercantum dalam UUD 1945 Pasal...",
    "UUD 1945",
    "MUDAH",
    "Pasal 31 ayat (1) UUD 1945 menyatakan bahwa setiap warga negara berhak mendapat pendidikan.",
    "B",
    {
      A: "30 ayat (1)",
      B: "31 ayat (1)",
      C: "32 ayat (1)",
      D: "33 ayat (1)",
      E: "34 ayat (1)",
    }
  ),
  pg(
    "TWK",
    "Bumi, air, dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara untuk sebesar-besarnya kemakmuran rakyat adalah ketentuan UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Ketentuan tersebut terdapat dalam Pasal 33 ayat (3) UUD 1945.",
    "C",
    {
      A: "27 ayat (2)",
      B: "31 ayat (1)",
      C: "33 ayat (3)",
      D: "34 ayat (1)",
      E: "36",
    }
  ),
  pg(
    "TWK",
    "Lambang negara Indonesia adalah Garuda Pancasila. Ketentuan ini terdapat dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "SEDANG",
    "Pasal 36A UUD 1945 menyatakan lambang negara ialah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.",
    "D",
    {
      A: "35",
      B: "36",
      C: "36B",
      D: "36A",
      E: "37",
    }
  ),
  pg(
    "TWK",
    "Makna Bhinneka Tunggal Ika yang paling tepat adalah...",
    "Bhinneka Tunggal Ika",
    "MUDAH",
    "Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu, yaitu persatuan dalam keberagaman.",
    "E",
    {
      A: "Berbeda-beda dan hidup terpisah",
      B: "Keseragaman budaya sebagai tujuan nasional",
      C: "Perbedaan harus dihapus demi persatuan",
      D: "Persatuan hanya berlaku bagi kelompok mayoritas",
      E: "Berbeda-beda tetapi tetap satu",
    }
  ),
  pg(
    "TWK",
    "Sumpah Pemuda memiliki arti penting bagi bangsa Indonesia karena...",
    "Sejarah Nasional",
    "SEDANG",
    "Sumpah Pemuda menegaskan satu tanah air, satu bangsa, dan satu bahasa persatuan Indonesia.",
    "A",
    {
      A: "Memperkuat kesadaran persatuan nasional",
      B: "Menetapkan Presiden pertama Republik Indonesia",
      C: "Mengesahkan UUD 1945",
      D: "Membentuk kabinet parlementer",
      E: "Menetapkan wilayah otonomi daerah",
    }
  ),
  pg(
    "TWK",
    "Hari Kebangkitan Nasional diperingati setiap tanggal 20 Mei untuk mengenang berdirinya...",
    "Sejarah Nasional",
    "MUDAH",
    "Hari Kebangkitan Nasional merujuk pada berdirinya Boedi Oetomo pada 20 Mei 1908.",
    "B",
    {
      A: "Indische Partij",
      B: "Boedi Oetomo",
      C: "Sarekat Islam",
      D: "Perhimpunan Indonesia",
      E: "PPKI",
    }
  ),
  pg(
    "TWK",
    "Naskah Proklamasi Kemerdekaan Indonesia ditandatangani oleh...",
    "Sejarah Nasional",
    "MUDAH",
    "Naskah Proklamasi ditandatangani oleh Soekarno dan Mohammad Hatta atas nama bangsa Indonesia.",
    "D",
    {
      A: "Soekarno dan Ahmad Soebardjo",
      B: "Mohammad Hatta dan Sayuti Melik",
      C: "Soepomo dan Mohammad Yamin",
      D: "Soekarno dan Mohammad Hatta",
      E: "Radjiman Wedyodiningrat dan Soekarno",
    }
  ),
  pg(
    "TWK",
    "Piagam Jakarta disusun oleh Panitia Sembilan pada tanggal...",
    "Sejarah Pancasila",
    "SEDANG",
    "Panitia Sembilan menyusun Piagam Jakarta pada 22 Juni 1945.",
    "C",
    {
      A: "29 Mei 1945",
      B: "1 Juni 1945",
      C: "22 Juni 1945",
      D: "17 Agustus 1945",
      E: "18 Agustus 1945",
    }
  ),
  pg(
    "TWK",
    "Dekrit Presiden 5 Juli 1959 antara lain berisi...",
    "Sejarah Konstitusi",
    "SULIT",
    "Dekrit Presiden 5 Juli 1959 memuat pembubaran Konstituante dan pemberlakuan kembali UUD 1945.",
    "E",
    {
      A: "Pembentukan BPUPKI",
      B: "Pengesahan Piagam Jakarta sebagai konstitusi",
      C: "Pembubaran DPR hasil pemilu",
      D: "Pembentukan negara federal",
      E: "Pemberlakuan kembali UUD 1945",
    }
  ),
  pg(
    "TWK",
    "Wawasan Nusantara dalam konteks NKRI menekankan bahwa Indonesia dipandang sebagai...",
    "Wawasan Kebangsaan",
    "SEDANG",
    "Wawasan Nusantara menempatkan Indonesia sebagai satu kesatuan ideologi, politik, ekonomi, sosial budaya, pertahanan, dan keamanan.",
    "B",
    {
      A: "Kumpulan daerah yang berdiri sendiri",
      B: "Satu kesatuan wilayah dan bangsa",
      C: "Wilayah ekonomi yang terpisah antarpulau",
      D: "Gabungan negara bagian",
      E: "Kawasan budaya tanpa ikatan politik",
    }
  ),
  pg(
    "TWK",
    "Netralitas ASN dalam pemilu berarti ASN harus...",
    "ASN dan Nasionalisme",
    "SEDANG",
    "ASN wajib menjaga netralitas, tidak menggunakan jabatan atau fasilitas negara untuk mendukung peserta politik tertentu.",
    "A",
    {
      A: "Tidak berpihak dan tidak menggunakan jabatan untuk kepentingan politik praktis",
      B: "Mendukung calon yang didukung atasan",
      C: "Mengikuti kampanye sebagai bagian tugas kedinasan",
      D: "Menjadi pengurus partai politik di luar jam kerja",
      E: "Mengarahkan masyarakat memilih calon tertentu",
    }
  ),
  pg(
    "TWK",
    "Menolak hadiah dari pengguna layanan setelah membantu pengurusan dokumen mencerminkan nilai...",
    "Integritas",
    "MUDAH",
    "Menolak hadiah yang berpotensi gratifikasi menunjukkan integritas, kejujuran, dan antikorupsi.",
    "C",
    {
      A: "Prestise jabatan",
      B: "Kemandirian ekonomi",
      C: "Kejujuran dan antikorupsi",
      D: "Kesetiaan kelompok",
      E: "Efisiensi kerja pribadi",
    }
  ),
  pg(
    "TWK",
    "Bentuk Negara Kesatuan Republik Indonesia tidak dapat dilakukan perubahan. Ketentuan ini terdapat pada UUD 1945 Pasal 37 ayat...",
    "NKRI",
    "SULIT",
    "Pasal 37 ayat (5) UUD 1945 menegaskan bahwa bentuk NKRI tidak dapat dilakukan perubahan.",
    "E",
    {
      A: "(1)",
      B: "(2)",
      C: "(3)",
      D: "(4)",
      E: "(5)",
    }
  ),
  pg(
    "TWK",
    "Pelaksanaan otonomi daerah dalam kerangka NKRI bertujuan untuk...",
    "NKRI",
    "SEDANG",
    "Otonomi daerah bertujuan mendekatkan pelayanan dan pembangunan kepada masyarakat dengan tetap berada dalam kerangka NKRI.",
    "D",
    {
      A: "Membentuk negara bagian yang mandiri",
      B: "Menghapus kewenangan pemerintah pusat",
      C: "Membuat ideologi daerah masing-masing",
      D: "Mendekatkan pelayanan publik kepada masyarakat",
      E: "Mengganti sistem hukum nasional",
    }
  ),
  pg(
    "TWK",
    "Salah satu nilai dasar bela negara adalah...",
    "Bela Negara",
    "MUDAH",
    "Nilai dasar bela negara meliputi cinta tanah air, sadar berbangsa dan bernegara, setia kepada Pancasila, rela berkorban, dan kemampuan awal bela negara.",
    "B",
    {
      A: "Fanatisme golongan",
      B: "Cinta tanah air",
      C: "Dominasi kelompok sendiri",
      D: "Individualisme ekstrem",
      E: "Kepentingan pribadi di atas negara",
    }
  ),
  pg(
    "TWK",
    "Integritas ASN paling tepat diwujudkan melalui sikap...",
    "Integritas",
    "MUDAH",
    "Integritas menuntut keselarasan antara nilai, ucapan, tindakan, dan kepatuhan terhadap aturan.",
    "A",
    {
      A: "Jujur, konsisten, dan bertanggung jawab terhadap aturan",
      B: "Mengikuti arahan walau melanggar prosedur",
      C: "Bekerja baik hanya saat diawasi",
      D: "Mengutamakan relasi pribadi",
      E: "Menunda laporan kesalahan agar tidak disalahkan",
    }
  ),
  pg(
    "TWK",
    "Nasionalisme yang sesuai dengan Pancasila ditunjukkan dengan...",
    "Nasionalisme",
    "SEDANG",
    "Nasionalisme Pancasila mencintai bangsa sendiri tanpa merendahkan bangsa lain dan tetap menjunjung kemanusiaan.",
    "E",
    {
      A: "Menolak semua bentuk kerja sama internasional",
      B: "Menganggap bangsa sendiri selalu paling unggul",
      C: "Mendahulukan daerah sendiri dalam pelayanan negara",
      D: "Membatasi hak warga karena perbedaan budaya",
      E: "Mencintai bangsa tanpa merendahkan bangsa lain",
    }
  ),
  pg(
    "TWK",
    "Gotong royong dalam pelayanan publik paling tepat diwujudkan dengan...",
    "Pancasila",
    "MUDAH",
    "Gotong royong menekankan kerja sama dan saling membantu untuk menyelesaikan kepentingan bersama.",
    "C",
    {
      A: "Bekerja sendiri agar lebih cepat selesai",
      B: "Membagi tugas hanya kepada pegawai baru",
      C: "Berkolaborasi lintas unit untuk menyelesaikan layanan masyarakat",
      D: "Menunggu perintah pimpinan untuk semua pekerjaan",
      E: "Mengalihkan masalah ke unit lain",
    }
  ),
  pg(
    "TWK",
    "Pancasila sebagai ideologi terbuka berarti...",
    "Pancasila",
    "SULIT",
    "Ideologi terbuka berarti nilai dasar Pancasila tetap, sedangkan penerapannya dapat menyesuaikan perkembangan zaman.",
    "B",
    {
      A: "Nilai dasar Pancasila dapat diubah kapan saja",
      B: "Nilai Pancasila tetap, tetapi penerapannya adaptif",
      C: "Pancasila hanya berlaku pada masa tertentu",
      D: "Pancasila diganti oleh kesepakatan politik terbaru",
      E: "Pancasila tidak memiliki nilai dasar",
    }
  ),

  pg(
    "TIU",
    "Jika 4a + 7 = 31, maka nilai a adalah...",
    "Matematika Dasar",
    "MUDAH",
    "4a + 7 = 31, sehingga 4a = 24 dan a = 6.",
    "C",
    { A: "4", B: "5", C: "6", D: "7", E: "8" }
  ),
  pg(
    "TIU",
    "Deret 2, 5, 11, 23, 47, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Pola deret adalah dikali 2 lalu ditambah 1. Setelah 47 menjadi 47 x 2 + 1 = 95.",
    "D",
    { A: "82", B: "89", C: "93", D: "95", E: "99" }
  ),
  pg(
    "TIU",
    "Deret 81, 27, 9, 3, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Setiap suku dibagi 3. Setelah 3 adalah 1.",
    "A",
    { A: "1", B: "2", C: "3", D: "6", E: "9" }
  ),
  pg(
    "TIU",
    "Deret 7, 10, 16, 28, 52, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Selisihnya 3, 6, 12, 24, sehingga selisih berikutnya 48. Jadi 52 + 48 = 100.",
    "E",
    { A: "76", B: "84", C: "92", D: "96", E: "100" }
  ),
  pg(
    "TIU",
    "Deret 5, 9, 17, 33, 65, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Pola deret adalah dikali 2 dikurangi 1. Setelah 65 menjadi 65 x 2 - 1 = 129.",
    "C",
    { A: "121", B: "125", C: "129", D: "131", E: "135" }
  ),
  pg(
    "TIU",
    "Harga sebuah barang Rp 240.000 mendapat diskon 15%. Besar diskon adalah...",
    "Persentase",
    "MUDAH",
    "Diskon = 15% x 240.000 = 36.000.",
    "B",
    {
      A: "Rp 24.000",
      B: "Rp 36.000",
      C: "Rp 42.000",
      D: "Rp 48.000",
      E: "Rp 54.000",
    }
  ),
  pg(
    "TIU",
    "Perbandingan uang Andi dan Bima adalah 3 : 5. Jika jumlah uang mereka Rp 64.000, uang Andi adalah...",
    "Perbandingan",
    "MUDAH",
    "Total bagian 3 + 5 = 8. Uang Andi = 3/8 x 64.000 = 24.000.",
    "A",
    {
      A: "Rp 24.000",
      B: "Rp 28.000",
      C: "Rp 32.000",
      D: "Rp 36.000",
      E: "Rp 40.000",
    }
  ),
  pg(
    "TIU",
    "Sebuah kendaraan menempuh jarak 180 km dalam 3 jam. Jika kecepatannya tetap, jarak yang ditempuh dalam 4 jam adalah...",
    "Kecepatan",
    "MUDAH",
    "Kecepatan = 180/3 = 60 km/jam. Dalam 4 jam jaraknya 60 x 4 = 240 km.",
    "D",
    { A: "200 km", B: "210 km", C: "220 km", D: "240 km", E: "260 km" }
  ),
  pg(
    "TIU",
    "Rata-rata nilai 6 peserta adalah 78. Jika satu peserta bernilai 90 ditambahkan, rata-rata baru adalah...",
    "Statistika",
    "SEDANG",
    "Total 6 peserta = 6 x 78 = 468. Total baru = 558. Rata-rata baru = 558/7 = 79,71.",
    "E",
    { A: "78,50", B: "79,00", C: "79,25", D: "79,50", E: "79,71" }
  ),
  pg(
    "TIU",
    "Jika x = 7 dan y = 4, nilai 2x + 3y adalah...",
    "Aljabar",
    "MUDAH",
    "2x + 3y = 2(7) + 3(4) = 14 + 12 = 26.",
    "C",
    { A: "22", B: "24", C: "26", D: "28", E: "30" }
  ),
  pg(
    "TIU",
    "Persegi panjang memiliki keliling 50 cm dan panjang 15 cm. Luasnya adalah...",
    "Geometri",
    "SEDANG",
    "Keliling 2(p + l) = 50, maka p + l = 25. Jika p = 15, l = 10. Luas = 15 x 10 = 150 cm2.",
    "B",
    { A: "125 cm2", B: "150 cm2", C: "175 cm2", D: "200 cm2", E: "225 cm2" }
  ),
  pg(
    "TIU",
    "Dalam sebuah kotak terdapat 3 bola merah dan 5 bola biru. Peluang mengambil bola merah adalah...",
    "Peluang",
    "MUDAH",
    "Jumlah bola 8, bola merah 3, sehingga peluang mengambil bola merah adalah 3/8.",
    "A",
    { A: "3/8", B: "5/8", C: "3/5", D: "5/3", E: "1/2" }
  ),
  pg(
    "TIU",
    "Harga awal barang Rp 500.000. Setelah diskon 20%, dikenakan biaya layanan 10% dari harga setelah diskon. Total pembayaran adalah...",
    "Persentase",
    "SEDANG",
    "Harga setelah diskon = 400.000. Biaya layanan = 10% x 400.000 = 40.000. Total = 440.000.",
    "D",
    {
      A: "Rp 400.000",
      B: "Rp 420.000",
      C: "Rp 430.000",
      D: "Rp 440.000",
      E: "Rp 450.000",
    }
  ),
  pg(
    "TIU",
    "A dapat menyelesaikan pekerjaan dalam 12 hari, B dalam 6 hari. Jika bekerja bersama, pekerjaan selesai dalam...",
    "Aritmetika Sosial",
    "SEDANG",
    "Kecepatan bersama = 1/12 + 1/6 = 3/12 = 1/4 pekerjaan per hari, sehingga selesai dalam 4 hari.",
    "C",
    { A: "2 hari", B: "3 hari", C: "4 hari", D: "5 hari", E: "6 hari" }
  ),
  pg(
    "TIU",
    "Sinonim kata implisit adalah...",
    "Verbal",
    "MUDAH",
    "Implisit berarti tersirat atau tidak dinyatakan secara langsung.",
    "B",
    {
      A: "Tersurat",
      B: "Tersirat",
      C: "Terbuka",
      D: "Terperinci",
      E: "Terlampir",
    }
  ),
  pg(
    "TIU",
    "Antonim kata statis adalah...",
    "Verbal",
    "MUDAH",
    "Statis berarti tetap atau tidak bergerak. Lawan katanya adalah dinamis.",
    "E",
    { A: "Pasif", B: "Tetap", C: "Lambat", D: "Stabil", E: "Dinamis" }
  ),
  pg(
    "TIU",
    "ARSIPARIS : DOKUMEN = PUSTAKAWAN : ...",
    "Analogi",
    "MUDAH",
    "Arsiparis mengelola dokumen, pustakawan mengelola buku.",
    "C",
    { A: "Rak", B: "Katalog", C: "Buku", D: "Perpustakaan", E: "Pembaca" }
  ),
  pg(
    "TIU",
    "KOMPAS : ARAH = JAM : ...",
    "Analogi",
    "MUDAH",
    "Kompas digunakan untuk menunjukkan arah, jam digunakan untuk menunjukkan waktu.",
    "A",
    { A: "Waktu", B: "Detik", C: "Mesin", D: "Jarum", E: "Dinding" }
  ),
  pg(
    "TIU",
    "Semua petugas loket menggunakan aplikasi antrean. Rina adalah petugas loket. Kesimpulan yang tepat adalah...",
    "Penalaran Logis",
    "MUDAH",
    "Silogisme: semua petugas loket menggunakan aplikasi antrean, Rina petugas loket, maka Rina menggunakan aplikasi antrean.",
    "D",
    {
      A: "Rina mungkin menggunakan aplikasi antrean",
      B: "Rina tidak wajib menggunakan aplikasi antrean",
      C: "Tidak dapat disimpulkan",
      D: "Rina menggunakan aplikasi antrean",
      E: "Semua pengguna aplikasi adalah petugas loket",
    }
  ),
  pg(
    "TIU",
    "Negasi dari pernyataan Semua peserta hadir tepat waktu adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Negasi dari semua peserta hadir tepat waktu adalah ada peserta yang tidak hadir tepat waktu.",
    "B",
    {
      A: "Semua peserta tidak hadir tepat waktu",
      B: "Ada peserta yang tidak hadir tepat waktu",
      C: "Tidak ada peserta yang hadir",
      D: "Sebagian peserta hadir tepat waktu",
      E: "Peserta hadir lebih awal",
    }
  ),
  pg(
    "TIU",
    "Jika hujan maka jalan basah. Jalan tidak basah. Kesimpulan yang benar adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Modus tollens: jika P maka Q, tidak Q, maka tidak P. Jadi tidak hujan.",
    "E",
    {
      A: "Hujan deras",
      B: "Jalan tetap basah",
      C: "Tidak dapat disimpulkan",
      D: "Hujan sebentar",
      E: "Tidak hujan",
    }
  ),
  pg(
    "TIU",
    "Semua analis adalah pegawai. Sebagian peserta rapat adalah analis. Kesimpulan yang tepat adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Jika semua analis adalah pegawai dan sebagian peserta rapat adalah analis, maka sebagian peserta rapat adalah pegawai.",
    "A",
    {
      A: "Sebagian peserta rapat adalah pegawai",
      B: "Semua peserta rapat adalah pegawai",
      C: "Tidak ada peserta rapat yang pegawai",
      D: "Semua pegawai adalah analis",
      E: "Sebagian pegawai bukan peserta rapat",
    }
  ),
  pg(
    "TIU",
    "Bacalah teks berikut. Digitalisasi layanan publik mempercepat proses administrasi, tetapi tetap memerlukan pendampingan bagi warga yang belum terbiasa. Ide pokok kalimat tersebut adalah...",
    "Pemahaman Bacaan",
    "MUDAH",
    "Gagasan utama teks adalah manfaat digitalisasi layanan publik yang perlu disertai pendampingan.",
    "C",
    {
      A: "Warga belum terbiasa menggunakan teknologi",
      B: "Administrasi publik selalu lambat",
      C: "Digitalisasi layanan mempercepat administrasi namun perlu pendampingan",
      D: "Pendampingan warga menghambat digitalisasi",
      E: "Teknologi tidak cocok untuk layanan publik",
    }
  ),
  pg(
    "TIU",
    "Data menunjukkan loket yang membuka layanan lebih awal memiliki antrean lebih pendek. Pernyataan yang paling mendukung kesimpulan tersebut adalah...",
    "Penalaran Analitis",
    "SEDANG",
    "Dukungan paling kuat adalah bukti bahwa warga tersebar lebih merata ketika layanan dibuka lebih awal.",
    "D",
    {
      A: "Jumlah pegawai loket selalu sama setiap hari",
      B: "Sebagian warga tidak membawa dokumen lengkap",
      C: "Antrean panjang terjadi di semua kantor",
      D: "Pembukaan lebih awal membuat kedatangan warga lebih tersebar",
      E: "Loket ditutup pada jam yang sama",
    }
  ),
  pg(
    "TIU",
    "Jika x = 2/3 dari 45 dan y = 35 - 10, maka hubungan x dan y adalah...",
    "Perbandingan Kuantitatif",
    "MUDAH",
    "x = 30 dan y = 25, sehingga x lebih besar daripada y.",
    "A",
    {
      A: "x > y",
      B: "x < y",
      C: "x = y",
      D: "x + y = 50",
      E: "Tidak dapat ditentukan",
    }
  ),
  pg(
    "TIU",
    "Volume kubus dengan panjang rusuk 6 cm adalah...",
    "Geometri",
    "MUDAH",
    "Volume kubus = s x s x s = 6 x 6 x 6 = 216 cm3.",
    "E",
    { A: "36 cm3", B: "72 cm3", C: "108 cm3", D: "144 cm3", E: "216 cm3" }
  ),
  pg(
    "TIU",
    "Jika 3(x - 2) = 2x + 7, maka nilai x adalah...",
    "Aljabar",
    "SEDANG",
    "3x - 6 = 2x + 7, sehingga x = 13.",
    "D",
    { A: "9", B: "10", C: "11", D: "13", E: "15" }
  ),
  pg(
    "TIU",
    "Nilai 80 dinaikkan 20%, lalu hasilnya diturunkan 25%. Nilai akhirnya adalah...",
    "Persentase",
    "SEDANG",
    "80 naik 20% menjadi 96. Lalu turun 25% menjadi 96 x 75% = 72.",
    "B",
    { A: "70", B: "72", C: "74", D: "76", E: "78" }
  ),
  pg(
    "TIU",
    "Deret huruf A, C, F, J, O, ... Huruf berikutnya adalah...",
    "Deret Huruf",
    "SEDANG",
    "Posisi huruf bertambah 2, 3, 4, 5, sehingga berikutnya bertambah 6 dari O menjadi U.",
    "C",
    { A: "R", B: "T", C: "U", D: "V", E: "W" }
  ),
  pg(
    "TIU",
    "Jika KOTA dikodekan menjadi MQVC dengan pergeseran huruf +2, maka DESA dikodekan menjadi...",
    "Kode Huruf",
    "SEDANG",
    "Setiap huruf digeser dua posisi: D menjadi F, E menjadi G, S menjadi U, A menjadi C.",
    "A",
    { A: "FGUC", B: "EFUB", C: "FGTB", D: "GFTC", E: "EGUC" }
  ),
  pg(
    "TIU",
    "Dari 5 orang akan dipilih ketua dan sekretaris. Banyak cara pemilihan adalah...",
    "Kombinatorika",
    "SEDANG",
    "Ketua dapat dipilih 5 cara dan sekretaris 4 cara, sehingga 5 x 4 = 20 cara.",
    "E",
    { A: "10", B: "12", C: "15", D: "18", E: "20" }
  ),
  pg(
    "TIU",
    "Rani 4 tahun lebih tua dari Siti. Jumlah umur mereka 42 tahun. Umur Rani adalah...",
    "Aritmetika Sosial",
    "SEDANG",
    "Misal umur Siti x, maka Rani x + 4. Jumlah 2x + 4 = 42, x = 19, sehingga Rani 23 tahun.",
    "C",
    {
      A: "19 tahun",
      B: "21 tahun",
      C: "23 tahun",
      D: "25 tahun",
      E: "27 tahun",
    }
  ),
  pg(
    "TIU",
    "Pernyataan Sebagian dokumen sudah diverifikasi memiliki makna yang setara dengan...",
    "Penalaran Verbal",
    "SEDANG",
    "Sebagian berarti ada setidaknya satu, tetapi tidak selalu semua.",
    "D",
    {
      A: "Semua dokumen sudah diverifikasi",
      B: "Tidak ada dokumen yang diverifikasi",
      C: "Semua dokumen belum diverifikasi",
      D: "Ada dokumen yang sudah diverifikasi",
      E: "Dokumen tidak perlu diverifikasi",
    }
  ),
  pg(
    "TIU",
    "Jika 40% dari suatu bilangan adalah 32, bilangan tersebut adalah...",
    "Persentase",
    "MUDAH",
    "40% x n = 32, maka n = 32/0,4 = 80.",
    "A",
    { A: "80", B: "72", C: "64", D: "56", E: "48" }
  ),
  pg(
    "TIU",
    "Sebuah rapat dimulai pukul 08.15 dan berlangsung 2 jam 35 menit. Rapat selesai pukul...",
    "Aritmetika Waktu",
    "MUDAH",
    "08.15 ditambah 2 jam 35 menit menjadi 10.50.",
    "E",
    { A: "10.30", B: "10.35", C: "10.40", D: "10.45", E: "10.50" }
  ),
  tkp(
    "Seorang warga mengeluh karena antreannya terlewat akibat gangguan sistem. Sikap Anda...",
    "Orientasi Pelayanan",
    "SEDANG",
    "Pelayanan terbaik adalah meminta maaf, memeriksa data antrean, dan memberi solusi sesuai prosedur.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Meminta warga mengambil nomor antrean baru dari awal",
      B: "Menyalahkan sistem dan meminta warga menunggu tanpa kepastian",
      C: "Menghubungi petugas teknis setelah jam layanan selesai",
      D: "Meminta maaf, memeriksa data antrean, dan mengembalikan hak layanan sesuai prosedur",
      E: "Menyarankan warga datang keesokan hari",
    }
  ),
  tkp(
    "Anda menemukan data pemohon berbeda antara dokumen fisik dan sistem. Tindakan Anda...",
    "Ketelitian",
    "SEDANG",
    "Data harus diverifikasi pada sumber yang sah sebelum diproses agar tidak menimbulkan kesalahan layanan.",
    { A: 2, B: 1, C: 5, D: 3, E: 4 },
    {
      A: "Mengikuti data yang lebih mudah diproses",
      B: "Mengubah data sistem agar sama dengan dokumen fisik tanpa cek ulang",
      C: "Memverifikasi ke sumber resmi dan menunda proses sampai data jelas",
      D: "Meminta pemohon membuat dokumen baru",
      E: "Berkonsultasi dengan petugas arsip dan mencatat perbedaannya",
    }
  ),
  tkp(
    "Seorang pegawai senior meminta Anda melewati SOP karena pemohon adalah kenalannya. Sikap Anda...",
    "Integritas",
    "SEDANG",
    "Integritas menuntut kepatuhan pada prosedur tanpa perlakuan istimewa.",
    { A: 1, B: 2, C: 3, D: 5, E: 4 },
    {
      A: "Mengikuti permintaan karena ia senior",
      B: "Membantu secara diam-diam agar cepat selesai",
      C: "Menolak dengan kasar agar ia tidak mengulang",
      D: "Menolak secara sopan dan menjelaskan bahwa semua pemohon harus mengikuti SOP",
      E: "Meminta arahan atasan jika senior tetap memaksa",
    }
  ),
  tkp(
    "Aplikasi layanan tiba-tiba tidak dapat diakses saat jam ramai. Anda...",
    "Adaptasi Teknologi",
    "SEDANG",
    "Gangguan layanan perlu ditangani dengan koordinasi teknis dan komunikasi yang jelas kepada pengguna layanan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menutup loket tanpa penjelasan",
      B: "Menunggu sistem pulih tanpa memberi informasi",
      C: "Melaporkan ke tim teknis, mencatat layanan manual sementara, dan memberi informasi estimasi kepada warga",
      D: "Mengatur ulang antrean agar warga prioritas tetap terlayani",
      E: "Meminta warga memantau sendiri melalui media sosial",
    }
  ),
  tkp(
    "Kantor menerapkan aplikasi baru yang belum Anda kuasai. Sikap Anda...",
    "Kemauan Belajar",
    "MUDAH",
    "ASN perlu adaptif dengan mempelajari sistem baru dan membantu penerapan layanan.",
    { A: 1, B: 2, C: 3, D: 5, E: 4 },
    {
      A: "Menolak memakai aplikasi sampai terbiasa",
      B: "Meminta rekan mengerjakan bagian Anda",
      C: "Menggunakan cara lama selama masih bisa",
      D: "Mempelajari panduan, berlatih, dan bertanya bila ada kendala",
      E: "Mengikuti pelatihan singkat lalu mencoba pada tugas ringan",
    }
  ),
  tkp(
    "Dua rekan kerja berselisih sehingga pekerjaan tim terhambat. Anda...",
    "Kerja Sama",
    "SEDANG",
    "Kerja sama dijaga dengan komunikasi terbuka, fokus pada pekerjaan, dan penyelesaian konflik secara konstruktif.",
    { A: 1, B: 3, C: 2, D: 5, E: 4 },
    {
      A: "Memihak rekan yang lebih dekat dengan Anda",
      B: "Melanjutkan pekerjaan sendiri dan membiarkan mereka",
      C: "Menyampaikan masalah itu ke semua anggota tim",
      D: "Mengajak keduanya berdiskusi secara profesional untuk menyepakati pembagian kerja",
      E: "Menyampaikan dampak konflik kepada koordinator tim",
    }
  ),
  tkp(
    "Warga datang dengan nada tinggi karena merasa dipersulit. Respons terbaik Anda...",
    "Pengendalian Diri",
    "SEDANG",
    "Pengendalian diri dan orientasi pelayanan ditunjukkan dengan mendengarkan, menenangkan, dan menjelaskan solusi.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Membalas dengan nada tegas agar warga diam",
      B: "Meminta petugas keamanan langsung mengeluarkannya",
      C: "Mendengarkan keluhan, menjaga nada bicara, dan menjelaskan prosedur penyelesaian",
      D: "Menghindar sampai warga tenang",
      E: "Meminta bantuan atasan jika situasi tidak terkendali",
    }
  ),
  tkp(
    "Anda diberi amplop sebagai ucapan terima kasih setelah menyelesaikan layanan. Anda...",
    "Integritas",
    "MUDAH",
    "Hadiah terkait layanan berpotensi gratifikasi sehingga harus ditolak sesuai aturan.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Menerima karena hanya ucapan terima kasih",
      B: "Menerima tetapi tidak memberi tahu siapa pun",
      C: "Menolak dengan sopan dan menjelaskan aturan gratifikasi",
      D: "Menerima lalu membaginya kepada tim",
      E: "Melaporkan jika pemberi tetap memaksa",
    }
  ),
  tkp(
    "Deadline laporan dimajukan, sementara beberapa data belum lengkap. Anda...",
    "Orientasi Hasil",
    "SEDANG",
    "Orientasi hasil berarti mengatur prioritas, berkoordinasi, dan menyampaikan perkembangan secara jujur.",
    { A: 2, B: 1, C: 5, D: 4, E: 3 },
    {
      A: "Mengirim laporan seadanya agar cepat selesai",
      B: "Menolak deadline baru karena mendadak",
      C: "Memprioritaskan data utama, berkoordinasi dengan pemilik data, dan memberi update kepada atasan",
      D: "Membagi tugas validasi data dengan rekan tim",
      E: "Meminta perpanjangan tanpa mencoba menyelesaikan",
    }
  ),
  tkp(
    "Anda ditugaskan melayani masyarakat di daerah dengan akses internet terbatas. Sikap Anda...",
    "Adaptasi",
    "SEDANG",
    "Adaptasi pelayanan dilakukan dengan menyesuaikan metode kerja tanpa mengabaikan akuntabilitas.",
    { A: 1, B: 2, C: 3, D: 5, E: 4 },
    {
      A: "Menunggu sampai jaringan stabil sepenuhnya",
      B: "Mengurangi jam layanan karena kendala jaringan",
      C: "Meminta warga pergi ke kantor lain",
      D: "Menyiapkan mekanisme layanan offline sementara dan sinkronisasi data saat jaringan tersedia",
      E: "Mencatat kendala dan mengusulkan dukungan teknis tambahan",
    }
  ),
  tkp(
    "Anda menerima pesan provokatif di grup kerja yang berpotensi memecah persatuan. Anda...",
    "Komitmen Kebangsaan",
    "SEDANG",
    "Informasi provokatif harus diverifikasi, tidak disebarkan, dan dilaporkan melalui kanal yang tepat.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meneruskan agar semua orang waspada",
      B: "Membalas dengan komentar emosional",
      C: "Tidak menyebarkan, memverifikasi, dan mengingatkan grup agar menggunakan sumber resmi",
      D: "Melaporkan kepada admin grup atau atasan bila berpotensi melanggar aturan",
      E: "Menghapus pesan dari ponsel sendiri saja",
    }
  ),
  tkp(
    "Anda melihat rekan memberi pelayanan berbeda karena latar belakang pemohon. Sikap Anda...",
    "Sosial Budaya",
    "SEDANG",
    "Pelayanan publik harus adil dan tidak diskriminatif terhadap semua warga.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan karena bukan urusan Anda",
      B: "Menegur keras di depan pemohon",
      C: "Mengingatkan rekan secara profesional agar memberi layanan setara",
      D: "Melaporkan bila perilaku diskriminatif terus terjadi",
      E: "Mengambil alih layanan tanpa penjelasan",
    }
  ),
  tkp(
    "Anda diajak menghadiri kampanye politik oleh teman satu kantor. Sikap Anda...",
    "Netralitas ASN",
    "MUDAH",
    "ASN wajib menjaga netralitas dan tidak terlibat politik praktis.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Ikut karena hanya sebagai penonton",
      B: "Ikut tetapi tidak memakai atribut kantor",
      C: "Menolak dengan sopan karena harus menjaga netralitas ASN",
      D: "Datang sebentar agar tidak menyinggung teman",
      E: "Mengingatkan teman tentang aturan netralitas",
    }
  ),
  tkp(
    "Anda menemukan proses layanan yang dapat dipangkas tanpa melanggar aturan. Anda...",
    "Inovasi",
    "SEDANG",
    "Inovasi yang baik didukung data, analisis risiko, dan tetap sesuai regulasi.",
    { A: 2, B: 1, C: 5, D: 4, E: 3 },
    {
      A: "Langsung mengubah alur kerja sendiri",
      B: "Membiarkan karena prosedur sudah lama berlaku",
      C: "Menyusun usulan berbasis data dan menyampaikannya melalui forum resmi",
      D: "Berdiskusi dengan tim untuk menguji manfaat dan risikonya",
      E: "Menunggu ada instruksi dari pimpinan",
    }
  ),
  tkp(
    "Seorang rekan meminta Anda mengirim data pribadi pemohon melalui aplikasi pesan pribadi. Anda...",
    "Keamanan Data",
    "SEDANG",
    "Data pribadi harus dilindungi dan hanya dibagikan melalui kanal resmi sesuai kewenangan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengirim karena rekan tersebut membutuhkan cepat",
      B: "Mengirim sebagian data tanpa nama lengkap",
      C: "Menolak dan mengarahkan penggunaan kanal resmi yang aman",
      D: "Memastikan dulu kewenangan rekan dan prosedur permintaan data",
      E: "Meminta persetujuan lisan dari pemohon",
    }
  ),
  tkp(
    "Rekan meminta username dan password Anda karena akunnya bermasalah. Anda...",
    "Keamanan Informasi",
    "MUDAH",
    "Akun bersifat personal dan tidak boleh dibagikan. Bantuan dilakukan melalui prosedur pemulihan akses.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memberikan sementara karena rekan membutuhkan",
      B: "Memberikan tetapi mengganti password setelahnya",
      C: "Menolak membagikan akun dan membantu melapor ke admin sistem",
      D: "Mengarahkan rekan menggunakan prosedur reset akses",
      E: "Meminta rekan memakai komputer Anda saja",
    }
  ),
  tkp(
    "Ada pelatihan kompetensi di luar jam kerja yang relevan dengan tugas Anda. Anda...",
    "Pengembangan Diri",
    "MUDAH",
    "Pengembangan kompetensi menunjukkan kemauan belajar dan profesionalisme.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Tidak ikut karena di luar jam kerja",
      B: "Ikut hanya jika diwajibkan",
      C: "Mendaftar jika tugas utama tetap dapat diselesaikan",
      D: "Mengikuti pelatihan dan menerapkan hasilnya untuk memperbaiki pekerjaan",
      E: "Meminta rekan mengikuti lalu membagikan materinya",
    }
  ),
  tkp(
    "Anggota tim Anda tertinggal menyelesaikan tugasnya. Tindakan Anda...",
    "Kerja Sama",
    "SEDANG",
    "Kerja sama berarti membantu mengidentifikasi hambatan dan menjaga capaian tim.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan agar ia belajar dari kesalahan",
      B: "Mengambil alih semua tugasnya tanpa bicara",
      C: "Menanyakan kendala, membantu menyusun prioritas, dan menyepakati tenggat baru",
      D: "Membagi ulang sebagian tugas jika beban tidak seimbang",
      E: "Melaporkan langsung ke atasan",
    }
  ),
  tkp(
    "Masyarakat memberikan kritik terbuka terhadap layanan unit Anda. Sikap Anda...",
    "Orientasi Pelayanan",
    "SEDANG",
    "Kritik perlu diterima sebagai masukan perbaikan dengan tetap memverifikasi fakta.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membalas kritik untuk membela unit",
      B: "Mengabaikan karena kritik di ruang publik",
      C: "Mencatat kritik, memverifikasi fakta, dan mengusulkan perbaikan layanan",
      D: "Mengundang pemberi kritik menyampaikan detail melalui kanal resmi",
      E: "Menunggu arahan pimpinan sebelum bersikap",
    }
  ),
  tkp(
    "Anda mengetahui ada kekeliruan atasan dalam data rapat. Anda...",
    "Komunikasi",
    "SEDANG",
    "Komunikasi profesional dilakukan dengan menyampaikan koreksi berbasis data secara hormat.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Membiarkan karena takut menyinggung atasan",
      B: "Mengoreksi langsung dengan nada menyalahkan",
      C: "Menunggu rapat selesai lalu memberi catatan",
      D: "Menyampaikan koreksi secara sopan dengan data pendukung pada waktu yang tepat",
      E: "Meminta rekan lain yang menyampaikan",
    }
  ),
  tkp(
    "Anggaran kegiatan terbatas, sementara kebutuhan layanan banyak. Anda...",
    "Manajemen Sumber Daya",
    "SEDANG",
    "Pengelolaan sumber daya harus berbasis prioritas, dampak, dan akuntabilitas.",
    { A: 2, B: 1, C: 5, D: 4, E: 3 },
    {
      A: "Membagi rata anggaran tanpa melihat kebutuhan",
      B: "Menunda semua kegiatan sampai anggaran bertambah",
      C: "Menyusun prioritas berdasarkan urgensi dan dampak layanan",
      D: "Mencari alternatif efisiensi tanpa menurunkan mutu utama",
      E: "Meminta tambahan anggaran tanpa kajian",
    }
  ),
  tkp(
    "Prosedur lama di unit Anda berbeda dengan regulasi terbaru. Sikap Anda...",
    "Kepatuhan Regulasi",
    "SULIT",
    "Regulasi terbaru harus menjadi acuan, disertai koordinasi agar perubahan prosedur sah dan dipahami.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Tetap memakai prosedur lama karena sudah biasa",
      B: "Mengganti prosedur sendiri tanpa koordinasi",
      C: "Mengacu pada regulasi terbaru dan mengusulkan penyesuaian SOP melalui kanal resmi",
      D: "Mengonfirmasi ke bagian hukum atau pimpinan terkait implementasi",
      E: "Menunggu sampai ada keluhan masyarakat",
    }
  ),
  tkp(
    "Terjadi ketegangan antarwarga berbeda latar belakang di ruang layanan. Anda...",
    "Sosial Budaya",
    "SULIT",
    "ASN harus netral, menenangkan situasi, dan memastikan semua pihak mendapat layanan setara.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memihak pihak yang paling banyak jumlahnya",
      B: "Meminta salah satu pihak keluar tanpa penjelasan",
      C: "Menenangkan situasi, menjaga netralitas, dan memastikan layanan tetap adil",
      D: "Meminta bantuan petugas keamanan jika situasi berisiko",
      E: "Menunda layanan semua pihak sampai suasana sepi",
    }
  ),
  tkp(
    "Saat bekerja dari rumah, banyak gangguan yang berpotensi menurunkan produktivitas. Anda...",
    "Profesionalisme",
    "MUDAH",
    "Profesionalisme dalam kerja jarak jauh ditunjukkan dengan pengaturan waktu, target, dan komunikasi yang jelas.",
    { A: 1, B: 2, C: 3, D: 5, E: 4 },
    {
      A: "Bekerja hanya saat ada pesan dari atasan",
      B: "Menunda pekerjaan sampai suasana benar-benar tenang",
      C: "Menyelesaikan pekerjaan menjelang tenggat saja",
      D: "Membuat jadwal kerja, target harian, dan melaporkan progres",
      E: "Mengatur ruang kerja dan meminimalkan gangguan",
    }
  ),
  tkp(
    "Anda menerima permohonan yang ternyata duplikat dari pengajuan sebelumnya. Anda...",
    "Ketelitian Administrasi",
    "SEDANG",
    "Permohonan duplikat harus dicek agar tidak terjadi pemrosesan ganda.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memproses keduanya agar cepat selesai",
      B: "Menghapus salah satu tanpa catatan",
      C: "Memeriksa riwayat, mengonfirmasi kepada pemohon, dan mencatat statusnya",
      D: "Menggabungkan data jika prosedur mengizinkan",
      E: "Mengembalikan semua berkas kepada pemohon",
    }
  ),
  tkp(
    "Program kerja yang Anda rancang tidak mencapai target. Sikap Anda...",
    "Evaluasi Diri",
    "SEDANG",
    "Kegagalan target perlu dievaluasi secara objektif untuk perbaikan berikutnya.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menyalahkan kondisi di luar kendali",
      B: "Mengganti target agar terlihat tercapai",
      C: "Menganalisis penyebab, menyusun perbaikan, dan melaporkan hasil evaluasi",
      D: "Meminta masukan dari tim dan penerima layanan",
      E: "Mengulang program yang sama tahun depan",
    }
  ),
  tkp(
    "Seorang penyandang disabilitas membutuhkan bantuan akses layanan. Anda...",
    "Orientasi Pelayanan",
    "MUDAH",
    "Pelayanan inklusif memberikan bantuan sesuai kebutuhan tanpa merendahkan martabat pemohon.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meminta keluarga pemohon mengurus semuanya",
      B: "Mengarahkan ke loket umum tanpa pendampingan",
      C: "Memberikan bantuan akses yang sesuai dan tetap menghormati kemandirian pemohon",
      D: "Memprioritaskan layanan sesuai prosedur aksesibilitas",
      E: "Meminta pemohon kembali saat kantor lebih sepi",
    }
  ),
  tkp(
    "Berkas pemohon hilang saat berpindah meja layanan. Anda...",
    "Tanggung Jawab",
    "SEDANG",
    "Tanggung jawab ditunjukkan dengan menelusuri, menyampaikan informasi jujur, dan mencegah kerugian pemohon.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meminta pemohon melengkapi ulang tanpa penjelasan",
      B: "Menyalahkan petugas meja sebelumnya",
      C: "Menelusuri alur berkas, menginformasikan kondisi, dan membantu pemulihan dokumen sesuai prosedur",
      D: "Melaporkan insiden kepada koordinator layanan",
      E: "Menunggu berkas ditemukan tanpa memberi kabar",
    }
  ),
  tkp(
    "Teman dekat meminta Anda mempercepat pengurusan dokumennya tanpa antre. Anda...",
    "Integritas",
    "MUDAH",
    "Pelayanan harus adil dan mengikuti antrean serta prosedur yang sama.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Membantu karena ia teman dekat",
      B: "Memproses setelah jam layanan tanpa catatan",
      C: "Menolak perlakuan khusus dan mengarahkan mengikuti prosedur normal",
      D: "Meminta teman tidak memberi tahu orang lain",
      E: "Menjelaskan aturan antrean dengan sopan",
    }
  ),
  tkp(
    "Usulan inovasi Anda belum diterima pimpinan. Sikap Anda...",
    "Kreativitas",
    "SEDANG",
    "Inovasi perlu diperbaiki berdasarkan umpan balik dan data pendukung.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Berhenti mengusulkan ide baru",
      B: "Melaksanakan inovasi tanpa persetujuan",
      C: "Meminta umpan balik, memperbaiki usulan, dan melengkapi data manfaat",
      D: "Mengajak tim menguji coba terbatas jika diizinkan",
      E: "Mengirim ulang usulan yang sama",
    }
  ),
  tkp(
    "Terjadi bencana di wilayah kerja dan layanan publik terganggu. Anda...",
    "Pelayanan Publik",
    "SULIT",
    "Dalam kondisi darurat, ASN harus berkoordinasi, menjaga keselamatan, dan memprioritaskan layanan esensial.",
    { A: 1, B: 2, C: 3, D: 5, E: 4 },
    {
      A: "Menunggu instruksi tanpa melakukan apa pun",
      B: "Tetap membuka seluruh layanan seperti biasa",
      C: "Menghentikan semua layanan tanpa informasi",
      D: "Berkoordinasi, memastikan keselamatan, dan menjalankan layanan esensial sesuai prosedur",
      E: "Mengumumkan perubahan layanan kepada masyarakat",
    }
  ),
  tkp(
    "Kotak masuk Anda penuh dengan permintaan dari berbagai unit. Anda...",
    "Manajemen Waktu",
    "MUDAH",
    "Manajemen waktu dilakukan dengan memilah prioritas berdasarkan urgensi dan dampak pekerjaan.",
    { A: 2, B: 1, C: 5, D: 4, E: 3 },
    {
      A: "Mengerjakan sesuai urutan pesan masuk",
      B: "Menunda semua sampai ada yang menanyakan",
      C: "Mengelompokkan berdasarkan urgensi, tenggat, dan dampak lalu menyelesaikan bertahap",
      D: "Mengonfirmasi prioritas kepada pemberi tugas bila perlu",
      E: "Memilih tugas yang paling mudah dahulu",
    }
  ),
  tkp(
    "Atasan memberi beberapa tugas dengan tenggat yang sama. Anda...",
    "Komunikasi Kerja",
    "SEDANG",
    "Jika prioritas belum jelas, komunikasi dengan atasan diperlukan agar tugas selesai sesuai kebutuhan organisasi.",
    { A: 2, B: 1, C: 5, D: 4, E: 3 },
    {
      A: "Mengerjakan semuanya sekaligus tanpa rencana",
      B: "Memilih tugas yang Anda sukai",
      C: "Mengklarifikasi prioritas, menyusun jadwal, dan melaporkan risiko keterlambatan",
      D: "Meminta bantuan tim jika beban melebihi kapasitas",
      E: "Menunggu atasan menanyakan progres",
    }
  ),
  tkp(
    "Tim ingin merayakan keberhasilan, tetapi laporan akhir belum selesai. Sikap Anda...",
    "Profesionalisme",
    "MUDAH",
    "Apresiasi boleh dilakukan setelah kewajiban utama diselesaikan atau diamankan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Ikut merayakan dan menunda laporan",
      B: "Menolak semua bentuk apresiasi",
      C: "Menyelesaikan laporan utama terlebih dahulu lalu ikut apresiasi tim",
      D: "Membagi tugas agar laporan selesai sebelum acara",
      E: "Meminta laporan dibuat oleh anggota lain saja",
    }
  ),
  tkp(
    "Pegawai baru sering bertanya hal yang sama. Anda...",
    "Mentoring",
    "MUDAH",
    "Membimbing pegawai baru dengan sabar dan memberi sumber belajar membantu kinerja tim.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memintanya belajar sendiri",
      B: "Menjawab singkat agar ia tidak bertanya lagi",
      C: "Menjelaskan dengan sabar dan memberi catatan atau panduan yang bisa dipelajari",
      D: "Mengarahkan ke mentor atau dokumen SOP yang relevan",
      E: "Mengambil alih pekerjaannya sementara",
    }
  ),
  tkp(
    "Anda diminta mempresentasikan data layanan di forum lintas instansi. Anda...",
    "Komunikasi Publik",
    "SEDANG",
    "Presentasi profesional perlu persiapan data, pesan utama, dan antisipasi pertanyaan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Menyampaikan apa adanya tanpa persiapan",
      B: "Menolak karena bukan tugas rutin",
      C: "Meminta data pendukung dari unit terkait",
      D: "Menyiapkan data valid, poin utama, dan kemungkinan pertanyaan",
      E: "Menggunakan materi lama agar cepat",
    }
  ),
  tkp(
    "Penerima layanan menawarkan barang sebagai ucapan terima kasih setelah proses selesai. Anda...",
    "Etika Publik",
    "MUDAH",
    "Etika publik dan aturan gratifikasi mengharuskan pegawai menolak pemberian terkait layanan.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Menerima karena proses sudah selesai",
      B: "Menerima lalu menyimpannya untuk kantor",
      C: "Menolak dengan sopan dan menjelaskan kewajiban menjaga integritas",
      D: "Menerima jika nilainya kecil",
      E: "Mencatat dan melaporkan jika barang tidak dapat dikembalikan",
    }
  ),
  tkp(
    "Kinerja Anda menurun karena masalah pribadi. Sikap yang paling tepat adalah...",
    "Pengendalian Diri",
    "SEDANG",
    "Masalah pribadi perlu dikelola agar tanggung jawab pekerjaan tetap terjaga dan bantuan diperoleh dengan tepat.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan pekerjaan tertunda sampai masalah selesai",
      B: "Menyalahkan keadaan kepada rekan kerja",
      C: "Mengatur ulang prioritas, menjaga komunikasi, dan meminta dukungan yang sesuai bila diperlukan",
      D: "Berkonsultasi dengan atasan terkait pembagian tugas sementara",
      E: "Mengambil cuti mendadak tanpa koordinasi",
    }
  ),
  tkp(
    "Ada perubahan kebijakan layanan yang perlu segera diketahui masyarakat. Anda...",
    "Komunikasi Publik",
    "SEDANG",
    "Perubahan kebijakan perlu disampaikan jelas melalui kanal resmi agar masyarakat tidak salah informasi.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menunggu masyarakat bertanya satu per satu",
      B: "Menyebarkan informasi lewat akun pribadi saja",
      C: "Menyiapkan informasi ringkas melalui kanal resmi dan memastikan petugas memahami perubahan",
      D: "Membuat daftar pertanyaan umum untuk membantu layanan",
      E: "Menyampaikan hanya kepada pemohon yang datang hari itu",
    }
  ),
  tkp(
    "Rekan kerja berbicara kasar kepada Anda saat tekanan pekerjaan tinggi. Anda...",
    "Pengendalian Diri",
    "SEDANG",
    "Pengendalian diri menjaga komunikasi tetap profesional dan membuka ruang penyelesaian setelah situasi tenang.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membalas dengan nada yang sama",
      B: "Meninggalkan pekerjaan tim",
      C: "Tetap tenang, menyelesaikan hal mendesak, lalu membicarakan masalah secara profesional",
      D: "Mengajak rekan menenangkan diri sebelum berdiskusi",
      E: "Langsung melaporkan tanpa mencoba klarifikasi",
    }
  ),
  tkp(
    "Anda menggunakan alat bantu digital untuk merangkum laporan. Sikap yang tepat adalah...",
    "Literasi Digital",
    "SEDANG",
    "Alat digital dapat membantu, tetapi hasilnya tetap perlu diverifikasi dan menjaga kerahasiaan data.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menggunakan hasilnya langsung tanpa membaca ulang",
      B: "Memasukkan semua data rahasia agar ringkasan lengkap",
      C: "Memakai sebagai bantuan, memverifikasi hasil, dan tidak memasukkan data rahasia",
      D: "Mencocokkan ringkasan dengan dokumen sumber sebelum digunakan",
      E: "Menolak semua alat digital karena berisiko",
    }
  ),
  tkp(
    "Anda menerima email mencurigakan yang meminta login akun kantor. Anda...",
    "Keamanan Informasi",
    "MUDAH",
    "Email phishing harus dihindari, tidak diklik, dan dilaporkan ke pengelola keamanan informasi.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membuka tautan untuk memastikan",
      B: "Meneruskan ke rekan agar mereka mengecek",
      C: "Tidak membuka tautan, melaporkan ke tim IT, dan mengikuti prosedur keamanan",
      D: "Menghapus email setelah mencatat pengirimnya",
      E: "Membalas email untuk menanyakan maksudnya",
    }
  ),
  tkp(
    "Pemohon layanan berasal dari daerah berbeda dan kurang memahami istilah teknis. Anda...",
    "Sosial Budaya",
    "MUDAH",
    "Komunikasi pelayanan harus mudah dipahami dan menghargai keragaman latar belakang masyarakat.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengulang istilah teknis dengan lebih keras",
      B: "Meminta pemohon mencari informasi sendiri",
      C: "Menjelaskan dengan bahasa sederhana dan memastikan pemohon memahami langkahnya",
      D: "Memberikan contoh dokumen atau alur yang mudah diikuti",
      E: "Mengarahkan ke petugas lain tanpa penjelasan",
    }
  ),
  tkp(
    "Tim Anda harus lembur beberapa hari karena volume layanan meningkat. Anda sebagai koordinator...",
    "Kepemimpinan",
    "SULIT",
    "Koordinator perlu menjaga target layanan sekaligus memperhatikan beban kerja dan kesejahteraan tim.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Meminta semua anggota lembur tanpa pengecualian",
      B: "Membiarkan anggota mengatur sendiri tanpa koordinasi",
      C: "Menyampaikan apresiasi dan mencatat kebutuhan kompensasi sesuai aturan",
      D: "Mengatur pembagian beban, prioritas layanan, dan waktu istirahat secara adil",
      E: "Mengurangi kualitas pemeriksaan agar cepat selesai",
    }
  ),
  tkp(
    "Anda mendapat tugas lapangan mendadak saat pekerjaan administrasi juga harus selesai hari itu. Sikap Anda...",
    "Prioritas Kerja",
    "SEDANG",
    "Prioritas kerja perlu dikomunikasikan agar tugas mendesak tetap tertangani tanpa mengabaikan tanggung jawab lain.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menolak tugas lapangan karena administrasi belum selesai",
      B: "Mengerjakan keduanya tanpa memberi kabar perkembangan",
      C: "Mengklarifikasi urgensi, menyusun prioritas, dan mengoordinasikan dukungan untuk pekerjaan yang tertunda",
      D: "Menyampaikan risiko keterlambatan kepada atasan sejak awal",
      E: "Menunda administrasi sampai esok hari tanpa koordinasi",
    }
  ),
];

function assertSeedData(): void {
  const counts: Record<Subtes, number> = { TWK: 0, TIU: 0, TKP: 0 };

  for (const [index, soal] of soalCpnsSkdPaketC.entries()) {
    counts[soal.subtes] += 1;

    if (soal.opsi.length !== 5) {
      throw new Error(`Soal ke-${index + 1} tidak memiliki 5 opsi.`);
    }

    const correctCount = soal.opsi.filter((opsi) => opsi.isBenar).length;
    if (correctCount !== 1) {
      throw new Error(
        `Soal ke-${index + 1} harus punya tepat 1 jawaban utama.`
      );
    }

    if (
      soal.subtes === "TKP" &&
      !soal.opsi.every((opsi) => opsi.nilaiTkp !== undefined)
    ) {
      throw new Error(
        `Soal TKP ke-${index + 1} belum memiliki nilaiTkp lengkap.`
      );
    }
  }

  if (counts.TWK !== 30 || counts.TIU !== 35 || counts.TKP !== 45) {
    throw new Error(
      `Jumlah soal tidak sesuai. TWK=${counts.TWK}, TIU=${counts.TIU}, TKP=${counts.TKP}.`
    );
  }
}

export async function seedCpnsPaketC(createdById: string) {
  console.log("Seeding paket CPNS SKD Premium - Paket C...");
  console.log(`Referensi: ${BANK_SOAL_REFERENCE}`);

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required.");
  }

  assertSeedData();

  const existing = await prisma.paketTryout.findUnique({
    where: { slug: PAKET_SLUG },
  });

  if (existing) {
    console.log("Paket C sudah ada, skip.");
    return;
  }

  const soalIds: string[] = [];

  for (const soal of soalCpnsSkdPaketC) {
    const created = await prisma.soal.create({
      data: {
        konten: soal.konten,
        topik: soal.topik,
        tingkatKesulitan: soal.tingkatKesulitan as never,
        pembahasanTeks: soal.pembahasanTeks,
        kategori: "CPNS_SKD",
        subtes: soal.subtes as never,
        tipe: "PILIHAN_GANDA",
        createdById,
        opsi: { create: soal.opsi },
      },
    });

    soalIds.push(created.id);
  }

  console.log("30 soal TWK dibuat");
  console.log("35 soal TIU dibuat");
  console.log("45 soal TKP dibuat");

  const paket = await prisma.paketTryout.create({
    data: {
      slug: PAKET_SLUG,
      judul: "Tryout SKD CPNS Premium - Paket C",
      deskripsi:
        "Paket C berisi 110 soal latihan CPNS SKD yang disusun sebagai variasi orisinal dari pola bank soal tahun lalu, lengkap dengan pembahasan TWK, TIU, dan TKP.",
      kategori: "CPNS_SKD",
      durasi: 100,
      totalSoal: soalIds.length,
      harga: 75000,
      modelAkses: "BERBAYAR",
      status: "PUBLISHED",
      passingGrade: { twk: 65, tiu: 80, tkp: 166, total: 311 },
      konfigurasi: {
        twk: { jumlahSoal: 30, nilaiBenar: 5, nilaiSalah: 0 },
        tiu: { jumlahSoal: 35, nilaiBenar: 5, nilaiSalah: 0 },
        tkp: { jumlahSoal: 45, skala: [1, 2, 3, 4, 5] },
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

  console.log("Paket dibuat:", paket.judul);
  console.log("Harga: Rp", paket.harga.toString());
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

  await seedCpnsPaketC(instruktur.id);
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
