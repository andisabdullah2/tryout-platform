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

type TkpSeedTuple = [
  konten: string,
  topik: string,
  tingkatKesulitan: TingkatKesulitan,
  pembahasanTeks: string,
  scores: Record<Label, NilaiTkp>,
  opsi: Record<Label, string>,
];

const LABELS: Label[] = ["A", "B", "C", "D", "E"];
const PAKET_SLUG = "tryout-skd-cpns-premium-paket-d";
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

const twkData: PgSeedTuple[] = [
  [
    "Pancasila sebagai dasar negara berfungsi sebagai...",
    "Pancasila",
    "MUDAH",
    "Sebagai dasar negara, Pancasila menjadi fondasi penyelenggaraan negara dan sumber nilai dalam kehidupan berbangsa.",
    "C",
    {
      A: "Pedoman teknis pelaksanaan anggaran",
      B: "Aturan khusus untuk lembaga legislatif",
      C: "Fondasi penyelenggaraan negara dan kehidupan berbangsa",
      D: "Sistem ekonomi yang berlaku sementara",
      E: "Dokumen sejarah tanpa akibat hukum",
    },
  ],
  [
    "Sila kelima Pancasila dalam pelayanan publik paling tepat diwujudkan dengan...",
    "Pancasila",
    "SEDANG",
    "Keadilan sosial diwujudkan melalui pelayanan yang adil, merata, dan tidak diskriminatif.",
    "A",
    {
      A: "Memberikan layanan secara adil tanpa membedakan latar belakang warga",
      B: "Mengutamakan warga yang memiliki hubungan pribadi",
      C: "Mendahulukan kelompok tertentu karena jumlahnya besar",
      D: "Membatasi layanan kepada warga yang tidak dikenal",
      E: "Memberikan perlakuan khusus tanpa dasar aturan",
    },
  ],
  [
    "Contoh penerapan sila pertama Pancasila di kantor adalah...",
    "Pancasila",
    "MUDAH",
    "Sila Ketuhanan Yang Maha Esa tercermin dalam sikap saling menghormati kebebasan beragama dan beribadah.",
    "D",
    {
      A: "Mewajibkan semua pegawai mengikuti ibadah yang sama",
      B: "Menilai kinerja berdasarkan keyakinan pribadi",
      C: "Mengabaikan kebutuhan ibadah pegawai lain",
      D: "Menghormati pegawai yang menjalankan ibadah sesuai keyakinannya",
      E: "Membatasi diskusi hanya pada pemeluk agama mayoritas",
    },
  ],
  [
    "Negara Indonesia adalah negara hukum. Ketentuan ini terdapat dalam UUD 1945 Pasal...",
    "UUD 1945",
    "MUDAH",
    "Pasal 1 ayat (3) UUD 1945 menegaskan bahwa Negara Indonesia adalah negara hukum.",
    "C",
    {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (1)",
    },
  ],
  [
    "Jaminan pengakuan, perlindungan, dan kepastian hukum yang adil terdapat dalam UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 28D ayat (1) UUD 1945 mengatur hak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil.",
    "B",
    {
      A: "28C ayat (1)",
      B: "28D ayat (1)",
      C: "28E ayat (3)",
      D: "29 ayat (2)",
      E: "31 ayat (1)",
    },
  ],
  [
    "Kemerdekaan berserikat, berkumpul, dan mengeluarkan pendapat dijamin dalam UUD 1945 Pasal...",
    "UUD 1945",
    "SEDANG",
    "Pasal 28E ayat (3) UUD 1945 menjamin kemerdekaan berserikat, berkumpul, dan mengeluarkan pendapat.",
    "E",
    {
      A: "27 ayat (1)",
      B: "28A",
      C: "28B ayat (2)",
      D: "28D ayat (2)",
      E: "28E ayat (3)",
    },
  ],
  [
    "Setiap warga negara wajib mengikuti pendidikan dasar dan pemerintah wajib membiayainya diatur dalam...",
    "UUD 1945",
    "SEDANG",
    "Pasal 31 ayat (2) UUD 1945 mengatur kewajiban mengikuti pendidikan dasar dan kewajiban pemerintah membiayainya.",
    "A",
    {
      A: "Pasal 31 ayat (2)",
      B: "Pasal 30 ayat (1)",
      C: "Pasal 32 ayat (1)",
      D: "Pasal 33 ayat (2)",
      E: "Pasal 34 ayat (1)",
    },
  ],
  [
    "Fakir miskin dan anak-anak terlantar dipelihara oleh negara adalah ketentuan UUD 1945 Pasal...",
    "UUD 1945",
    "MUDAH",
    "Pasal 34 ayat (1) UUD 1945 menyatakan fakir miskin dan anak-anak terlantar dipelihara oleh negara.",
    "D",
    {
      A: "31 ayat (1)",
      B: "32 ayat (1)",
      C: "33 ayat (3)",
      D: "34 ayat (1)",
      E: "36",
    },
  ],
  [
    "Salah satu kewenangan MPR setelah amandemen UUD 1945 adalah...",
    "Lembaga Negara",
    "SEDANG",
    "MPR berwenang mengubah dan menetapkan UUD serta melantik Presiden dan Wakil Presiden sesuai ketentuan UUD.",
    "B",
    {
      A: "Mengadili sengketa hasil pemilu kepala daerah",
      B: "Mengubah dan menetapkan UUD",
      C: "Mengangkat semua menteri kabinet",
      D: "Menguji peraturan pemerintah terhadap undang-undang",
      E: "Menetapkan APBN secara mandiri",
    },
  ],
  [
    "Fungsi legislasi DPR berkaitan dengan kewenangan...",
    "Lembaga Negara",
    "MUDAH",
    "Fungsi legislasi DPR berkaitan dengan pembentukan undang-undang bersama Presiden.",
    "C",
    {
      A: "Mengadili pelanggaran etik hakim",
      B: "Memeriksa pengelolaan keuangan negara",
      C: "Membentuk undang-undang",
      D: "Mengangkat duta besar negara sahabat",
      E: "Menyelesaikan sengketa kewenangan lembaga negara",
    },
  ],
  [
    "DPD dalam sistem ketatanegaraan Indonesia mewakili kepentingan...",
    "Lembaga Negara",
    "MUDAH",
    "DPD merupakan lembaga perwakilan daerah yang membawa aspirasi daerah dalam sistem ketatanegaraan.",
    "E",
    {
      A: "Partai politik peserta pemilu",
      B: "Pemerintah pusat",
      C: "Lembaga yudikatif",
      D: "Kabinet pemerintahan",
      E: "Daerah",
    },
  ],
  [
    "Kewenangan Mahkamah Konstitusi antara lain...",
    "Lembaga Negara",
    "SEDANG",
    "Mahkamah Konstitusi berwenang menguji undang-undang terhadap UUD 1945.",
    "A",
    {
      A: "Menguji undang-undang terhadap UUD 1945",
      B: "Menguji peraturan daerah terhadap peraturan menteri",
      C: "Mengawasi penggunaan APBN",
      D: "Mengangkat hakim agung",
      E: "Membentuk undang-undang bersama DPR",
    },
  ],
  [
    "Mahkamah Agung berwenang menguji peraturan perundang-undangan di bawah undang-undang terhadap...",
    "Lembaga Negara",
    "SULIT",
    "Mahkamah Agung berwenang menguji peraturan perundang-undangan di bawah undang-undang terhadap undang-undang.",
    "D",
    {
      A: "Pancasila secara langsung",
      B: "Ketetapan MPR",
      C: "UUD 1945",
      D: "Undang-undang",
      E: "Peraturan presiden",
    },
  ],
  [
    "BPK adalah lembaga negara yang bertugas...",
    "Lembaga Negara",
    "SEDANG",
    "BPK bertugas memeriksa pengelolaan dan tanggung jawab keuangan negara secara bebas dan mandiri.",
    "B",
    {
      A: "Menyusun rencana pembangunan nasional",
      B: "Memeriksa pengelolaan dan tanggung jawab keuangan negara",
      C: "Mengadili sengketa hasil pemilihan umum",
      D: "Mengangkat pejabat kementerian",
      E: "Menetapkan kebijakan moneter",
    },
  ],
  [
    "Bendera Negara Indonesia ialah Sang Merah Putih. Ketentuan ini terdapat dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 35 UUD 1945 menyatakan bendera negara Indonesia ialah Sang Merah Putih.",
    "A",
    { A: "35", B: "36", C: "36A", D: "36B", E: "37" },
  ],
  [
    "Lagu Kebangsaan Indonesia Raya diatur dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 36B UUD 1945 menyatakan lagu kebangsaan ialah Indonesia Raya.",
    "D",
    { A: "33", B: "34", C: "36", D: "36B", E: "37" },
  ],
  [
    "Bahasa negara Indonesia adalah Bahasa Indonesia. Ketentuan ini tercantum dalam UUD 1945 Pasal...",
    "Pilar Negara",
    "MUDAH",
    "Pasal 36 UUD 1945 menyatakan bahasa negara ialah Bahasa Indonesia.",
    "B",
    { A: "35", B: "36", C: "36A", D: "36B", E: "37" },
  ],
  [
    "Semboyan Bhinneka Tunggal Ika berasal dari kitab...",
    "Bhinneka Tunggal Ika",
    "MUDAH",
    "Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karya Mpu Tantular.",
    "C",
    {
      A: "Pararaton",
      B: "Negarakertagama",
      C: "Sutasoma",
      D: "Arjunawiwaha",
      E: "Ramayana",
    },
  ],
  [
    "Sumpah Pemuda diikrarkan pada...",
    "Sejarah Nasional",
    "MUDAH",
    "Sumpah Pemuda diikrarkan dalam Kongres Pemuda II pada 28 Oktober 1928.",
    "E",
    {
      A: "20 Mei 1908",
      B: "1 Juni 1945",
      C: "22 Juni 1945",
      D: "17 Agustus 1945",
      E: "28 Oktober 1928",
    },
  ],
  [
    "Organisasi Boedi Oetomo dikenal sebagai tonggak...",
    "Sejarah Nasional",
    "SEDANG",
    "Boedi Oetomo yang berdiri pada 20 Mei 1908 dipandang sebagai tonggak Kebangkitan Nasional.",
    "A",
    {
      A: "Kebangkitan Nasional",
      B: "Reformasi birokrasi",
      C: "Pergerakan diplomasi pascakemerdekaan",
      D: "Pembentukan negara federal",
      E: "Amandemen konstitusi",
    },
  ],
  [
    "Makna Proklamasi Kemerdekaan bagi bangsa Indonesia adalah...",
    "Sejarah Nasional",
    "SEDANG",
    "Proklamasi menandai lahirnya negara Indonesia yang merdeka dan pernyataan kepada dunia tentang kemerdekaan Indonesia.",
    "B",
    {
      A: "Awal penjajahan baru",
      B: "Pernyataan kemerdekaan dan lahirnya negara Indonesia",
      C: "Pembentukan organisasi pemuda",
      D: "Penetapan sistem parlementer",
      E: "Penghapusan seluruh hukum nasional",
    },
  ],
  [
    "Peristiwa Rengasdengklok berkaitan erat dengan...",
    "Sejarah Nasional",
    "SEDANG",
    "Peristiwa Rengasdengklok berkaitan dengan desakan golongan muda agar Proklamasi Kemerdekaan segera dilaksanakan.",
    "C",
    {
      A: "Pembentukan BPUPKI",
      B: "Penyusunan Dekrit Presiden",
      C: "Desakan agar Proklamasi segera dilaksanakan",
      D: "Pemilihan umum pertama",
      E: "Pengesahan amandemen UUD",
    },
  ],
  [
    "Pidato Soekarno pada 1 Juni 1945 dalam sidang BPUPKI dikenal sebagai momentum...",
    "Sejarah Pancasila",
    "SEDANG",
    "Tanggal 1 Juni 1945 dikenal sebagai Hari Lahir Pancasila karena pidato Soekarno tentang dasar negara.",
    "D",
    {
      A: "Hari Kebangkitan Nasional",
      B: "Hari Konstitusi",
      C: "Hari Kesaktian Pancasila",
      D: "Hari Lahir Pancasila",
      E: "Hari Bela Negara",
    },
  ],
  [
    "Nasionalisme Pancasila berbeda dari chauvinisme karena nasionalisme Pancasila...",
    "Nasionalisme",
    "SEDANG",
    "Nasionalisme Pancasila mencintai bangsa sendiri tanpa merendahkan bangsa lain.",
    "E",
    {
      A: "Menganggap bangsa sendiri selalu paling unggul",
      B: "Menolak hubungan dengan bangsa lain",
      C: "Membenarkan diskriminasi terhadap warga asing",
      D: "Mengutamakan suku sendiri",
      E: "Mencintai bangsa sendiri tanpa merendahkan bangsa lain",
    },
  ],
  [
    "Salah satu bentuk bela negara bagi ASN adalah...",
    "Bela Negara",
    "MUDAH",
    "Bela negara bagi ASN dapat diwujudkan melalui pelayanan publik yang jujur, disiplin, dan profesional.",
    "A",
    {
      A: "Memberikan pelayanan publik secara disiplin dan profesional",
      B: "Mengutamakan kepentingan pribadi di kantor",
      C: "Menyebarkan dokumen negara tanpa izin",
      D: "Mengabaikan aturan karena merasa senior",
      E: "Memilih tugas hanya yang mudah",
    },
  ],
  [
    "Integritas dalam konteks ASN paling tepat berarti...",
    "Integritas",
    "MUDAH",
    "Integritas berarti keselarasan antara nilai, ucapan, tindakan, dan tanggung jawab menjalankan aturan.",
    "B",
    {
      A: "Kemampuan menyenangkan semua pihak",
      B: "Konsistensi antara nilai, ucapan, dan tindakan",
      C: "Kecakapan bekerja tanpa koordinasi",
      D: "Keberanian mengabaikan prosedur",
      E: "Kedekatan dengan pimpinan",
    },
  ],
  [
    "Tindakan melaporkan potensi konflik kepentingan sebelum mengambil keputusan menunjukkan nilai...",
    "Antikorupsi",
    "SEDANG",
    "Melaporkan konflik kepentingan menunjukkan transparansi, akuntabilitas, dan integritas.",
    "D",
    {
      A: "Eksklusivitas",
      B: "Kompetisi",
      C: "Popularitas",
      D: "Transparansi dan integritas",
      E: "Kemandirian mutlak",
    },
  ],
  [
    "Negara Kesatuan Republik Indonesia ditegaskan dalam UUD 1945 Pasal...",
    "NKRI",
    "MUDAH",
    "Pasal 1 ayat (1) UUD 1945 menyatakan Indonesia adalah negara kesatuan yang berbentuk republik.",
    "A",
    {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (3)",
    },
  ],
  [
    "Pancasila sebagai ideologi terbuka bermakna...",
    "Pancasila",
    "SULIT",
    "Pancasila memiliki nilai dasar yang tetap, sedangkan penerapan instrumental dan praksisnya dapat menyesuaikan perkembangan zaman.",
    "E",
    {
      A: "Nilai dasar Pancasila dapat diganti setiap saat",
      B: "Pancasila hanya berlaku dalam dokumen sejarah",
      C: "Pancasila menolak perkembangan masyarakat",
      D: "Pancasila tidak memiliki nilai dasar",
      E: "Nilai dasarnya tetap, penerapannya dapat menyesuaikan zaman",
    },
  ],
  [
    "Sikap menjaga kerukunan dalam keberagaman paling sesuai dengan nilai...",
    "Bhinneka Tunggal Ika",
    "MUDAH",
    "Kerukunan dalam keberagaman mencerminkan persatuan dan penghargaan terhadap perbedaan.",
    "C",
    {
      A: "Primordialisme",
      B: "Individualisme",
      C: "Persatuan dalam keberagaman",
      D: "Eksklusivisme kelompok",
      E: "Fanatisme golongan",
    },
  ],
];

const tiuData: PgSeedTuple[] = [
  [
    "Jika 6x - 9 = 27, maka nilai x adalah...",
    "Matematika Dasar",
    "MUDAH",
    "6x - 9 = 27 sehingga 6x = 36 dan x = 6.",
    "C",
    { A: "3", B: "4", C: "6", D: "8", E: "9" },
  ],
  [
    "Deret 4, 9, 19, 39, 79, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "SEDANG",
    "Pola deret adalah dikali 2 lalu ditambah 1. Setelah 79 menjadi 159.",
    "E",
    { A: "119", B: "139", C: "149", D: "155", E: "159" },
  ],
  [
    "Deret 64, 32, 16, 8, 4, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Setiap suku dibagi 2, sehingga setelah 4 adalah 2.",
    "B",
    { A: "1", B: "2", C: "3", D: "4", E: "6" },
  ],
  [
    "Deret 1, 4, 9, 16, 25, ... Bilangan berikutnya adalah...",
    "Deret Angka",
    "MUDAH",
    "Deret tersebut adalah kuadrat bilangan 1 sampai 5, sehingga berikutnya 6 kuadrat = 36.",
    "D",
    { A: "30", B: "32", C: "34", D: "36", E: "38" },
  ],
  [
    "Deret huruf A, D, H, M, S, ... Huruf berikutnya adalah...",
    "Deret Huruf",
    "SEDANG",
    "Posisi huruf bertambah 3, 4, 5, 6, sehingga berikutnya bertambah 7 dari S menjadi Z.",
    "E",
    { A: "V", B: "W", C: "X", D: "Y", E: "Z" },
  ],
  [
    "Harga Rp 350.000 mendapat diskon 30%. Harga setelah diskon adalah...",
    "Persentase",
    "MUDAH",
    "Diskon = 30% x 350.000 = 105.000, jadi harga akhir 245.000.",
    "B",
    {
      A: "Rp 235.000",
      B: "Rp 245.000",
      C: "Rp 250.000",
      D: "Rp 255.000",
      E: "Rp 260.000",
    },
  ],
  [
    "Perbandingan nilai A dan B adalah 2 : 3. Jika jumlahnya 75, nilai A adalah...",
    "Perbandingan",
    "MUDAH",
    "Total bagian 5. Nilai A = 2/5 x 75 = 30.",
    "A",
    { A: "30", B: "35", C: "40", D: "45", E: "50" },
  ],
  [
    "Sebuah mobil menempuh 240 km dalam 4 jam. Dengan kecepatan tetap, jarak dalam 5,5 jam adalah...",
    "Kecepatan",
    "SEDANG",
    "Kecepatan = 240/4 = 60 km/jam. Dalam 5,5 jam jaraknya 330 km.",
    "C",
    { A: "300 km", B: "315 km", C: "330 km", D: "345 km", E: "360 km" },
  ],
  [
    "Rata-rata nilai 5 peserta adalah 72. Jika satu peserta bernilai 84 ditambahkan, rata-rata baru adalah...",
    "Statistika",
    "SEDANG",
    "Total awal 360. Ditambah 84 menjadi 444. Rata-rata 6 peserta = 74.",
    "D",
    { A: "72", B: "72,5", C: "73", D: "74", E: "75" },
  ],
  [
    "Luas lingkaran berjari-jari 7 cm dengan pi = 22/7 adalah...",
    "Geometri",
    "MUDAH",
    "Luas = pi x r x r = 22/7 x 7 x 7 = 154 cm2.",
    "E",
    { A: "88 cm2", B: "108 cm2", C: "132 cm2", D: "144 cm2", E: "154 cm2" },
  ],
  [
    "Sebuah persegi memiliki keliling 48 cm. Luas persegi tersebut adalah...",
    "Geometri",
    "MUDAH",
    "Sisi persegi = 48/4 = 12 cm. Luas = 12 x 12 = 144 cm2.",
    "B",
    { A: "128 cm2", B: "144 cm2", C: "156 cm2", D: "168 cm2", E: "196 cm2" },
  ],
  [
    "A menyelesaikan pekerjaan dalam 10 hari dan B dalam 15 hari. Jika bekerja bersama, selesai dalam...",
    "Aritmetika Sosial",
    "SEDANG",
    "Kecepatan bersama = 1/10 + 1/15 = 5/30 = 1/6, sehingga selesai dalam 6 hari.",
    "C",
    { A: "4 hari", B: "5 hari", C: "6 hari", D: "7 hari", E: "8 hari" },
  ],
  [
    "Dalam kotak terdapat 4 bola merah dan 6 bola putih. Peluang mengambil bola merah adalah...",
    "Peluang",
    "MUDAH",
    "Total bola 10, bola merah 4, peluangnya 4/10 = 2/5.",
    "A",
    { A: "2/5", B: "3/5", C: "4/6", D: "5/6", E: "1/2" },
  ],
  [
    "Dari 6 orang akan dipilih 2 orang sebagai perwakilan. Banyak cara memilih adalah...",
    "Kombinatorika",
    "SEDANG",
    "Banyak cara memilih 2 dari 6 adalah 6C2 = 15.",
    "D",
    { A: "10", B: "12", C: "14", D: "15", E: "18" },
  ],
  [
    "Empat orang akan duduk berbaris. Banyak susunan yang mungkin adalah...",
    "Kombinatorika",
    "MUDAH",
    "Banyak susunan 4 orang berbeda adalah 4! = 24.",
    "E",
    { A: "8", B: "12", C: "16", D: "20", E: "24" },
  ],
  [
    "Jika 2(x + 3) = 18, maka nilai x adalah...",
    "Aljabar",
    "MUDAH",
    "2(x + 3) = 18 berarti x + 3 = 9, sehingga x = 6.",
    "C",
    { A: "3", B: "5", C: "6", D: "8", E: "9" },
  ],
  [
    "Nilai 200 dinaikkan 10%, lalu hasilnya diturunkan 10%. Nilai akhirnya adalah...",
    "Persentase",
    "SEDANG",
    "200 naik 10% menjadi 220. Turun 10% dari 220 menjadi 198.",
    "B",
    { A: "196", B: "198", C: "200", D: "202", E: "204" },
  ],
  [
    "Nilai 3/4 dari 120 adalah...",
    "Pecahan",
    "MUDAH",
    "3/4 x 120 = 90.",
    "D",
    { A: "75", B: "80", C: "85", D: "90", E: "95" },
  ],
  [
    "Sinonim kata valid adalah...",
    "Verbal",
    "MUDAH",
    "Valid berarti sah atau dapat diterima kebenarannya.",
    "A",
    { A: "Sah", B: "Ragu", C: "Keliru", D: "Lemah", E: "Samar" },
  ],
  [
    "Antonim kata tradisional adalah...",
    "Verbal",
    "MUDAH",
    "Tradisional berlawanan makna dengan modern.",
    "E",
    { A: "Lama", B: "Klasik", C: "Kuno", D: "Biasa", E: "Modern" },
  ],
  [
    "APOTEKER : OBAT = KOKI : ...",
    "Analogi",
    "MUDAH",
    "Apoteker berkaitan dengan obat, koki berkaitan dengan masakan.",
    "B",
    { A: "Dapur", B: "Masakan", C: "Restoran", D: "Kompor", E: "Menu" },
  ],
  [
    "PILOT : PESAWAT = MASINIS : ...",
    "Analogi",
    "MUDAH",
    "Pilot mengoperasikan pesawat, masinis mengoperasikan kereta.",
    "C",
    { A: "Stasiun", B: "Rel", C: "Kereta", D: "Tiket", E: "Gerbong" },
  ],
  [
    "PEMADAM : API = DOKTER : ...",
    "Analogi",
    "MUDAH",
    "Pemadam menangani api, dokter menangani penyakit.",
    "D",
    { A: "Rumah sakit", B: "Pasien", C: "Obat", D: "Penyakit", E: "Perawat" },
  ],
  [
    "Semua arsiparis teliti. Rudi adalah arsiparis. Kesimpulan yang tepat adalah...",
    "Penalaran Logis",
    "MUDAH",
    "Jika semua arsiparis teliti dan Rudi arsiparis, maka Rudi teliti.",
    "A",
    {
      A: "Rudi teliti",
      B: "Rudi bukan arsiparis",
      C: "Semua orang teliti adalah arsiparis",
      D: "Rudi mungkin tidak teliti",
      E: "Tidak dapat disimpulkan",
    },
  ],
  [
    "Negasi dari pernyataan Sebagian pegawai tidak hadir adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Negasi dari sebagian pegawai tidak hadir adalah semua pegawai hadir.",
    "E",
    {
      A: "Sebagian pegawai hadir",
      B: "Tidak ada pegawai hadir",
      C: "Semua pegawai tidak hadir",
      D: "Ada pegawai yang hadir",
      E: "Semua pegawai hadir",
    },
  ],
  [
    "Jika dokumen lengkap maka permohonan diproses. Dokumen lengkap. Kesimpulannya...",
    "Penalaran Logis",
    "MUDAH",
    "Modus ponens: jika P maka Q, P benar, maka Q benar.",
    "B",
    {
      A: "Permohonan ditolak",
      B: "Permohonan diproses",
      C: "Dokumen belum tentu lengkap",
      D: "Permohonan tidak dapat disimpulkan",
      E: "Dokumen dikembalikan",
    },
  ],
  [
    "Jika lampu indikator menyala maka mesin aktif. Mesin tidak aktif. Kesimpulan yang tepat adalah...",
    "Penalaran Logis",
    "SEDANG",
    "Modus tollens: jika P maka Q, tidak Q, maka tidak P. Jadi lampu indikator tidak menyala.",
    "C",
    {
      A: "Lampu indikator menyala",
      B: "Mesin rusak",
      C: "Lampu indikator tidak menyala",
      D: "Mesin aktif sebentar",
      E: "Tidak ada hubungan",
    },
  ],
  [
    "Bacalah kalimat berikut. Layanan satu pintu mempercepat proses perizinan karena pemohon tidak perlu berpindah antarunit. Ide pokok kalimat tersebut adalah...",
    "Pemahaman Bacaan",
    "MUDAH",
    "Ide pokoknya adalah layanan satu pintu mempercepat proses perizinan.",
    "D",
    {
      A: "Pemohon berpindah antarunit",
      B: "Unit kerja bertambah banyak",
      C: "Perizinan selalu sulit",
      D: "Layanan satu pintu mempercepat perizinan",
      E: "Pemohon tidak membutuhkan petugas",
    },
  ],
  [
    "Data menunjukkan aduan turun setelah informasi persyaratan dibuat lebih jelas. Kesimpulan yang paling tepat adalah...",
    "Penalaran Analitis",
    "SEDANG",
    "Informasi persyaratan yang jelas dapat mengurangi kesalahan dan aduan pemohon.",
    "A",
    {
      A: "Kejelasan informasi membantu menurunkan aduan",
      B: "Aduan turun karena layanan ditutup",
      C: "Persyaratan tidak diperlukan lagi",
      D: "Petugas tidak perlu memberi penjelasan",
      E: "Semua aduan berasal dari petugas",
    },
  ],
  [
    "Jika BINA dikodekan menjadi CJOB dengan pergeseran huruf +1, maka DESA dikodekan menjadi...",
    "Kode Huruf",
    "SEDANG",
    "Setiap huruf digeser satu posisi: D-E, E-F, S-T, A-B.",
    "B",
    { A: "EFTA", B: "EFTB", C: "FETB", D: "EDTB", E: "FGUC" },
  ],
  [
    "Kata yang tidak sekelompok adalah...",
    "Klasifikasi Verbal",
    "MUDAH",
    "Meja, kursi, dan lemari adalah perabot. Sendok bukan perabot sejenis.",
    "E",
    { A: "Meja", B: "Kursi", C: "Lemari", D: "Rak", E: "Sendok" },
  ],
  [
    "BESAR : KECIL = TINGGI : ...",
    "Analogi",
    "MUDAH",
    "Besar berlawanan dengan kecil, tinggi berlawanan dengan rendah.",
    "A",
    { A: "Rendah", B: "Panjang", C: "Lebar", D: "Pendek", E: "Dalam" },
  ],
  [
    "Jika x = 25% dari 160 dan y = 1/5 dari 200, maka hubungan x dan y adalah...",
    "Perbandingan Kuantitatif",
    "MUDAH",
    "x = 40 dan y = 40, sehingga x = y.",
    "C",
    {
      A: "x > y",
      B: "x < y",
      C: "x = y",
      D: "x + y = 60",
      E: "Tidak dapat ditentukan",
    },
  ],
  [
    "Sebuah kegiatan dimulai pukul 09.40 dan berlangsung 1 jam 45 menit. Kegiatan selesai pukul...",
    "Aritmetika Waktu",
    "MUDAH",
    "09.40 ditambah 1 jam 45 menit menjadi 11.25.",
    "D",
    { A: "11.05", B: "11.10", C: "11.15", D: "11.25", E: "11.35" },
  ],
  [
    "Bentuk sederhana dari 18/24 adalah...",
    "Pecahan",
    "MUDAH",
    "18/24 disederhanakan dengan membagi 6 menjadi 3/4.",
    "A",
    { A: "3/4", B: "2/3", C: "4/5", D: "5/6", E: "6/8" },
  ],
];

const tkpData: TkpSeedTuple[] = [
  [
    "Warga lanjut usia kesulitan memahami alur layanan digital. Anda...",
    "Orientasi Pelayanan",
    "MUDAH",
    "Pelayanan yang baik memberi bantuan sesuai kebutuhan tanpa mengurangi martabat warga.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meminta warga mencari bantuan keluarga",
      B: "Mengarahkan ke komputer tanpa penjelasan",
      C: "Membantu langkah yang diperlukan dan menjelaskan dengan bahasa sederhana",
      D: "Memberikan panduan tertulis yang mudah diikuti",
      E: "Meminta warga datang saat kantor sepi",
    },
  ],
  [
    "Anda menemukan kesalahan input data yang Anda lakukan sendiri. Sikap Anda...",
    "Tanggung Jawab",
    "MUDAH",
    "Kesalahan harus diakui, diperbaiki sesuai prosedur, dan dilaporkan bila berdampak pada layanan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan karena belum ada yang tahu",
      B: "Menghapus jejak perubahan",
      C: "Mengakui, memperbaiki sesuai prosedur, dan memberi tahu pihak terkait",
      D: "Mencatat penyebab agar tidak terulang",
      E: "Menunggu ada keluhan dari pemohon",
    },
  ],
  [
    "Anda diminta menilai berkas milik kerabat dekat. Tindakan yang tepat adalah...",
    "Konflik Kepentingan",
    "SEDANG",
    "Potensi konflik kepentingan perlu disampaikan agar proses tetap objektif dan akuntabel.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memproses sendiri karena memahami kondisinya",
      B: "Mempercepat selama syarat lengkap",
      C: "Menyampaikan potensi konflik kepentingan dan meminta penugasan ulang sesuai prosedur",
      D: "Memastikan berkas dinilai oleh petugas lain yang berwenang",
      E: "Meminta kerabat tidak memberitahu siapa pun",
    },
  ],
  [
    "Unit Anda memakai sistem baru yang sering berubah tampilannya. Anda...",
    "Adaptasi Teknologi",
    "SEDANG",
    "Adaptasi teknologi dilakukan dengan belajar mandiri, mengikuti panduan, dan tetap menjaga kualitas layanan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Kembali memakai cara lama tanpa izin",
      B: "Menunggu rekan mengajari setiap perubahan",
      C: "Mencatat fitur yang berubah dan bertanya bila perlu",
      D: "Mempelajari panduan, mencoba di lingkungan aman, dan berbagi temuan kepada tim",
      E: "Mengeluh karena perubahan menghambat pekerjaan",
    },
  ],
  [
    "Tim lintas unit berbeda pendapat tentang prioritas layanan. Anda...",
    "Kerja Sama",
    "SEDANG",
    "Kerja sama lintas unit perlu fokus pada tujuan layanan dan data prioritas.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memaksakan prioritas unit sendiri",
      B: "Menarik diri dari pembahasan",
      C: "Mengajak menyepakati prioritas berdasarkan urgensi, data, dan dampak layanan",
      D: "Membantu merumuskan pembagian tugas lintas unit",
      E: "Menunggu keputusan pimpinan tanpa masukan",
    },
  ],
  [
    "Kritik terhadap layanan kantor Anda ramai di media sosial. Anda...",
    "Komunikasi Publik",
    "SEDANG",
    "Kritik publik perlu direspons melalui kanal resmi dengan data yang benar dan rencana perbaikan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membalas dengan akun pribadi",
      B: "Mengabaikan karena hanya media sosial",
      C: "Mengumpulkan fakta, menyampaikan ke kanal resmi, dan mengusulkan tindak lanjut",
      D: "Membuat ringkasan isu untuk pimpinan",
      E: "Meminta rekan ikut membela kantor",
    },
  ],
  [
    "Ada warga prioritas yang membutuhkan penyesuaian antrean sesuai prosedur. Anda...",
    "Orientasi Pelayanan",
    "MUDAH",
    "Prioritas layanan perlu diberikan sesuai aturan dan tetap dikomunikasikan agar warga lain memahami.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengabaikan karena antrean harus selalu sama",
      B: "Meminta warga prioritas menunggu sampai akhir",
      C: "Memberikan prioritas sesuai prosedur dan menjelaskan alur kepada pihak terkait",
      D: "Berkoordinasi dengan petugas antrean agar tertib",
      E: "Meminta warga lain memutuskan sendiri",
    },
  ],
  [
    "Layanan tertunda karena dokumen internal belum ditandatangani pejabat terkait. Anda...",
    "Orientasi Hasil",
    "SEDANG",
    "Orientasi hasil menuntut koordinasi aktif dan informasi yang jelas kepada penerima layanan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menunggu tanpa memberi kabar",
      B: "Menyalahkan pejabat terkait kepada warga",
      C: "Menghubungi pihak terkait, memberi estimasi, dan menawarkan langkah sementara yang sah",
      D: "Mencatat keterlambatan untuk evaluasi alur",
      E: "Meminta warga kembali tanpa kepastian",
    },
  ],
  [
    "Rekan sering tidak hadir pada rapat koordinasi sehingga keputusan tim tertunda. Anda...",
    "Kerja Sama",
    "SEDANG",
    "Masalah kehadiran perlu dikomunikasikan secara konstruktif dan dikaitkan dengan dampak kerja tim.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membicarakannya di belakang rekan",
      B: "Mengeluarkan rekan dari grup kerja",
      C: "Berbicara personal tentang kendala dan dampaknya pada tim",
      D: "Mengusulkan mekanisme notulen dan tindak lanjut yang jelas",
      E: "Menunggu atasan menegur",
    },
  ],
  [
    "Anda menerima tugas yang belum pernah dikerjakan sebelumnya. Sikap Anda...",
    "Pengembangan Diri",
    "MUDAH",
    "Kemauan belajar ditunjukkan dengan mempelajari tugas, mencari referensi, dan meminta arahan bila perlu.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menolak karena bukan keahlian Anda",
      B: "Mengerjakan seadanya tanpa belajar",
      C: "Mempelajari panduan, mencari contoh, dan berkonsultasi bila diperlukan",
      D: "Membuat daftar hal yang perlu dipahami sebelum mulai",
      E: "Mendelegasikan kepada rekan yang lebih berpengalaman",
    },
  ],
  [
    "Atasan meminta laporan mendadak di luar tugas rutin Anda. Anda...",
    "Profesionalisme",
    "SEDANG",
    "Profesionalisme berarti menilai urgensi, mengatur prioritas, dan menyelesaikan tugas dengan tanggung jawab.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Menolak karena tidak ada di rencana kerja",
      B: "Mengerjakan setelah semua tugas pribadi selesai",
      C: "Menanyakan tenggat dan format laporan",
      D: "Mengatur prioritas, meminta data yang dibutuhkan, dan menyelesaikan sesuai tenggat",
      E: "Meminta rekan membuatkan seluruh laporan",
    },
  ],
  [
    "Penerima layanan menawarkan voucher setelah urusannya selesai. Anda...",
    "Integritas",
    "MUDAH",
    "Pemberian terkait layanan berpotensi gratifikasi sehingga harus ditolak dan dilaporkan sesuai kondisi.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Menerima karena bukan uang tunai",
      B: "Menerima lalu digunakan bersama tim",
      C: "Menolak dengan sopan dan menjelaskan aturan gratifikasi",
      D: "Menerima jika nilainya kecil",
      E: "Melaporkan jika pemberi tetap memaksa",
    },
  ],
  [
    "Rekan meminta salinan data pribadi pemohon untuk keperluan yang belum jelas. Anda...",
    "Keamanan Data",
    "SEDANG",
    "Data pribadi hanya boleh dibagikan sesuai kewenangan, tujuan yang sah, dan kanal resmi.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengirim agar pekerjaan cepat selesai",
      B: "Mengirim sebagian tanpa mencatat",
      C: "Menolak sampai ada dasar kewenangan dan kanal resmi yang aman",
      D: "Meminta surat atau tiket permintaan data sesuai prosedur",
      E: "Menanyakan lewat pesan pribadi saja",
    },
  ],
  [
    "Anda menerima tautan email yang meminta verifikasi password kantor. Anda...",
    "Keamanan Informasi",
    "MUDAH",
    "Tautan mencurigakan harus dihindari dan dilaporkan ke tim pengelola keamanan informasi.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengklik tautan untuk memastikan",
      B: "Meneruskan ke rekan agar diperiksa",
      C: "Tidak mengklik, melaporkan ke tim IT, dan mengikuti prosedur keamanan",
      D: "Menghapus email setelah mencatat alamat pengirim",
      E: "Membalas email meminta penjelasan",
    },
  ],
  [
    "Rapat daring terganggu karena koneksi sebagian peserta buruk. Anda...",
    "Adaptasi",
    "SEDANG",
    "Adaptasi dilakukan dengan menjaga tujuan rapat melalui alternatif komunikasi dan dokumentasi keputusan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membatalkan tanpa jadwal ulang",
      B: "Melanjutkan tanpa peserta yang terkendala",
      C: "Merangkum poin penting, menggunakan kanal alternatif, dan memastikan keputusan terdokumentasi",
      D: "Menjadwalkan tindak lanjut untuk hal yang belum dipahami",
      E: "Menyalahkan peserta yang koneksinya buruk",
    },
  ],
  [
    "Dua tugas penting memiliki tenggat bersamaan. Anda...",
    "Manajemen Waktu",
    "SEDANG",
    "Prioritas perlu diklarifikasi dan risiko keterlambatan disampaikan sejak awal.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengerjakan tugas yang paling mudah saja",
      B: "Menunggu sampai salah satu pemberi tugas menanyakan",
      C: "Mengklarifikasi prioritas, menyusun jadwal, dan mengomunikasikan risiko",
      D: "Meminta dukungan rekan bila beban tidak seimbang",
      E: "Mengerjakan keduanya tanpa rencana",
    },
  ],
  [
    "Anggaran kegiatan tidak cukup untuk semua kebutuhan layanan. Anda...",
    "Manajemen Sumber Daya",
    "SEDANG",
    "Penggunaan sumber daya perlu didasarkan pada urgensi, dampak, dan akuntabilitas.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membagi rata tanpa mempertimbangkan kebutuhan",
      B: "Menghapus kegiatan yang paling sulit",
      C: "Menyusun prioritas berdasarkan urgensi dan dampak layanan",
      D: "Mencari alternatif efisiensi yang tetap sesuai aturan",
      E: "Meminta tambahan tanpa kajian",
    },
  ],
  [
    "Regulasi layanan berubah, tetapi sebagian pegawai masih memakai aturan lama. Anda...",
    "Kepatuhan Regulasi",
    "SULIT",
    "Perubahan regulasi harus dikomunikasikan dan diterapkan melalui pembaruan SOP yang sah.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan karena sudah kebiasaan",
      B: "Mengubah prosedur sendiri tanpa persetujuan",
      C: "Mengusulkan pembaruan SOP dan sosialisasi berdasarkan regulasi terbaru",
      D: "Mengonfirmasi ke bagian hukum atau pimpinan terkait penerapan",
      E: "Menunggu sampai ada pemeriksaan",
    },
  ],
  [
    "Usulan inovasi Anda dikritik karena belum memiliki data pendukung. Anda...",
    "Inovasi",
    "SEDANG",
    "Inovasi perlu dilengkapi data, uji manfaat, dan perbaikan berdasarkan masukan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membatalkan semua rencana inovasi",
      B: "Tetap menjalankan tanpa persetujuan",
      C: "Mengumpulkan data pendukung dan memperbaiki usulan",
      D: "Meminta masukan tim untuk menguji manfaat dan risiko",
      E: "Mengirim ulang usulan yang sama",
    },
  ],
  [
    "Pemohon tidak memahami istilah teknis dalam formulir. Anda...",
    "Sosial Budaya",
    "MUDAH",
    "Petugas perlu menjelaskan dengan bahasa sederhana dan memastikan pemohon memahami tanpa merendahkan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meminta pemohon membaca ulang sendiri",
      B: "Mengulang istilah teknis dengan suara lebih keras",
      C: "Menjelaskan dengan bahasa sederhana dan contoh yang relevan",
      D: "Memberikan panduan visual atau contoh pengisian",
      E: "Mengarahkan ke loket lain tanpa penjelasan",
    },
  ],
  [
    "Penyandang disabilitas membutuhkan akses layanan yang lebih sesuai. Anda...",
    "Pelayanan Inklusif",
    "MUDAH",
    "Pelayanan inklusif memberi penyesuaian yang layak sesuai prosedur dan menghormati kemandirian pemohon.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Meminta pendampingnya mengurus semua proses",
      B: "Mengarahkan ke antrean biasa tanpa bantuan",
      C: "Memberikan penyesuaian akses sesuai kebutuhan dan prosedur",
      D: "Berkoordinasi dengan petugas terkait fasilitas aksesibilitas",
      E: "Meminta datang di hari lain",
    },
  ],
  [
    "Terjadi gangguan layanan akibat banjir di sekitar kantor. Anda...",
    "Pelayanan Publik",
    "SULIT",
    "Dalam kondisi darurat, keselamatan, koordinasi, dan layanan esensial harus diprioritaskan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Tetap membuka semua layanan tanpa penyesuaian",
      B: "Menutup layanan tanpa informasi",
      C: "Menginformasikan gangguan kepada masyarakat",
      D: "Berkoordinasi, memastikan keselamatan, dan menjalankan layanan esensial sesuai prosedur",
      E: "Menunggu kondisi normal tanpa tindakan",
    },
  ],
  [
    "Teman mengajak Anda menunjukkan dukungan politik di media sosial dengan identitas ASN. Anda...",
    "Netralitas ASN",
    "MUDAH",
    "ASN wajib menjaga netralitas dan tidak menunjukkan dukungan politik praktis.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Mengunggah dukungan karena akun pribadi",
      B: "Menyukai unggahan kampanye tanpa komentar",
      C: "Menolak dan menjaga netralitas ASN",
      D: "Menggunakan akun anonim untuk mendukung",
      E: "Mengingatkan teman tentang aturan netralitas",
    },
  ],
  [
    "Ada perubahan jam layanan yang harus segera diketahui masyarakat. Anda...",
    "Komunikasi Publik",
    "SEDANG",
    "Informasi layanan harus disampaikan melalui kanal resmi secara jelas dan konsisten.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menunggu warga datang dan bertanya",
      B: "Menyampaikan hanya lewat grup pribadi",
      C: "Menyusun pengumuman resmi yang jelas dan memastikan petugas memahami perubahan",
      D: "Membuat daftar tanya jawab untuk mengurangi kebingungan",
      E: "Memberi tahu sebagian warga saja",
    },
  ],
  [
    "Pegawai baru sering keliru mengikuti SOP. Anda...",
    "Mentoring",
    "MUDAH",
    "Membimbing pegawai baru dengan sabar membantu mutu layanan tim.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkannya agar belajar sendiri",
      B: "Menegur keras di depan tim",
      C: "Menjelaskan ulang SOP, memberi contoh, dan memantau progresnya",
      D: "Mengarahkan ke dokumen panduan yang relevan",
      E: "Mengambil alih semua tugasnya",
    },
  ],
  [
    "Dua anggota tim saling menyalahkan atas keterlambatan pekerjaan. Anda...",
    "Kerja Sama",
    "SEDANG",
    "Konflik tim perlu diarahkan ke penyelesaian masalah dan pembagian tanggung jawab yang jelas.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memilih pihak yang paling Anda percaya",
      B: "Membiarkan mereka menyelesaikan sendiri",
      C: "Mengajak fokus pada fakta, kendala, dan rencana penyelesaian",
      D: "Membagi ulang tugas agar tenggat tetap tercapai",
      E: "Langsung melaporkan tanpa mediasi",
    },
  ],
  [
    "Volume pekerjaan meningkat dan Anda mulai merasa kewalahan. Anda...",
    "Pengendalian Diri",
    "SEDANG",
    "Mengelola tekanan dilakukan dengan menyusun prioritas, menjaga komunikasi, dan meminta dukungan sesuai kebutuhan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Mengabaikan semua pesan sampai tenang",
      B: "Mengerjakan acak tanpa prioritas",
      C: "Menyusun prioritas, memberi update, dan meminta dukungan bila diperlukan",
      D: "Mengambil jeda singkat agar tetap fokus",
      E: "Mengeluh kepada semua rekan",
    },
  ],
  [
    "Arsip penting tidak ditemukan saat dibutuhkan. Anda...",
    "Ketelitian Administrasi",
    "SEDANG",
    "Arsip yang hilang perlu ditelusuri, dicatat, dan dicegah agar tidak terulang.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membuat arsip pengganti tanpa catatan",
      B: "Menyalahkan petugas sebelumnya",
      C: "Menelusuri riwayat arsip, melapor, dan mencatat tindakan pemulihan",
      D: "Mengevaluasi alur penyimpanan agar tidak berulang",
      E: "Menunggu sampai arsip muncul sendiri",
    },
  ],
  [
    "Sistem antrean elektronik mati saat loket ramai. Anda...",
    "Orientasi Pelayanan",
    "SEDANG",
    "Gangguan sistem harus ditangani dengan prosedur cadangan dan komunikasi yang tertib kepada warga.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menutup loket sampai sistem hidup",
      B: "Membiarkan warga berebut antrean",
      C: "Mengaktifkan prosedur antrean manual sementara dan melaporkan gangguan",
      D: "Memberi informasi jelas agar antrean tetap tertib",
      E: "Meminta warga pulang tanpa kepastian",
    },
  ],
  [
    "Anda melihat rekan memanipulasi angka kecil pada laporan kinerja. Anda...",
    "Integritas",
    "SULIT",
    "Manipulasi laporan melanggar integritas dan harus dihentikan melalui langkah yang tepat.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan karena angkanya kecil",
      B: "Ikut menyesuaikan angka agar tim terlihat baik",
      C: "Mengingatkan rekan untuk memperbaiki dan menggunakan data sebenarnya",
      D: "Melaporkan melalui jalur yang sesuai bila tidak diperbaiki",
      E: "Membicarakan ke rekan lain lebih dulu",
    },
  ],
  [
    "Ada pelatihan singkat yang relevan, tetapi jadwalnya berdekatan dengan tugas rutin. Anda...",
    "Pengembangan Diri",
    "MUDAH",
    "Pengembangan kompetensi perlu diimbangi dengan pengaturan tugas agar pekerjaan tetap berjalan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Tidak ikut karena merepotkan",
      B: "Ikut tanpa mengatur tugas rutin",
      C: "Memastikan tugas utama tetap tertangani",
      D: "Mengatur jadwal, mengikuti pelatihan, dan menerapkan hasilnya",
      E: "Meminta rekan mengikuti sebagai pengganti",
    },
  ],
  [
    "Anda diminta mempresentasikan capaian layanan kepada pimpinan. Anda...",
    "Komunikasi",
    "SEDANG",
    "Presentasi kerja perlu disiapkan dengan data valid, ringkas, dan siap menjawab pertanyaan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Menyampaikan spontan tanpa persiapan",
      B: "Menggunakan data lama agar cepat",
      C: "Mengumpulkan data dari unit terkait",
      D: "Menyiapkan data valid, poin utama, dan antisipasi pertanyaan",
      E: "Meminta orang lain mempresentasikan",
    },
  ],
  [
    "Warga berbicara kasar karena kecewa dengan hasil verifikasi. Anda...",
    "Pengendalian Diri",
    "SEDANG",
    "Petugas perlu tetap tenang, mendengarkan, dan menjelaskan dasar keputusan secara profesional.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membalas dengan nada keras",
      B: "Meninggalkan warga begitu saja",
      C: "Tetap tenang, mendengarkan, dan menjelaskan dasar verifikasi sesuai aturan",
      D: "Meminta bantuan atasan bila situasi tidak kondusif",
      E: "Menyuruh warga membuat keluhan tanpa penjelasan",
    },
  ],
  [
    "Sebagai koordinator, tim Anda harus lembur karena layanan menumpuk. Anda...",
    "Kepemimpinan",
    "SULIT",
    "Pemimpin perlu menjaga target sekaligus membagi beban secara adil dan memperhatikan kondisi tim.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Memaksa semua orang lembur tanpa pengaturan",
      B: "Membiarkan anggota memilih sendiri tugasnya",
      C: "Mengapresiasi tim dan mencatat kebutuhan kompensasi sesuai aturan",
      D: "Membagi beban, menetapkan prioritas, dan mengatur waktu istirahat secara adil",
      E: "Mengurangi pemeriksaan agar cepat selesai",
    },
  ],
  [
    "Usulan Anda tidak dipilih dalam rapat. Reaksi terbaik adalah...",
    "Pengendalian Diri",
    "MUDAH",
    "Sikap profesional adalah menerima keputusan dan tetap mendukung hasil rapat.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menolak membantu pelaksanaan keputusan",
      B: "Membahas kekecewaan di luar rapat",
      C: "Menerima keputusan dan tetap berkontribusi pada pelaksanaannya",
      D: "Meminta catatan alasan agar bisa memperbaiki usulan berikutnya",
      E: "Memaksakan usulan agar dipertimbangkan ulang",
    },
  ],
  [
    "Pegawai yang lebih muda mengoreksi kekeliruan Anda dengan data yang benar. Anda...",
    "Profesionalisme",
    "MUDAH",
    "Profesionalisme berarti terbuka pada koreksi berbasis data tanpa melihat senioritas.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menolak karena ia lebih muda",
      B: "Menerima tetapi tidak mengubah pekerjaan",
      C: "Memeriksa data, berterima kasih, dan memperbaiki kekeliruan",
      D: "Mencatat koreksi untuk pembelajaran",
      E: "Meminta koreksi disampaikan melalui atasan",
    },
  ],
  [
    "Anda melihat alur layanan bisa dibuat lebih sederhana tanpa melanggar aturan. Anda...",
    "Inovasi",
    "SEDANG",
    "Perbaikan layanan sebaiknya diajukan dengan analisis manfaat dan risiko melalui kanal resmi.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Langsung mengubah alur sendiri",
      B: "Tidak melakukan apa-apa karena bukan tugas Anda",
      C: "Menyusun usulan berbasis data dan menyampaikan melalui forum resmi",
      D: "Mendiskusikan manfaat dan risiko dengan tim",
      E: "Menunggu masyarakat mengeluh dulu",
    },
  ],
  [
    "Keluarga meminta Anda mempercepat pengurusan dokumen tanpa antre. Anda...",
    "Integritas",
    "MUDAH",
    "Integritas pelayanan menuntut perlakuan adil dan kepatuhan pada antrean serta prosedur.",
    { A: 1, B: 2, C: 5, D: 3, E: 4 },
    {
      A: "Membantu karena keluarga sendiri",
      B: "Memproses di luar jam layanan tanpa catatan",
      C: "Menolak perlakuan khusus dan mengarahkan mengikuti prosedur",
      D: "Meminta keluarga tidak menceritakan kepada orang lain",
      E: "Menjelaskan aturan antrean dengan sopan",
    },
  ],
  [
    "Ada informasi keliru tentang kantor Anda tersebar di grup masyarakat. Anda...",
    "Komunikasi Publik",
    "SEDANG",
    "Informasi keliru perlu diluruskan melalui sumber resmi dengan bahasa yang jelas dan tenang.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membalas secara emosional",
      B: "Membiarkan karena bukan kanal resmi",
      C: "Mengusulkan klarifikasi resmi berdasarkan fakta",
      D: "Menyampaikan materi klarifikasi kepada petugas layanan",
      E: "Meminta anggota grup menghapus sendiri",
    },
  ],
  [
    "Anda harus mempelajari aplikasi baru sambil tetap melayani warga. Anda...",
    "Adaptasi Teknologi",
    "SEDANG",
    "Belajar sistem baru perlu dilakukan bertahap tanpa mengorbankan mutu layanan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menolak memakai aplikasi sampai benar-benar mahir",
      B: "Meminta rekan menggantikan semua layanan",
      C: "Mempelajari fitur utama, menggunakan panduan, dan menjaga layanan tetap berjalan",
      D: "Mencatat kendala untuk dilaporkan ke admin sistem",
      E: "Menggunakan aplikasi hanya saat diawasi",
    },
  ],
  [
    "Atasan meminta Anda menandatangani dokumen yang belum Anda periksa. Anda...",
    "Integritas",
    "SULIT",
    "Tanggung jawab dokumen menuntut pemeriksaan sebelum tanda tangan, meskipun ada tekanan waktu.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Menandatangani karena diminta atasan",
      B: "Menandatangani lalu memeriksa belakangan",
      C: "Meminta waktu memeriksa isi dokumen sebelum menandatangani",
      D: "Menjelaskan risiko tanda tangan tanpa verifikasi",
      E: "Menolak tanpa memberi alasan",
    },
  ],
  [
    "Anda melihat pemohon dari daerah tertentu dilayani kurang ramah oleh petugas. Anda...",
    "Sosial Budaya",
    "SEDANG",
    "Pelayanan publik harus setara dan menghormati keberagaman warga.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan karena bukan loket Anda",
      B: "Menegur keras di depan pemohon",
      C: "Mengingatkan petugas secara profesional agar layanan tetap setara",
      D: "Melaporkan bila perilaku diskriminatif terus terjadi",
      E: "Mengambil alih tanpa menjelaskan masalah",
    },
  ],
  [
    "Di ruang layanan terjadi keadaan darurat kesehatan pada seorang pemohon. Anda...",
    "Pelayanan Publik",
    "SULIT",
    "Keadaan darurat perlu ditangani dengan cepat, koordinatif, dan tetap menjaga ketertiban layanan.",
    { A: 1, B: 2, C: 4, D: 5, E: 3 },
    {
      A: "Melanjutkan layanan seperti biasa",
      B: "Menunggu keluarga pemohon datang",
      C: "Mengamankan area dan meminta bantuan petugas terkait",
      D: "Menghubungi bantuan darurat, mengatur kerumunan, dan mengikuti prosedur keselamatan",
      E: "Meminta pemohon lain menyelesaikan sendiri",
    },
  ],
  [
    "Masalah pribadi mulai mengganggu fokus kerja Anda. Sikap terbaik adalah...",
    "Profesionalisme",
    "SEDANG",
    "Profesionalisme berarti mengelola kondisi pribadi, menjaga komunikasi, dan mencari dukungan yang tepat bila diperlukan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Membiarkan pekerjaan tertunda",
      B: "Menyalahkan rekan saat terjadi kesalahan",
      C: "Mengatur prioritas, menjaga komunikasi, dan meminta dukungan yang sesuai",
      D: "Berkonsultasi dengan atasan bila perlu pengaturan tugas sementara",
      E: "Mengambil cuti tanpa koordinasi",
    },
  ],
  [
    "Anda diminta membuat keputusan cepat dengan informasi yang belum lengkap. Anda...",
    "Pengambilan Keputusan",
    "SULIT",
    "Keputusan cepat tetap perlu memakai informasi minimum yang valid, risiko yang jelas, dan koordinasi sesuai kewenangan.",
    { A: 1, B: 2, C: 5, D: 4, E: 3 },
    {
      A: "Memutuskan berdasarkan dugaan saja",
      B: "Menunda tanpa batas sampai data lengkap",
      C: "Mengumpulkan informasi kunci, menilai risiko, dan memutuskan sesuai kewenangan",
      D: "Mengonsultasikan hal kritis kepada pihak berwenang",
      E: "Menyerahkan keputusan kepada rekan tanpa arahan",
    },
  ],
];

// Paket D disusun sebagai variasi orisinal dengan pola dari bank soal CPNS SKD tahun lalu:
// TWK 30, TIU 35, TKP 45; bukan salinan soal ujian resmi.
const soalCpnsSkdPaketD: SoalSeed[] = [
  ...twkData.map((item) => pg("TWK", ...item)),
  ...tiuData.map((item) => pg("TIU", ...item)),
  ...tkpData.map((item) => tkp(...item)),
];

function assertSeedData(): void {
  const counts: Record<Subtes, number> = { TWK: 0, TIU: 0, TKP: 0 };

  for (const [index, soal] of soalCpnsSkdPaketD.entries()) {
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

export async function seedCpnsPaketD(createdById: string) {
  console.log("Seeding paket CPNS SKD Premium - Paket D...");
  console.log(`Referensi: ${BANK_SOAL_REFERENCE}`);

  if (!createdById) {
    throw new Error("createdById (Instruktur ID) is required.");
  }

  assertSeedData();

  const existing = await prisma.paketTryout.findUnique({
    where: { slug: PAKET_SLUG },
  });

  if (existing) {
    console.log("Paket D sudah ada, skip.");
    return;
  }

  const soalIds: string[] = [];

  for (const soal of soalCpnsSkdPaketD) {
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
      judul: "Tryout SKD CPNS Premium - Paket D",
      deskripsi:
        "Paket D berisi 110 soal latihan CPNS SKD yang disusun sebagai variasi orisinal dari pola bank soal tahun lalu, lengkap dengan pembahasan TWK, TIU, dan TKP.",
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

  await seedCpnsPaketD(instruktur.id);
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
