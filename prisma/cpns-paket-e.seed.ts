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

type PgSeedTuple = [
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  jawaban: Label,
  opsi: Record<Label, string>,
];

type TkpScenario = {
  konten: string;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  pembahasanTeks: string;
  terbaik: string;
  baik: string;
};

const LABELS: Label[] = ["A", "B", "C", "D", "E"];
const PAKET_SLUG = "tryout-skd-cpns-premium-paket-e";
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
  terbaik: string,
  baik: string
): SoalSeed {
  return {
    konten,
    topik,
    tingkatKesulitan,
    pembahasanTeks,
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengabaikan situasi karena tidak langsung terkait tugas Anda",
        B: "Mengambil tindakan cepat tanpa memeriksa aturan atau dampaknya",
        C: "Menunggu arahan atasan tanpa melakukan langkah awal yang memungkinkan",
        D: terbaik,
        E: baik,
      }
    ),
  };
}

const twkData: PgSeedTuple[] = [
  [
    "Pancasila sebagai pandangan hidup bangsa berarti Pancasila berfungsi sebagai...",
    "Pancasila",
    "MUDAH",
    "Sebagai pandangan hidup, Pancasila menjadi pedoman bersikap dan bertindak dalam kehidupan bermasyarakat, berbangsa, dan bernegara.",
    "B",
    {
      A: "Aturan teknis penyusunan anggaran",
      B: "Pedoman nilai dalam bersikap dan bertindak",
      C: "Dokumen administratif pemerintah",
      D: "Pengganti seluruh undang-undang",
      E: "Sistem pemilihan pejabat negara",
    },
  ],
  [
    "Sila kedua Pancasila dalam pelayanan publik paling tepat diwujudkan dengan...",
    "Pancasila",
    "MUDAH",
    "Sila Kemanusiaan yang Adil dan Beradab menuntut penghormatan terhadap martabat manusia dan perlakuan yang beradab.",
    "D",
    {
      A: "Membedakan layanan berdasarkan status sosial",
      B: "Mendahulukan orang yang memberi imbalan",
      C: "Mengutamakan warga dari kelompok tertentu",
      D: "Memperlakukan setiap warga secara manusiawi dan bermartabat",
      E: "Membatasi informasi layanan kepada sebagian pemohon",
    },
  ],
  [
    "Makna sila keempat Pancasila dalam pengambilan keputusan organisasi adalah...",
    "Pancasila",
    "SEDANG",
    "Sila keempat menekankan musyawarah, kebijaksanaan, dan penghormatan terhadap keputusan bersama.",
    "A",
    {
      A: "Mengutamakan musyawarah dengan pertimbangan bijaksana",
      B: "Mengikuti pendapat orang paling senior tanpa diskusi",
      C: "Mengambil keputusan sepihak agar cepat",
      D: "Membiarkan konflik pendapat tanpa penyelesaian",
      E: "Mengabaikan pendapat minoritas dalam semua keadaan",
    },
  ],
  [
    "Pembukaan UUD 1945 alinea kedua memuat gagasan bahwa perjuangan kemerdekaan Indonesia telah...",
    "UUD 1945",
    "SEDANG",
    "Alinea kedua Pembukaan UUD 1945 menyatakan perjuangan kemerdekaan telah sampai kepada saat yang berbahagia.",
    "C",
    {
      A: "Diberikan sepenuhnya oleh bangsa lain",
      B: "Tidak membutuhkan persatuan nasional",
      C: "Sampai kepada saat yang berbahagia",
      D: "Berakhir setelah pembentukan BPUPKI",
      E: "Hanya dilakukan oleh satu golongan",
    },
  ],
  [
    "Pembukaan UUD 1945 alinea ketiga menegaskan bahwa kemerdekaan Indonesia terjadi atas...",
    "UUD 1945",
    "SEDANG",
    "Alinea ketiga menegaskan kemerdekaan terjadi atas berkat rahmat Allah Yang Maha Kuasa dan didorong keinginan luhur.",
    "E",
    {
      A: "Keputusan sepihak pemerintah kolonial",
      B: "Kesepakatan negara-negara asing",
      C: "Hasil pemungutan suara internasional",
      D: "Perintah organisasi regional",
      E: "Berkat rahmat Allah Yang Maha Kuasa dan keinginan luhur",
    },
  ],
  [
    "Kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD diatur dalam UUD 1945 Pasal...",
    "UUD 1945",
    "MUDAH",
    "Pasal 1 ayat (2) UUD 1945 menyatakan kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD.",
    "B",
    {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (1)",
    },
  ],
  [
    "Hak untuk hidup serta mempertahankan hidup dan kehidupannya diatur dalam UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 28A UUD 1945 mengatur hak setiap orang untuk hidup serta mempertahankan hidup dan kehidupannya.",
    "A",
    {
      A: "28A",
      B: "28B ayat (1)",
      C: "28C ayat (1)",
      D: "28D ayat (1)",
      E: "29 ayat (2)",
    },
  ],
  [
    "Hak memperoleh pelayanan kesehatan tercakup dalam UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 28H ayat (1) UUD 1945 memuat hak hidup sejahtera lahir batin, bertempat tinggal, lingkungan baik dan sehat, serta pelayanan kesehatan.",
    "D",
    {
      A: "27 ayat (2)",
      B: "28E ayat (3)",
      C: "28G ayat (1)",
      D: "28H ayat (1)",
      E: "31 ayat (1)",
    },
  ],
  [
    "Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan adalah ketentuan UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 33 ayat (1) UUD 1945 mengatur perekonomian disusun sebagai usaha bersama berdasar asas kekeluargaan.",
    "C",
    {
      A: "31 ayat (1)",
      B: "32 ayat (1)",
      C: "33 ayat (1)",
      D: "33 ayat (3)",
      E: "34 ayat (2)",
    },
  ],
  [
    "Negara mengembangkan sistem jaminan sosial bagi seluruh rakyat merupakan amanat UUD 1945 Pasal...",
    "UUD 1945",
    "SULIT",
    "Pasal 34 ayat (2) UUD 1945 mengatur negara mengembangkan sistem jaminan sosial bagi seluruh rakyat.",
    "E",
    {
      A: "28A",
      B: "28D ayat (1)",
      C: "31 ayat (2)",
      D: "33 ayat (4)",
      E: "34 ayat (2)",
    },
  ],
  [
    "Presiden Republik Indonesia memegang kekuasaan pemerintahan menurut UUD. Hal ini diatur dalam Pasal...",
    "Lembaga Negara",
    "SEDANG",
    "Pasal 4 ayat (1) UUD 1945 menyatakan Presiden memegang kekuasaan pemerintahan menurut UUD.",
    "A",
    { A: "4 ayat (1)", B: "5 ayat (1)", C: "7", D: "10", E: "17 ayat (1)" },
  ],
  [
    "Fungsi anggaran DPR terutama berkaitan dengan...",
    "Lembaga Negara",
    "MUDAH",
    "Fungsi anggaran DPR berkaitan dengan pembahasan dan persetujuan APBN bersama pemerintah.",
    "B",
    {
      A: "Pengujian undang-undang terhadap UUD",
      B: "Pembahasan dan persetujuan APBN",
      C: "Pengangkatan hakim konstitusi secara penuh",
      D: "Pemeriksaan keuangan negara",
      E: "Penyelesaian sengketa pilkada",
    },
  ],
  [
    "DPD dapat mengajukan rancangan undang-undang yang berkaitan dengan...",
    "Lembaga Negara",
    "SEDANG",
    "DPD dapat mengajukan RUU tertentu, antara lain yang berkaitan dengan otonomi daerah dan hubungan pusat-daerah.",
    "C",
    {
      A: "Pembentukan kabinet",
      B: "Pengangkatan menteri",
      C: "Otonomi daerah dan hubungan pusat-daerah",
      D: "Pembubaran partai politik",
      E: "Penetapan putusan pidana",
    },
  ],
  [
    "Komisi Yudisial memiliki kewenangan antara lain...",
    "Lembaga Negara",
    "SEDANG",
    "Komisi Yudisial berwenang mengusulkan pengangkatan hakim agung dan menjaga kehormatan serta perilaku hakim.",
    "D",
    {
      A: "Menguji undang-undang terhadap UUD",
      B: "Membentuk undang-undang bersama Presiden",
      C: "Memeriksa penggunaan APBN",
      D: "Mengusulkan pengangkatan hakim agung",
      E: "Mengangkat kepala daerah",
    },
  ],
  [
    "Mahkamah Konstitusi berwenang memutus pembubaran...",
    "Lembaga Negara",
    "SULIT",
    "Salah satu kewenangan Mahkamah Konstitusi adalah memutus pembubaran partai politik.",
    "E",
    {
      A: "Pemerintah daerah",
      B: "Kementerian negara",
      C: "Dewan Perwakilan Rakyat",
      D: "Badan Pemeriksa Keuangan",
      E: "Partai politik",
    },
  ],
  [
    "Bendera Negara Indonesia ialah Sang Merah Putih. Ketentuan ini tercantum dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 35 UUD 1945 menyatakan bendera negara Indonesia ialah Sang Merah Putih.",
    "A",
    { A: "35", B: "36", C: "36A", D: "36B", E: "37" },
  ],
  [
    "Bahasa negara ialah Bahasa Indonesia. Ketentuan ini tercantum dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 36 UUD 1945 menyatakan bahasa negara ialah Bahasa Indonesia.",
    "B",
    { A: "35", B: "36", C: "36A", D: "36B", E: "37" },
  ],
  [
    "Lambang negara Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika diatur dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 36A UUD 1945 mengatur lambang negara Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.",
    "C",
    { A: "35", B: "36", C: "36A", D: "36B", E: "37" },
  ],
  [
    "Sumpah Pemuda menegaskan tiga ikrar utama, yaitu satu tanah air, satu bangsa, dan...",
    "Sejarah Nasional",
    "MUDAH",
    "Sumpah Pemuda menegaskan satu tanah air, satu bangsa, dan satu bahasa persatuan, Indonesia.",
    "D",
    {
      A: "Satu pemerintahan daerah",
      B: "Satu organisasi politik",
      C: "Satu sistem ekonomi",
      D: "Satu bahasa persatuan",
      E: "Satu kabinet nasional",
    },
  ],
  [
    "Ketua BPUPKI adalah...",
    "Sejarah Nasional",
    "SEDANG",
    "BPUPKI diketuai oleh dr. Radjiman Wedyodiningrat.",
    "A",
    {
      A: "Radjiman Wedyodiningrat",
      B: "Soekarno",
      C: "Mohammad Hatta",
      D: "Soepomo",
      E: "Ahmad Soebardjo",
    },
  ],
  [
    "Panitia Sembilan berperan penting dalam penyusunan...",
    "Sejarah Pancasila",
    "SEDANG",
    "Panitia Sembilan menyusun Piagam Jakarta pada 22 Juni 1945.",
    "C",
    {
      A: "Dekrit Presiden",
      B: "Naskah Sumpah Pemuda",
      C: "Piagam Jakarta",
      D: "Amandemen UUD 1945",
      E: "Undang-Undang Pemilu pertama",
    },
  ],
  [
    "Peristiwa Rengasdengklok terjadi menjelang...",
    "Sejarah Nasional",
    "MUDAH",
    "Peristiwa Rengasdengklok terjadi menjelang Proklamasi Kemerdekaan Indonesia 17 Agustus 1945.",
    "E",
    {
      A: "Sumpah Pemuda",
      B: "Pembentukan BPUPKI",
      C: "Pemilu pertama",
      D: "Dekrit Presiden",
      E: "Proklamasi Kemerdekaan",
    },
  ],
  [
    "Tokoh yang dikenal menjahit bendera pusaka Merah Putih adalah...",
    "Sejarah Nasional",
    "MUDAH",
    "Fatmawati dikenal sebagai tokoh yang menjahit bendera pusaka Merah Putih.",
    "B",
    {
      A: "Cut Nyak Dien",
      B: "Fatmawati",
      C: "Kartini",
      D: "Dewi Sartika",
      E: "Maria Walanda Maramis",
    },
  ],
  [
    "Wawasan Nusantara memandang bangsa Indonesia sebagai satu kesatuan...",
    "Wawasan Kebangsaan",
    "SEDANG",
    "Wawasan Nusantara memandang Indonesia sebagai satu kesatuan politik, ekonomi, sosial budaya, serta pertahanan dan keamanan.",
    "A",
    {
      A: "Politik, ekonomi, sosial budaya, dan pertahanan keamanan",
      B: "Suku yang berdiri sendiri-sendiri",
      C: "Wilayah ekonomi tanpa ikatan nasional",
      D: "Daerah otonom tanpa pemerintah pusat",
      E: "Organisasi masyarakat yang terpisah",
    },
  ],
  [
    "Hak dan kewajiban warga negara dalam upaya pembelaan negara diatur dalam UUD 1945 Pasal...",
    "Bela Negara",
    "MUDAH",
    "Pasal 27 ayat (3) UUD 1945 mengatur hak dan kewajiban warga negara dalam upaya pembelaan negara.",
    "C",
    {
      A: "27 ayat (1)",
      B: "27 ayat (2)",
      C: "27 ayat (3)",
      D: "28A",
      E: "30 ayat (1)",
    },
  ],
  [
    "Salah satu nilai dasar bela negara adalah setia kepada...",
    "Bela Negara",
    "MUDAH",
    "Nilai dasar bela negara mencakup setia kepada Pancasila sebagai ideologi negara.",
    "D",
    {
      A: "Kepentingan pribadi",
      B: "Golongan tertentu",
      C: "Kekuatan asing",
      D: "Pancasila sebagai ideologi negara",
      E: "Pimpinan organisasi informal",
    },
  ],
  [
    "Menolak permintaan mempercepat layanan tanpa prosedur mencerminkan nilai...",
    "Integritas",
    "MUDAH",
    "Menolak layanan tanpa prosedur menunjukkan integritas, keadilan, dan komitmen antikorupsi.",
    "B",
    {
      A: "Eksklusivitas",
      B: "Integritas dan antikorupsi",
      C: "Kompetisi personal",
      D: "Kedekatan sosial",
      E: "Kepentingan kelompok",
    },
  ],
  [
    "Bentuk Negara Kesatuan Republik Indonesia tidak dapat dilakukan perubahan berdasarkan UUD 1945 Pasal...",
    "NKRI",
    "SULIT",
    "Pasal 37 ayat (5) UUD 1945 menegaskan bentuk NKRI tidak dapat dilakukan perubahan.",
    "E",
    {
      A: "1 ayat (1)",
      B: "27 ayat (3)",
      C: "30 ayat (1)",
      D: "33 ayat (3)",
      E: "37 ayat (5)",
    },
  ],
  [
    "Otonomi daerah dalam NKRI harus dilaksanakan dengan prinsip...",
    "NKRI",
    "SEDANG",
    "Otonomi daerah dilaksanakan untuk meningkatkan pelayanan dan kesejahteraan masyarakat dengan tetap menjaga keutuhan NKRI.",
    "A",
    {
      A: "Memperkuat pelayanan masyarakat dalam kerangka NKRI",
      B: "Melepaskan daerah dari hukum nasional",
      C: "Mengutamakan kepentingan daerah di atas konstitusi",
      D: "Menghapus kewenangan pemerintah pusat",
      E: "Membentuk negara bagian yang berdiri sendiri",
    },
  ],
  [
    "Dalam menghadapi pengaruh globalisasi, sikap yang sesuai dengan Pancasila adalah...",
    "Nasionalisme",
    "SEDANG",
    "Pengaruh globalisasi perlu disaring dengan nilai Pancasila tanpa menutup diri dari kemajuan yang positif.",
    "C",
    {
      A: "Menolak seluruh perkembangan luar negeri",
      B: "Menerima semua budaya asing tanpa seleksi",
      C: "Menyaring pengaruh luar dengan nilai Pancasila",
      D: "Mengabaikan identitas nasional",
      E: "Mengutamakan gaya hidup konsumtif",
    },
  ],
];

const tiuData: PgSeedTuple[] = [
  [
    "Jika 7x + 5 = 54, maka nilai x adalah...",
    "Matematika Dasar",
    "MUDAH",
    "7x + 5 = 54, sehingga 7x = 49 dan x = 7.",
    "C",
    { A: "5", B: "6", C: "7", D: "8", E: "9" },
  ],
  [
    "Deret 6, 11, 21, 41, 81, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Pola deret adalah dikali 2 dikurangi 1. Setelah 81 menjadi 161.",
    "E",
    { A: "121", B: "141", C: "151", D: "159", E: "161" },
  ],
  [
    "Deret 2, 6, 18, 54, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Setiap suku dikali 3, sehingga 54 x 3 = 162.",
    "D",
    { A: "108", B: "126", C: "144", D: "162", E: "180" },
  ],
  [
    "Deret 1, 3, 6, 10, 15, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Selisih deret bertambah 2, 3, 4, 5, sehingga berikutnya tambah 6 menjadi 21.",
    "B",
    { A: "20", B: "21", C: "22", D: "24", E: "25" },
  ],
  [
    "Deret huruf A, B, D, G, K, ... Huruf berikutnya adalah...",
    "Deret Huruf",
    "SEDANG",
    "Posisi huruf bertambah 1, 2, 3, 4, sehingga berikutnya bertambah 5 dari K menjadi P.",
    "C",
    { A: "M", B: "N", C: "P", D: "Q", E: "R" },
  ],
  [
    "Harga barang Rp 420.000 mendapat diskon 20%. Harga setelah diskon adalah...",
    "Persentase",
    "MUDAH",
    "Diskon = 20% x 420.000 = 84.000, sehingga harga akhir 336.000.",
    "A",
    {
      A: "Rp 336.000",
      B: "Rp 346.000",
      C: "Rp 356.000",
      D: "Rp 366.000",
      E: "Rp 376.000",
    },
  ],
  [
    "Perbandingan peserta pria dan wanita adalah 4 : 5. Jika total peserta 81, jumlah peserta wanita adalah...",
    "Perbandingan",
    "SEDANG",
    "Total bagian 9. Wanita = 5/9 x 81 = 45.",
    "D",
    { A: "36", B: "40", C: "42", D: "45", E: "48" },
  ],
  [
    "Sebuah kendaraan berjalan 75 km/jam selama 2 jam 24 menit. Jarak yang ditempuh adalah...",
    "Kecepatan",
    "SEDANG",
    "2 jam 24 menit = 2,4 jam. Jarak = 75 x 2,4 = 180 km.",
    "C",
    { A: "160 km", B: "170 km", C: "180 km", D: "190 km", E: "200 km" },
  ],
  [
    "Rata-rata 8 nilai adalah 70. Jika satu nilai 86 ditambahkan, rata-rata baru adalah...",
    "Statistika",
    "SEDANG",
    "Total awal = 8 x 70 = 560. Total baru = 646. Rata-rata baru = 646/9 = 71,78.",
    "E",
    { A: "70,75", B: "71,00", C: "71,25", D: "71,50", E: "71,78" },
  ],
  [
    "Persegi panjang memiliki panjang 18 cm dan lebar 11 cm. Luasnya adalah...",
    "Geometri",
    "MUDAH",
    "Luas persegi panjang = 18 x 11 = 198 cm2.",
    "B",
    { A: "188 cm2", B: "198 cm2", C: "208 cm2", D: "218 cm2", E: "228 cm2" },
  ],
  [
    "Volume balok dengan panjang 10 cm, lebar 6 cm, dan tinggi 5 cm adalah...",
    "Geometri",
    "MUDAH",
    "Volume balok = 10 x 6 x 5 = 300 cm3.",
    "D",
    { A: "180 cm3", B: "240 cm3", C: "280 cm3", D: "300 cm3", E: "360 cm3" },
  ],
  [
    "A dapat menyelesaikan pekerjaan dalam 8 hari, B dalam 12 hari. Bersama-sama selesai dalam...",
    "Aritmetika Sosial",
    "SEDANG",
    "Kecepatan bersama = 1/8 + 1/12 = 5/24, sehingga waktu = 24/5 = 4,8 hari.",
    "C",
    { A: "3,6 hari", B: "4 hari", C: "4,8 hari", D: "5 hari", E: "6 hari" },
  ],
  [
    "Dalam kotak terdapat 5 bola merah, 3 bola hijau, dan 2 bola biru. Peluang mengambil bola hijau adalah...",
    "Peluang",
    "MUDAH",
    "Total bola 10 dan bola hijau 3, sehingga peluangnya 3/10.",
    "A",
    { A: "3/10", B: "2/10", C: "5/10", D: "3/7", E: "7/10" },
  ],
  [
    "Dari 7 orang dipilih ketua dan wakil ketua. Banyak cara pemilihan adalah...",
    "Kombinatorika",
    "SEDANG",
    "Ketua dapat dipilih 7 cara dan wakil 6 cara, sehingga 42 cara.",
    "E",
    { A: "21", B: "28", C: "35", D: "40", E: "42" },
  ],
  [
    "Lima dokumen akan disusun berurutan. Banyak susunan yang mungkin adalah...",
    "Kombinatorika",
    "MUDAH",
    "Banyak susunan 5 dokumen berbeda adalah 5! = 120.",
    "D",
    { A: "24", B: "60", C: "100", D: "120", E: "150" },
  ],
  [
    "Jika 5(x - 4) = 35, maka nilai x adalah...",
    "Aljabar",
    "MUDAH",
    "5(x - 4) = 35 berarti x - 4 = 7, sehingga x = 11.",
    "C",
    { A: "7", B: "9", C: "11", D: "13", E: "15" },
  ],
  [
    "Nilai 150 dinaikkan 20%, lalu hasilnya dinaikkan lagi 10%. Nilai akhirnya adalah...",
    "Persentase",
    "SEDANG",
    "150 naik 20% menjadi 180. Naik 10% lagi menjadi 198.",
    "B",
    { A: "190", B: "198", C: "200", D: "205", E: "210" },
  ],
  [
    "Nilai 5/8 dari 160 adalah...",
    "Pecahan",
    "MUDAH",
    "5/8 x 160 = 100.",
    "E",
    { A: "80", B: "85", C: "90", D: "95", E: "100" },
  ],
  [
    "Sinonim kata presisi adalah...",
    "Verbal",
    "MUDAH",
    "Presisi bermakna tepat atau akurat.",
    "A",
    { A: "Akurat", B: "Kabur", C: "Lambat", D: "Rancu", E: "Luas" },
  ],
  [
    "Antonim kata optimis adalah...",
    "Verbal",
    "MUDAH",
    "Optimis berarti berpandangan baik terhadap hasil. Lawan katanya adalah pesimis.",
    "C",
    { A: "Yakin", B: "Percaya", C: "Pesimis", D: "Berani", E: "Teguh" },
  ],
  [
    "HAKIM : PUTUSAN = DOKTER : ...",
    "Analogi",
    "MUDAH",
    "Hakim menghasilkan putusan, dokter menghasilkan diagnosis.",
    "D",
    { A: "Rumah sakit", B: "Pasien", C: "Obat", D: "Diagnosis", E: "Perawat" },
  ],
  [
    "PETANI : PADI = NELAYAN : ...",
    "Analogi",
    "MUDAH",
    "Petani berkaitan dengan padi, nelayan berkaitan dengan ikan.",
    "B",
    { A: "Laut", B: "Ikan", C: "Perahu", D: "Jaring", E: "Dermaga" },
  ],
  [
    "GURU : MURID = PELATIH : ...",
    "Analogi",
    "MUDAH",
    "Guru membimbing murid, pelatih membimbing atlet.",
    "A",
    { A: "Atlet", B: "Lapangan", C: "Pertandingan", D: "Wasit", E: "Klub" },
  ],
  [
    "Semua auditor memeriksa laporan. Sari adalah auditor. Kesimpulan yang tepat adalah...",
    "Penalaran Logis",
    "MUDAH",
    "Jika semua auditor memeriksa laporan dan Sari auditor, maka Sari memeriksa laporan.",
    "E",
    {
      A: "Sari bukan auditor",
      B: "Semua pemeriksa laporan adalah auditor",
      C: "Sari mungkin tidak memeriksa laporan",
      D: "Tidak dapat disimpulkan",
      E: "Sari memeriksa laporan",
    },
  ],
  [
    "Negasi dari pernyataan Semua loket dibuka tepat waktu adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Negasi dari semua loket dibuka tepat waktu adalah ada loket yang tidak dibuka tepat waktu.",
    "B",
    {
      A: "Semua loket tidak dibuka tepat waktu",
      B: "Ada loket yang tidak dibuka tepat waktu",
      C: "Tidak ada loket yang dibuka",
      D: "Sebagian loket dibuka tepat waktu",
      E: "Loket dibuka lebih awal",
    },
  ],
  [
    "Jika jaringan stabil maka aplikasi berjalan lancar. Aplikasi tidak berjalan lancar. Kesimpulan yang benar adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Modus tollens: jika P maka Q, tidak Q, maka tidak P. Jadi jaringan tidak stabil.",
    "D",
    {
      A: "Jaringan stabil",
      B: "Aplikasi berjalan lancar",
      C: "Tidak dapat disimpulkan",
      D: "Jaringan tidak stabil",
      E: "Aplikasi tidak digunakan",
    },
  ],
  [
    "Bacalah kalimat berikut. Pengarsipan digital memudahkan pencarian dokumen, tetapi memerlukan pengamanan akses yang ketat. Ide pokok kalimat tersebut adalah...",
    "Pemahaman Bacaan",
    "MUDAH",
    "Ide pokoknya adalah manfaat pengarsipan digital disertai kebutuhan pengamanan akses.",
    "C",
    {
      A: "Dokumen sulit ditemukan",
      B: "Akses digital tidak perlu diamankan",
      C: "Pengarsipan digital memudahkan pencarian tetapi perlu pengamanan",
      D: "Pengarsipan manual lebih aman",
      E: "Semua dokumen harus dibuka publik",
    },
  ],
  [
    "Data menunjukkan warga lebih cepat menyelesaikan berkas setelah contoh formulir disediakan. Kesimpulan paling tepat adalah...",
    "Penalaran Analitis",
    "SEDANG",
    "Contoh formulir membantu warga memahami cara pengisian sehingga proses menjadi lebih cepat.",
    "A",
    {
      A: "Contoh formulir membantu mempercepat penyelesaian berkas",
      B: "Contoh formulir memperlambat layanan",
      C: "Berkas tidak perlu diverifikasi",
      D: "Warga tidak membutuhkan petugas",
      E: "Semua warga mengisi formulir dengan salah",
    },
  ],
  [
    "Jika RAPI dikodekan menjadi SBQJ dengan pergeseran huruf +1, maka DUKA dikodekan menjadi...",
    "Kode Huruf",
    "SEDANG",
    "Setiap huruf digeser satu posisi: D-E, U-V, K-L, A-B.",
    "E",
    { A: "EVKA", B: "EUKB", C: "FWLB", D: "EVMB", E: "EVLB" },
  ],
  [
    "Kata yang tidak sekelompok adalah...",
    "Klasifikasi Verbal",
    "MUDAH",
    "Kemeja, jaket, celana, dan rok adalah pakaian. Piring bukan pakaian.",
    "D",
    { A: "Kemeja", B: "Jaket", C: "Celana", D: "Piring", E: "Rok" },
  ],
  [
    "PANAS : DINGIN = TERANG : ...",
    "Analogi",
    "MUDAH",
    "Panas berlawanan dengan dingin, terang berlawanan dengan gelap.",
    "A",
    { A: "Gelap", B: "Cerah", C: "Sinar", D: "Lampu", E: "Putih" },
  ],
  [
    "Jika x = 30% dari 250 dan y = 3/4 dari 100, maka hubungan x dan y adalah...",
    "Perbandingan Kuantitatif",
    "MUDAH",
    "x = 75 dan y = 75, sehingga x = y.",
    "C",
    {
      A: "x > y",
      B: "x < y",
      C: "x = y",
      D: "x + y = 125",
      E: "Tidak dapat ditentukan",
    },
  ],
  [
    "Sebuah rapat dimulai pukul 13.20 dan berlangsung 2 jam 15 menit. Rapat selesai pukul...",
    "Aritmetika Waktu",
    "MUDAH",
    "13.20 ditambah 2 jam 15 menit menjadi 15.35.",
    "B",
    { A: "15.25", B: "15.35", C: "15.45", D: "15.50", E: "16.00" },
  ],
  [
    "Bentuk sederhana dari 24/36 adalah...",
    "Pecahan",
    "MUDAH",
    "24/36 disederhanakan dengan membagi 12 menjadi 2/3.",
    "D",
    { A: "1/2", B: "3/4", C: "4/5", D: "2/3", E: "5/6" },
  ],
  [
    "Ayu 6 tahun lebih muda dari Beni. Jumlah umur mereka 54 tahun. Umur Beni adalah...",
    "Aritmetika Sosial",
    "SEDANG",
    "Misal umur Ayu x, maka Beni x + 6. Jumlah 2x + 6 = 54, x = 24, sehingga Beni 30 tahun.",
    "E",
    {
      A: "24 tahun",
      B: "26 tahun",
      C: "28 tahun",
      D: "29 tahun",
      E: "30 tahun",
    },
  ],
];

const tkpScenarios: TkpScenario[] = [
  {
    konten:
      "Sistem layanan daring melambat saat banyak warga mengakses. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Gangguan layanan perlu ditangani dengan koordinasi teknis, prosedur cadangan, dan komunikasi jelas kepada pengguna.",
    terbaik:
      "Melaporkan ke tim teknis, mengaktifkan prosedur sementara yang sah, dan memberi informasi jelas kepada warga",
    baik: "Mencatat kendala serta membantu warga menyelesaikan langkah yang masih bisa dilakukan",
  },
  {
    konten:
      "Seorang warga tidak membawa satu dokumen pendukung karena tidak membaca informasi terbaru. Anda...",
    topik: "Pelayanan Publik",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pelayanan yang baik menjelaskan kekurangan dokumen dengan ramah dan memberi arahan yang jelas.",
    terbaik:
      "Menjelaskan dokumen yang kurang, menunjukkan sumber informasi resmi, dan memberi arahan langkah berikutnya",
    baik: "Memberikan daftar persyaratan agar warga dapat melengkapi berkas dengan benar",
  },
  {
    konten:
      "Anda menemukan berkas yang diproses rekan memiliki tanda tangan yang meragukan. Anda...",
    topik: "Integritas",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Dugaan ketidaksahihan dokumen harus diverifikasi sebelum diproses lebih lanjut.",
    terbaik:
      "Menahan proses sementara, memverifikasi ke sumber resmi, dan mencatat langkah pemeriksaan",
    baik: "Berkonsultasi dengan pejabat berwenang agar keputusan sesuai prosedur",
  },
  {
    konten:
      "Teman lama meminta Anda memberi informasi internal tentang jadwal rekrutmen yang belum diumumkan. Anda...",
    topik: "Kerahasiaan",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Informasi internal harus dijaga sampai diumumkan melalui kanal resmi.",
    terbaik:
      "Menolak memberi informasi internal dan mengarahkan teman menunggu pengumuman resmi",
    baik: "Menjelaskan bahwa semua peserta harus memperoleh informasi dari kanal yang sama",
  },
  {
    konten:
      "Rekan kerja baru tampak kesulitan menggunakan aplikasi kantor. Anda...",
    topik: "Kerja Sama",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Membantu rekan beradaptasi akan memperkuat kinerja tim dan mutu layanan.",
    terbaik:
      "Membimbingnya menggunakan fitur utama dan memberi rujukan panduan agar ia bisa mandiri",
    baik: "Menawarkan sesi singkat untuk membahas kendala yang paling sering muncul",
  },
  {
    konten:
      "Anda diminta mengerjakan laporan, tetapi data dari unit lain belum masuk. Anda...",
    topik: "Orientasi Hasil",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Orientasi hasil menuntut tindak lanjut aktif dan komunikasi risiko keterlambatan.",
    terbaik:
      "Menghubungi pemilik data, menyusun bagian yang tersedia, dan memberi update risiko kepada atasan",
    baik: "Membuat daftar data yang belum masuk dan tenggat pengirimannya",
  },
  {
    konten: "Ada perbedaan pendapat tajam dalam rapat tim. Anda...",
    topik: "Komunikasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Perbedaan pendapat perlu diarahkan ke fakta dan tujuan bersama agar keputusan tetap produktif.",
    terbaik:
      "Mengajak tim kembali pada data, tujuan rapat, dan opsi keputusan yang dapat disepakati",
    baik: "Merangkum perbedaan pandangan agar pembahasan lebih terarah",
  },
  {
    konten:
      "Atasan memberi tugas tambahan saat pekerjaan utama Anda mendekati tenggat. Anda...",
    topik: "Manajemen Waktu",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Prioritas perlu diklarifikasi agar semua tugas penting tertangani secara realistis.",
    terbaik:
      "Mengklarifikasi prioritas, menyusun ulang jadwal, dan menyampaikan risiko bila ada tenggat yang terdampak",
    baik: "Meminta bantuan atau pembagian tugas bila beban kerja melebihi kapasitas",
  },
  {
    konten:
      "Anda mengetahui ada pegawai menerima imbalan kecil dari pemohon layanan. Anda...",
    topik: "Antikorupsi",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Pemberian terkait layanan berpotensi gratifikasi dan perlu ditangani sesuai jalur yang benar.",
    terbaik:
      "Mengingatkan aturan gratifikasi dan mendorong pelaporan atau pengembalian sesuai prosedur",
    baik: "Mencatat kejadian dan berkonsultasi melalui jalur pengawasan yang tepat",
  },
  {
    konten:
      "Warga mengunggah keluhan bahwa petugas kurang ramah. Anda sebagai bagian unit layanan...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Keluhan publik perlu ditindaklanjuti dengan verifikasi dan perbaikan layanan.",
    terbaik:
      "Memverifikasi keluhan, menyampaikan kepada koordinator, dan mengusulkan perbaikan perilaku layanan",
    baik: "Mendorong penggunaan kanal pengaduan resmi agar keluhan dapat ditindaklanjuti",
  },
  {
    konten: "Perubahan SOP membuat sebagian warga bingung. Anda...",
    topik: "Kepatuhan Regulasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Perubahan SOP perlu dijelaskan dengan bahasa sederhana dan konsisten.",
    terbaik:
      "Menjelaskan perubahan dengan ringkas, menyediakan panduan resmi, dan memastikan petugas memberi informasi seragam",
    baik: "Mengumpulkan pertanyaan warga untuk dijadikan bahan pembaruan informasi layanan",
  },
  {
    konten:
      "Anda menerima email berisi lampiran mencurigakan dari alamat yang mirip alamat kantor. Anda...",
    topik: "Keamanan Informasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Email mencurigakan harus diperlakukan sebagai risiko keamanan dan dilaporkan.",
    terbaik:
      "Tidak membuka lampiran, melaporkan ke tim IT, dan mengikuti prosedur keamanan informasi",
    baik: "Memeriksa alamat pengirim melalui kanal resmi tanpa membalas email tersebut",
  },
  {
    konten:
      "Seorang pemohon difabel membutuhkan bantuan mengakses ruang layanan. Anda...",
    topik: "Pelayanan Inklusif",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pelayanan inklusif memberi bantuan sesuai kebutuhan dan tetap menghormati martabat pemohon.",
    terbaik:
      "Memberikan bantuan akses sesuai prosedur sambil tetap menghormati kemandirian pemohon",
    baik: "Berkoordinasi dengan petugas lain untuk memastikan fasilitas aksesibilitas tersedia",
  },
  {
    konten:
      "Tim Anda harus menyelesaikan pekerjaan lintas unit dalam waktu singkat. Anda...",
    topik: "Kolaborasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kolaborasi efektif membutuhkan pembagian peran, tenggat, dan komunikasi perkembangan.",
    terbaik:
      "Menyepakati pembagian peran, tenggat, dan kanal koordinasi yang jelas dengan unit terkait",
    baik: "Membuat daftar pekerjaan prioritas dan penanggung jawabnya",
  },
  {
    konten: "Anda ditunjuk memimpin rapat saat pimpinan berhalangan. Anda...",
    topik: "Kepemimpinan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kepemimpinan rapat menuntut agenda jelas, partisipasi, dan keputusan terdokumentasi.",
    terbaik:
      "Menjalankan rapat sesuai agenda, memberi ruang pendapat, dan mencatat keputusan serta tindak lanjut",
    baik: "Memastikan peserta memahami tujuan rapat sebelum pembahasan dimulai",
  },
  {
    konten:
      "Target kinerja bulanan belum tercapai karena antrean layanan meningkat. Anda...",
    topik: "Semangat Berprestasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Capaian kinerja perlu dikejar dengan analisis kendala dan penyesuaian strategi.",
    terbaik:
      "Menganalisis penyebab, menyusun prioritas layanan, dan memantau progres perbaikan secara berkala",
    baik: "Mengusulkan penyesuaian pembagian tugas agar antrean lebih terkendali",
  },
  {
    konten:
      "Ada usulan memakai formulir digital untuk mengurangi antrean manual. Anda...",
    topik: "Inovasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Inovasi layanan perlu diuji manfaat, risiko, dan kesesuaiannya dengan aturan.",
    terbaik:
      "Mengkaji manfaat dan risiko, menyiapkan uji coba terbatas, dan mengusulkannya melalui kanal resmi",
    baik: "Mengumpulkan masukan pengguna layanan sebelum penerapan lebih luas",
  },
  {
    konten:
      "Seorang rekan menyalahkan Anda atas kesalahan tim di depan umum. Anda...",
    topik: "Pengendalian Diri",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pengendalian diri menjaga komunikasi tetap profesional dan fokus pada penyelesaian masalah.",
    terbaik:
      "Tetap tenang, mengklarifikasi berdasarkan fakta, dan mengajak membahas solusi secara profesional",
    baik: "Meminta waktu diskusi terpisah agar masalah diselesaikan tanpa memperkeruh suasana",
  },
  {
    konten: "Data penerima layanan tersimpan di komputer bersama. Anda...",
    topik: "Keamanan Data",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Data pribadi harus dilindungi dengan akses terbatas dan kebiasaan keamanan yang baik.",
    terbaik:
      "Memastikan data disimpan di lokasi resmi, akses dibatasi, dan komputer terkunci saat ditinggalkan",
    baik: "Mengingatkan tim agar tidak menyimpan data pribadi di tempat yang tidak aman",
  },
  {
    konten:
      "Anda menemukan prosedur lama masih ditempel di ruang layanan. Anda...",
    topik: "Ketelitian Administrasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Informasi layanan harus mutakhir agar warga tidak salah menyiapkan berkas.",
    terbaik:
      "Mengonfirmasi informasi terbaru, mengganti pengumuman lama, dan memastikan semua kanal diperbarui",
    baik: "Melaporkan temuan kepada koordinator layanan untuk segera diperbaiki",
  },
  {
    konten: "Ada warga yang tidak lancar berbahasa Indonesia formal. Anda...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pelayanan publik perlu memakai komunikasi yang mudah dipahami dan menghargai keragaman.",
    terbaik:
      "Menjelaskan dengan bahasa sederhana, memastikan pemahaman, dan tetap bersikap hormat",
    baik: "Menggunakan contoh atau bantuan visual agar langkah layanan lebih jelas",
  },
  {
    konten:
      "Anda diajak rekan membicarakan pilihan politik saat memakai atribut kantor. Anda...",
    topik: "Netralitas ASN",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "ASN wajib menjaga netralitas dan menghindari aktivitas politik praktis terutama dengan atribut kedinasan.",
    terbaik:
      "Menolak terlibat pembicaraan dukungan politik dan mengingatkan pentingnya netralitas ASN",
    baik: "Mengalihkan pembicaraan ke urusan kerja agar suasana tetap profesional",
  },
  {
    konten:
      "Anggaran kegiatan sosialisasi terbatas, tetapi sasaran masyarakat cukup luas. Anda...",
    topik: "Manajemen Sumber Daya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Sumber daya terbatas perlu dikelola berdasarkan prioritas dan dampak terbesar.",
    terbaik:
      "Menyusun prioritas sasaran, memilih kanal hemat biaya, dan memastikan pesan utama tetap tersampaikan",
    baik: "Mengusulkan kerja sama dengan pihak terkait untuk memperluas jangkauan",
  },
  {
    konten:
      "Anda melihat pegawai senior memberi instruksi yang bertentangan dengan SOP terbaru. Anda...",
    topik: "Kepatuhan Regulasi",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Instruksi yang bertentangan dengan SOP perlu diklarifikasi secara hormat berdasarkan aturan terbaru.",
    terbaik:
      "Mengklarifikasi dengan sopan menggunakan rujukan SOP terbaru dan meminta arahan resmi bila perlu",
    baik: "Berkonsultasi kepada koordinator agar penerapan SOP seragam",
  },
  {
    konten:
      "Pemohon mengeluh karena sudah beberapa kali diminta melengkapi dokumen berbeda. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pelayanan yang baik memberi kejelasan persyaratan dan mencegah pemohon bolak-balik tanpa kepastian.",
    terbaik:
      "Memeriksa riwayat permohonan, memberi daftar kekurangan final, dan membantu memastikan alurnya jelas",
    baik: "Meminta maaf atas ketidaknyamanan dan mengarahkan ke petugas verifikasi yang tepat",
  },
  {
    konten:
      "Anda diberi kesempatan mengikuti pelatihan yang relevan dengan jabatan. Anda...",
    topik: "Pengembangan Diri",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pengembangan kompetensi mendukung kinerja dan mutu pelayanan publik.",
    terbaik:
      "Mengikuti pelatihan, menyiapkan pengaturan tugas, dan menerapkan hasil belajar pada pekerjaan",
    baik: "Membagikan materi penting kepada rekan setelah pelatihan",
  },
  {
    konten:
      "Rapat evaluasi menunjukkan unit Anda paling lambat menyelesaikan layanan. Anda...",
    topik: "Evaluasi Diri",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Evaluasi kinerja harus dilakukan objektif untuk menemukan penyebab dan tindakan perbaikan.",
    terbaik:
      "Menganalisis akar masalah, menyusun rencana perbaikan, dan memantau indikator layanan",
    baik: "Meminta masukan dari petugas dan pengguna layanan untuk melengkapi evaluasi",
  },
  {
    konten:
      "Anda menerima instruksi lisan yang berpotensi menimbulkan kesalahan administrasi. Anda...",
    topik: "Komunikasi Kerja",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Instruksi yang berisiko perlu dikonfirmasi agar akuntabel dan tidak salah ditafsirkan.",
    terbaik:
      "Mengonfirmasi instruksi secara tertulis atau melalui kanal resmi sebelum melaksanakan",
    baik: "Menanyakan rincian yang belum jelas agar pelaksanaan tidak keliru",
  },
  {
    konten:
      "Seorang warga marah karena permohonannya ditolak sesuai aturan. Anda...",
    topik: "Pengendalian Diri",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Petugas harus tetap tenang dan menjelaskan dasar penolakan serta opsi yang tersedia.",
    terbaik:
      "Mendengarkan keluhan, menjelaskan dasar aturan dengan tenang, dan memberi informasi upaya perbaikan berkas",
    baik: "Meminta bantuan atasan bila situasi mulai tidak kondusif",
  },
  {
    konten:
      "Anda mengetahui ada celah antrean yang sering dimanfaatkan oleh pihak tertentu. Anda...",
    topik: "Integritas Layanan",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Celah layanan yang membuka peluang perlakuan tidak adil harus diperbaiki melalui prosedur resmi.",
    terbaik:
      "Mendokumentasikan celah, melaporkan melalui jalur resmi, dan mengusulkan penutupan celah prosedur",
    baik: "Mengawasi penerapan antrean agar tidak ada pemohon yang dirugikan",
  },
  {
    konten:
      "Tim Anda berbeda usia dan gaya kerja sehingga koordinasi sering lambat. Anda...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Keragaman tim perlu dikelola dengan komunikasi yang menghargai perbedaan dan tujuan bersama.",
    terbaik:
      "Mengajak tim menyepakati cara komunikasi, pembagian tugas, dan ritme kerja yang dapat diterima bersama",
    baik: "Menjadi penghubung agar anggota tim saling memahami kendala masing-masing",
  },
  {
    konten:
      "Sebuah aplikasi baru membuat sebagian proses lebih cepat, tetapi ada risiko salah input. Anda...",
    topik: "Adaptasi Teknologi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Teknologi baru perlu dimanfaatkan dengan kontrol mutu agar efisiensi tidak mengorbankan akurasi.",
    terbaik:
      "Menggunakan aplikasi sambil menerapkan pengecekan data dan melaporkan risiko salah input untuk diperbaiki",
    baik: "Membuat daftar langkah pemeriksaan agar pengguna tidak melewatkan data penting",
  },
  {
    konten:
      "Anda diminta menyampaikan informasi sulit kepada masyarakat. Anda...",
    topik: "Komunikasi Publik",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Informasi sulit harus disampaikan jelas, empatik, dan berbasis data resmi.",
    terbaik:
      "Menyiapkan pesan berbasis data resmi, memakai bahasa sederhana, dan membuka ruang pertanyaan",
    baik: "Mengantisipasi pertanyaan yang mungkin muncul agar jawaban tetap konsisten",
  },
  {
    konten:
      "Ada tumpukan pekerjaan karena beberapa pegawai cuti bersamaan. Anda...",
    topik: "Kerja Sama",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kondisi kekurangan personel perlu ditangani dengan prioritas dan pembagian tugas yang realistis.",
    terbaik:
      "Membantu menyusun prioritas, membagi tugas sesuai kapasitas, dan menjaga layanan penting tetap berjalan",
    baik: "Mengusulkan penyesuaian jadwal layanan bila diperlukan dan sesuai aturan",
  },
  {
    konten:
      "Anda menemukan laporan kegiatan tidak mencantumkan kendala yang sebenarnya terjadi. Anda...",
    topik: "Akuntabilitas",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Laporan harus menggambarkan kondisi sebenarnya agar evaluasi dan keputusan berikutnya tepat.",
    terbaik:
      "Mengusulkan perbaikan laporan agar kendala dicantumkan secara objektif beserta tindak lanjutnya",
    baik: "Menyampaikan pentingnya data jujur untuk evaluasi program",
  },
  {
    konten:
      "Atasan meminta keputusan cepat atas masalah layanan yang belum pernah terjadi. Anda...",
    topik: "Pengambilan Keputusan",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Keputusan cepat harus memakai informasi kunci, kewenangan yang jelas, dan pertimbangan risiko.",
    terbaik:
      "Mengumpulkan informasi minimum yang valid, menilai risiko, dan memberi rekomendasi sesuai kewenangan",
    baik: "Mengonsultasikan aspek yang berisiko tinggi sebelum keputusan final",
  },
  {
    konten:
      "Anda melihat potensi pemborosan dalam pengadaan kebutuhan kecil kantor. Anda...",
    topik: "Efisiensi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Efisiensi anggaran harus dilakukan dengan tetap mengikuti prosedur dan kebutuhan kerja.",
    terbaik:
      "Mengusulkan evaluasi kebutuhan, pembelian sesuai prioritas, dan dokumentasi yang akuntabel",
    baik: "Membandingkan alternatif yang lebih hemat tanpa menurunkan fungsi utama",
  },
  {
    konten:
      "Seorang rekan meminta Anda membagikan password aplikasi karena akunnya terkunci. Anda...",
    topik: "Keamanan Informasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Password bersifat pribadi dan tidak boleh dibagikan; pemulihan akses harus melalui admin sistem.",
    terbaik:
      "Menolak membagikan password dan membantu rekan menghubungi admin untuk pemulihan akses",
    baik: "Menjelaskan risiko berbagi akun terhadap keamanan dan akuntabilitas",
  },
  {
    konten:
      "Saat memeriksa berkas, Anda menemukan pemohon hampir melewati batas waktu karena kesalahan informasi dari petugas. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Kesalahan informasi perlu diperbaiki dengan solusi yang sah dan meminimalkan kerugian warga.",
    terbaik:
      "Memeriksa riwayat informasi, berkoordinasi mencari solusi sesuai aturan, dan memberi penjelasan jujur kepada pemohon",
    baik: "Melaporkan pola kesalahan informasi agar tidak terulang",
  },
  {
    konten:
      "Kantor menerima banyak pemohon dari luar daerah saat musim pendaftaran. Anda...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pelayanan pada masyarakat beragam perlu menjaga kesetaraan, kejelasan informasi, dan ketertiban.",
    terbaik:
      "Menyiapkan informasi yang mudah dipahami, menjaga antrean tertib, dan melayani tanpa membedakan asal daerah",
    baik: "Berkoordinasi agar petugas memahami potensi kebutuhan bahasa atau informasi tambahan",
  },
  {
    konten:
      "Anda diminta memperbaiki proses yang selama ini dianggap sudah nyaman oleh tim. Anda...",
    topik: "Perubahan Organisasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Perubahan proses perlu dilakukan dengan data, komunikasi manfaat, dan pelibatan tim.",
    terbaik:
      "Mengumpulkan data masalah, menjelaskan manfaat perubahan, dan melibatkan tim dalam penyesuaian proses",
    baik: "Memulai dari perbaikan kecil yang mudah diuji dampaknya",
  },
  {
    konten:
      "Dokumen penting harus selesai hari ini, tetapi sistem tanda tangan elektronik bermasalah. Anda...",
    topik: "Adaptasi",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Gangguan sistem perlu diselesaikan dengan alternatif sah dan koordinasi dengan pihak berwenang.",
    terbaik:
      "Melapor ke admin sistem, mencari prosedur alternatif yang sah, dan memberi update kepada pihak terkait",
    baik: "Menyiapkan dokumen pendukung agar siap diproses saat sistem pulih",
  },
  {
    konten:
      "Anda menjadi saksi rekan diperlakukan tidak adil dalam pembagian tugas. Anda...",
    topik: "Keadilan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Keadilan kerja perlu dijaga dengan penyampaian fakta dan solusi pembagian tugas yang proporsional.",
    terbaik:
      "Menyampaikan fakta secara profesional dan mengusulkan pembagian tugas yang lebih proporsional",
    baik: "Mendukung rekan menyampaikan keberatan melalui jalur yang tepat",
  },
  {
    konten:
      "Anda menerima masukan bahwa cara komunikasi Anda terlalu teknis bagi warga. Anda...",
    topik: "Komunikasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Masukan perlu diterima untuk memperbaiki cara komunikasi agar layanan lebih mudah dipahami.",
    terbaik:
      "Menerima masukan, menyederhanakan penjelasan, dan memastikan warga memahami informasi layanan",
    baik: "Membuat contoh penjelasan atau daftar istilah sederhana untuk membantu komunikasi",
  },
  {
    konten:
      "Ada laporan potensi pungutan liar di sekitar area layanan. Anda...",
    topik: "Antikorupsi",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Dugaan pungutan liar harus ditangani serius melalui pencatatan dan pelaporan yang aman.",
    terbaik:
      "Mencatat informasi awal, melaporkan melalui kanal pengawasan resmi, dan menjaga kerahasiaan pelapor",
    baik: "Mengimbau masyarakat memakai kanal layanan resmi tanpa biaya tambahan",
  },
];

// Paket E disusun sebagai variasi orisinal dengan pola dari bank soal CPNS SKD tahun lalu:
// TWK 30, TIU 35, TKP 45; bukan salinan soal ujian resmi.
const soalCpnsSkdPaketE: SoalSeed[] = [
  ...twkData.map((item) => pg("TWK", ...item)),
  ...tiuData.map((item) => pg("TIU", ...item)),
  ...tkpScenarios.map((item) =>
    tkp(
      item.konten,
      item.topik,
      item.tingkatKesulitan,
      item.pembahasanTeks,
      item.terbaik,
      item.baik
    )
  ),
];

function assertSeedData(): void {
  const counts: Record<Subtes, number> = { TWK: 0, TIU: 0, TKP: 0 };

  for (const [index, soal] of soalCpnsSkdPaketE.entries()) {
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

export async function seedCpnsPaketE(createdById: string) {
  console.log("Seeding paket CPNS SKD Premium - Paket E...");
  console.log(`Referensi: ${BANK_SOAL_REFERENCE}`);

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required.");
  }

  assertSeedData();

  const existing = await prisma.paketTryout.findUnique({
    where: { slug: PAKET_SLUG },
  });

  if (existing) {
    console.log("Paket E sudah ada, skip.");
    return;
  }

  const soalIds: string[] = [];

  for (const soal of soalCpnsSkdPaketE) {
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
      judul: "Tryout SKD CPNS Premium - Paket E",
      deskripsi:
        "Paket E berisi 110 soal latihan CPNS SKD yang disusun sebagai variasi orisinal dari pola bank soal tahun lalu, lengkap dengan pembahasan TWK, TIU, dan TKP.",
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

  await seedCpnsPaketE(instruktur.id);
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
