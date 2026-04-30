import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Label = "A" | "B" | "C" | "D" | "E";
type TingkatKesulitan = "MUDAH" | "SEDANG" | "SULIT";
type Subtes = "TWK" | "TIU" | "TKP";

type OpsiSeed = {
  label: Label;
  konten: string;
  isBenar: boolean;
  nilaiTkp?: 1 | 2 | 3 | 4 | 5;
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

function makePg(jawaban: Label, opsi: Record<Label, string>): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: label === jawaban,
  }));
}

function makeTkp(
  scores: Record<Label, 1 | 2 | 3 | 4 | 5>,
  opsi: Record<Label, string>
): OpsiSeed[] {
  return LABELS.map((label) => ({
    label,
    konten: opsi[label],
    isBenar: scores[label] === 5,
    nilaiTkp: scores[label],
  }));
}

// Soal latihan orisinal yang disusun mengikuti pola SKD CPNS 2024/seleksi terakhir:
// TWK 30, TIU 35, TKP 45; bukan salinan soal ujian resmi.
const soalCpnsSkdBerbayar: SoalSeed[] = [
  {
    konten: "Pancasila ditetapkan sebagai dasar negara pada tanggal...",
    topik: "Pancasila",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pancasila disahkan sebagai dasar negara oleh PPKI pada 18 Agustus 1945 bersamaan dengan pengesahan UUD 1945.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "17 Agustus 1945",
      B: "18 Agustus 1945",
      C: "1 Juni 1945",
      D: "22 Juni 1945",
      E: "29 Mei 1945",
    }),
  },
  {
    konten:
      "Contoh penerapan sila pertama Pancasila dalam lingkungan kerja adalah...",
    topik: "Pancasila",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Sila Ketuhanan Yang Maha Esa tercermin dalam sikap saling menghormati pemeluk agama dan keyakinan yang berbeda.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "Memilih rekan kerja berdasarkan suku yang sama",
      B: "Memaksakan keyakinan pribadi kepada bawahan",
      C: "Mengutamakan kelompok sendiri dalam pelayanan",
      D: "Menghormati rekan yang menjalankan ibadah",
      E: "Menolak bekerja sama dengan penganut agama lain",
    }),
  },
  {
    konten:
      "Nilai utama yang paling dekat dengan sila kedua Pancasila adalah...",
    topik: "Pancasila",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Sila Kemanusiaan yang Adil dan Beradab menekankan pengakuan martabat manusia, sikap adil, dan perilaku beradab.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "Ketuhanan",
      B: "Pengakuan harkat dan martabat manusia",
      C: "Persatuan bangsa",
      D: "Musyawarah mufakat",
      E: "Keadilan sosial dalam ekonomi",
    }),
  },
  {
    konten: "Rumusan tujuan negara Indonesia tercantum secara jelas dalam...",
    topik: "UUD 1945",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Tujuan negara tercantum dalam Pembukaan UUD 1945 alinea keempat, antara lain melindungi segenap bangsa dan memajukan kesejahteraan umum.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "Batang tubuh UUD 1945 Pasal 1",
      B: "Pembukaan UUD 1945 alinea pertama",
      C: "Pembukaan UUD 1945 alinea keempat",
      D: "Aturan Peralihan UUD 1945",
      E: "Penjelasan UUD 1945",
    }),
  },
  {
    konten:
      "Persamaan kedudukan warga negara di dalam hukum dan pemerintahan diatur dalam UUD 1945 Pasal...",
    topik: "UUD 1945",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pasal 27 ayat (1) UUD 1945 mengatur bahwa segala warga negara bersamaan kedudukannya di dalam hukum dan pemerintahan.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "27 ayat (1)",
      B: "28C ayat (1)",
      C: "30 ayat (1)",
      D: "31 ayat (1)",
      E: "33 ayat (3)",
    }),
  },
  {
    konten:
      "Hak dan kewajiban warga negara dalam usaha pertahanan dan keamanan negara diatur dalam UUD 1945 Pasal...",
    topik: "Bela Negara",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pasal 30 ayat (1) UUD 1945 menyebutkan bahwa tiap-tiap warga negara berhak dan wajib ikut serta dalam usaha pertahanan dan keamanan negara.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "27 ayat (2)",
      B: "28A",
      C: "29 ayat (2)",
      D: "30 ayat (1)",
      E: "34 ayat (1)",
    }),
  },
  {
    konten: "Lembaga negara yang berwenang mengubah UUD 1945 adalah...",
    topik: "UUD 1945",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Berdasarkan Pasal 3 dan Pasal 37 UUD 1945, MPR memiliki wewenang mengubah dan menetapkan UUD.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "DPR",
      B: "DPD",
      C: "MPR",
      D: "Presiden",
      E: "Mahkamah Konstitusi",
    }),
  },
  {
    konten:
      "Ketentuan bahwa Negara Indonesia adalah negara kesatuan yang berbentuk republik terdapat pada UUD 1945 Pasal...",
    topik: "NKRI",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pasal 1 ayat (1) UUD 1945 menyatakan Negara Indonesia ialah Negara Kesatuan yang berbentuk Republik.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (1)",
    }),
  },
  {
    konten: "Semboyan Bhinneka Tunggal Ika berasal dari kitab...",
    topik: "Bhinneka Tunggal Ika",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karya Mpu Tantular.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "Negarakertagama",
      B: "Pararaton",
      C: "Sutasoma",
      D: "Arjunawiwaha",
      E: "Ramayana",
    }),
  },
  {
    konten:
      "Nasionalisme yang sesuai dengan Pancasila ditunjukkan oleh sikap...",
    topik: "Nasionalisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Nasionalisme Pancasila mencintai bangsa sendiri tanpa merendahkan bangsa lain serta tetap menjunjung kemanusiaan.",
    subtes: "TWK",
    opsi: makePg("E", {
      A: "Menganggap bangsa sendiri selalu paling benar",
      B: "Menolak semua kerja sama internasional",
      C: "Mendahulukan suku sendiri dalam pelayanan publik",
      D: "Mengutamakan produk asing karena lebih modern",
      E: "Mencintai bangsa tanpa merendahkan bangsa lain",
    }),
  },
  {
    konten: "Dalam konteks ASN, integritas paling tepat dimaknai sebagai...",
    topik: "Integritas",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Integritas berarti keselarasan antara nilai, ucapan, dan tindakan, termasuk jujur serta konsisten mematuhi aturan.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "Kemampuan menyenangkan semua pihak",
      B: "Konsistensi antara ucapan, nilai, dan tindakan",
      C: "Keberanian mengambil keputusan tanpa aturan",
      D: "Kepatuhan hanya saat diawasi atasan",
      E: "Keterampilan memenangkan perdebatan",
    }),
  },
  {
    konten: "Berikut ini yang termasuk nilai dasar bela negara adalah...",
    topik: "Bela Negara",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Nilai dasar bela negara mencakup cinta tanah air, sadar berbangsa dan bernegara, setia kepada Pancasila, rela berkorban, dan kemampuan awal bela negara.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "Cinta tanah air dan rela berkorban",
      B: "Fanatisme daerah dan eksklusivisme",
      C: "Kebebasan tanpa tanggung jawab",
      D: "Kepentingan kelompok di atas negara",
      E: "Netral terhadap ancaman bangsa",
    }),
  },
  {
    konten:
      "Tindakan menolak gratifikasi dalam pelayanan publik terutama mencerminkan nilai...",
    topik: "Integritas",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Menolak gratifikasi menunjukkan integritas karena menjaga kejujuran, objektivitas, dan kepercayaan publik.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "Individualisme",
      B: "Kedaerahan",
      C: "Efisiensi administratif",
      D: "Kejujuran dan antikorupsi",
      E: "Kebebasan berpendapat",
    }),
  },
  {
    konten:
      "Bahasa Indonesia sebagai bahasa negara diatur dalam UUD 1945 Pasal...",
    topik: "Bahasa Negara",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pasal 36 UUD 1945 menyatakan bahasa negara ialah Bahasa Indonesia.",
    subtes: "TWK",
    opsi: makePg("E", {
      A: "32",
      B: "33",
      C: "34",
      D: "35",
      E: "36",
    }),
  },
  {
    konten: "Sumpah Pemuda diikrarkan pada tanggal...",
    topik: "Sejarah Nasional",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Sumpah Pemuda diikrarkan dalam Kongres Pemuda II pada 28 Oktober 1928.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "20 Mei 1908",
      B: "28 Oktober 1928",
      C: "1 Juni 1945",
      D: "17 Agustus 1945",
      E: "18 Agustus 1945",
    }),
  },
  {
    konten:
      "Panitia Persiapan Kemerdekaan Indonesia (PPKI) pada 18 Agustus 1945 menghasilkan keputusan utama berupa...",
    topik: "Sejarah Nasional",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Sidang PPKI 18 Agustus 1945 mengesahkan UUD 1945, memilih Presiden dan Wakil Presiden, serta membentuk KNIP.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "Mengesahkan UUD 1945 dan memilih Presiden serta Wakil Presiden",
      B: "Membentuk BPUPKI dan merumuskan Piagam Jakarta",
      C: "Menetapkan Dekrit Presiden 5 Juli 1959",
      D: "Membubarkan RIS dan kembali ke NKRI",
      E: "Menyusun naskah Proklamasi di Rengasdengklok",
    }),
  },
  {
    konten:
      "Piagam Jakarta yang menjadi bagian penting sejarah perumusan dasar negara disusun pada tanggal...",
    topik: "Sejarah Pancasila",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Piagam Jakarta disusun oleh Panitia Sembilan pada 22 Juni 1945.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "29 Mei 1945",
      B: "1 Juni 1945",
      C: "17 Agustus 1945",
      D: "22 Juni 1945",
      E: "18 Agustus 1945",
    }),
  },
  {
    konten:
      "UUD 1945 dalam sistem hukum Indonesia memiliki kedudukan sebagai...",
    topik: "Konstitusi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "UUD 1945 merupakan hukum dasar tertulis dan sumber hukum tertinggi dalam hierarki peraturan perundang-undangan.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "Peraturan pelaksana undang-undang",
      B: "Kesepakatan politik yang tidak mengikat",
      C: "Hukum dasar tertulis tertinggi",
      D: "Pedoman internal pemerintah daerah",
      E: "Dokumen sejarah tanpa kekuatan hukum",
    }),
  },
  {
    konten:
      "Pernyataan bahwa Indonesia adalah negara hukum tercantum dalam UUD 1945 Pasal...",
    topik: "UUD 1945",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Pasal 1 ayat (3) UUD 1945 menegaskan bahwa Negara Indonesia adalah negara hukum.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "1 ayat (1)",
      B: "1 ayat (2)",
      C: "1 ayat (3)",
      D: "2 ayat (1)",
      E: "3 ayat (3)",
    }),
  },
  {
    konten: "Pelaksanaan otonomi daerah dalam NKRI bertujuan utama untuk...",
    topik: "NKRI",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Otonomi daerah memberi kewenangan daerah mengurus kepentingan masyarakat setempat dalam kerangka NKRI agar pelayanan lebih efektif.",
    subtes: "TWK",
    opsi: makePg("E", {
      A: "Membentuk negara bagian yang berdiri sendiri",
      B: "Menghapus peran pemerintah pusat seluruhnya",
      C: "Memisahkan kewenangan daerah dari konstitusi",
      D: "Menciptakan hukum yang berbeda dari Pancasila",
      E: "Mendekatkan pelayanan dan pembangunan kepada masyarakat",
    }),
  },
  {
    konten:
      "Kewajiban warga negara membayar pajak paling tepat dikaitkan dengan prinsip...",
    topik: "Kewarganegaraan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Membayar pajak merupakan bentuk partisipasi warga negara dalam pembiayaan negara dan pembangunan nasional sesuai ketentuan hukum.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "Hak memperoleh jabatan",
      B: "Partisipasi dalam pembiayaan negara",
      C: "Kebebasan membentuk organisasi",
      D: "Hak mendapat pendidikan",
      E: "Kewajiban mengikuti wajib militer",
    }),
  },
  {
    konten:
      "Menurut UUD 1945, yang menjadi warga negara adalah orang-orang bangsa Indonesia asli dan...",
    topik: "Kewarganegaraan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pasal 26 UUD 1945 menyebut warga negara ialah orang-orang bangsa Indonesia asli dan orang-orang bangsa lain yang disahkan dengan undang-undang sebagai warga negara.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "Semua orang asing yang tinggal sementara di Indonesia",
      B: "Warga negara asing yang bekerja di Indonesia",
      C: "Setiap orang yang lahir di luar negeri",
      D: "Orang bangsa lain yang disahkan dengan undang-undang",
      E: "Setiap penduduk yang memiliki kartu keluarga",
    }),
  },
  {
    konten: "Ketahanan nasional paling tepat diartikan sebagai...",
    topik: "Wawasan Kebangsaan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Ketahanan nasional adalah kondisi dinamis bangsa yang berisi keuletan dan ketangguhan dalam menghadapi ancaman, gangguan, hambatan, dan tantangan.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "Keuletan dan ketangguhan bangsa menghadapi ancaman",
      B: "Kemampuan militer menguasai negara lain",
      C: "Kebijakan menutup diri dari dunia internasional",
      D: "Hak daerah untuk membuat ideologi sendiri",
      E: "Kekuatan ekonomi kelompok tertentu",
    }),
  },
  {
    konten:
      "Sikap yang paling mencerminkan persatuan dalam masyarakat majemuk adalah...",
    topik: "Bhinneka Tunggal Ika",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Persatuan dalam keberagaman diwujudkan dengan kerja sama, menghargai perbedaan, dan mengutamakan kepentingan bersama.",
    subtes: "TWK",
    opsi: makePg("E", {
      A: "Membatasi pergaulan hanya dengan kelompok sendiri",
      B: "Menganggap budaya sendiri paling tinggi",
      C: "Menolak pendapat dari kelompok minoritas",
      D: "Menyebarkan stereotip kepada kelompok lain",
      E: "Bekerja sama tanpa membedakan latar belakang",
    }),
  },
  {
    konten:
      "Lambang negara Indonesia adalah Garuda Pancasila dengan semboyan...",
    topik: "Pilar Negara",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Lambang negara Indonesia adalah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.",
    subtes: "TWK",
    opsi: makePg("C", {
      A: "Tut Wuri Handayani",
      B: "Ing Ngarsa Sung Tuladha",
      C: "Bhinneka Tunggal Ika",
      D: "Jalesveva Jayamahe",
      E: "Gemah Ripah Loh Jinawi",
    }),
  },
  {
    konten:
      "Dalam sistem pemerintahan presidensial menurut UUD 1945, Presiden berkedudukan sebagai...",
    topik: "UUD 1945",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Dalam sistem presidensial, Presiden memegang kekuasaan pemerintahan menurut UUD dan berkedudukan sebagai kepala negara sekaligus kepala pemerintahan.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "Kepala negara dan kepala pemerintahan",
      B: "Pemimpin DPR dan MPR",
      C: "Ketua lembaga yudikatif",
      D: "Pelaksana keputusan partai mayoritas",
      E: "Kepala pemerintahan daerah",
    }),
  },
  {
    konten:
      "Kewenangan menguji undang-undang terhadap UUD 1945 dimiliki oleh...",
    topik: "Lembaga Negara",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Mahkamah Konstitusi berwenang menguji undang-undang terhadap UUD 1945.",
    subtes: "TWK",
    opsi: makePg("B", {
      A: "Mahkamah Agung",
      B: "Mahkamah Konstitusi",
      C: "Komisi Yudisial",
      D: "Dewan Perwakilan Daerah",
      E: "Badan Pemeriksa Keuangan",
    }),
  },
  {
    konten: "Contoh bela negara dalam kehidupan sehari-hari bagi ASN adalah...",
    topik: "Bela Negara",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Bela negara tidak hanya militer, tetapi juga bekerja profesional, menjaga rahasia negara, melayani masyarakat, dan mematuhi hukum.",
    subtes: "TWK",
    opsi: makePg("D", {
      A: "Menghindari tugas pelayanan yang sulit",
      B: "Menyebarkan dokumen internal tanpa izin",
      C: "Mengutamakan kepentingan pribadi di kantor",
      D: "Melaksanakan tugas pelayanan dengan disiplin",
      E: "Menolak aturan karena berbeda pendapat",
    }),
  },
  {
    konten:
      "Sikap yang tepat saat menerima informasi provokatif yang dapat memecah persatuan adalah...",
    topik: "Nasionalisme Digital",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Informasi provokatif harus diverifikasi, tidak langsung disebarkan, dan dilaporkan bila berpotensi melanggar hukum.",
    subtes: "TWK",
    opsi: makePg("A", {
      A: "Memverifikasi sumber dan tidak ikut menyebarkan",
      B: "Menyebarkan agar semua orang waspada",
      C: "Menambahkan komentar emosional",
      D: "Mengirim ke semua grup kantor",
      E: "Mengabaikan tanpa membaca konteks apa pun",
    }),
  },
  {
    konten: "Makna musyawarah dalam sila keempat Pancasila adalah...",
    topik: "Pancasila",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Musyawarah menekankan pengambilan keputusan bersama secara bijaksana, menghormati pendapat, dan mengutamakan kepentingan umum.",
    subtes: "TWK",
    opsi: makePg("E", {
      A: "Keputusan selalu diambil oleh orang paling senior",
      B: "Pendapat mayoritas boleh menekan minoritas",
      C: "Setiap orang bebas menolak keputusan bersama",
      D: "Keputusan harus menguntungkan kelompok pengusul",
      E: "Keputusan diambil dengan hikmat untuk kepentingan bersama",
    }),
  },
  {
    konten: "Jika 5x - 3 = 17, maka nilai x adalah...",
    topik: "Matematika Dasar",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks: "5x - 3 = 17, maka 5x = 20 sehingga x = 4.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "2",
      B: "3",
      C: "4",
      D: "5",
      E: "6",
    }),
  },
  {
    konten: "Deret: 3, 6, 12, 24, 48, ... Bilangan berikutnya adalah...",
    topik: "Deret Angka",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks: "Pola deret adalah dikali 2. Setelah 48 adalah 96.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "72",
      B: "84",
      C: "96",
      D: "108",
      E: "120",
    }),
  },
  {
    konten: "DOKTER : PASIEN = GURU : ...",
    topik: "Analogi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Dokter melayani pasien, guru mengajar atau melayani murid.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "Sekolah",
      B: "Murid",
      C: "Pelajaran",
      D: "Kelas",
      E: "Buku",
    }),
  },
  {
    konten: "Sinonim kata 'valid' yang paling tepat adalah...",
    topik: "Verbal",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Valid berarti sah, berlaku, atau dapat diterima kebenarannya.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "Sah",
      B: "Kabur",
      C: "Lemah",
      D: "Sementara",
      E: "Ragu",
    }),
  },
  {
    konten: "Antonim kata 'konvergen' yang paling tepat adalah...",
    topik: "Verbal",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Konvergen berarti menuju satu titik; antonimnya adalah divergen, yaitu menyebar atau bercabang.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "Sejajar",
      B: "Selaras",
      C: "Terpusat",
      D: "Divergen",
      E: "Terarah",
    }),
  },
  {
    konten: "BUKU : PENULIS = LUKISAN : ...",
    topik: "Analogi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Buku dibuat oleh penulis, sedangkan lukisan dibuat oleh pelukis.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "Kanvas",
      B: "Galeri",
      C: "Warna",
      D: "Kuas",
      E: "Pelukis",
    }),
  },
  {
    konten:
      "Semua pegawai negeri wajib menaati peraturan. Budi adalah pegawai negeri. Kesimpulan yang tepat adalah...",
    topik: "Silogisme",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Silogisme: semua A adalah B; Budi adalah A; maka Budi termasuk B.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "Budi mungkin menaati peraturan",
      B: "Budi wajib menaati peraturan",
      C: "Budi tidak perlu menaati peraturan",
      D: "Tidak dapat disimpulkan",
      E: "Budi boleh tidak menaati peraturan",
    }),
  },
  {
    konten:
      "Jika rapat selesai maka laporan dikirim. Laporan tidak dikirim. Kesimpulan yang benar adalah...",
    topik: "Penalaran Logis",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Dengan modus tollens: jika P maka Q; tidak Q; maka tidak P. Jadi rapat belum selesai.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "Rapat sudah selesai",
      B: "Laporan tetap dikirim",
      C: "Rapat belum selesai",
      D: "Laporan sedang diperiksa",
      E: "Tidak ada hubungan antara keduanya",
    }),
  },
  {
    konten:
      "Andi lebih tinggi dari Bima. Citra lebih pendek dari Bima. Deni lebih tinggi dari Andi. Urutan dari paling tinggi adalah...",
    topik: "Penalaran Analitis",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Deni lebih tinggi dari Andi, Andi lebih tinggi dari Bima, dan Bima lebih tinggi dari Citra. Urutannya Deni, Andi, Bima, Citra.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "Deni, Andi, Bima, Citra",
      B: "Andi, Deni, Bima, Citra",
      C: "Deni, Bima, Andi, Citra",
      D: "Bima, Andi, Citra, Deni",
      E: "Citra, Bima, Andi, Deni",
    }),
  },
  {
    konten: "KEMUDI : MOBIL = SETANG : ...",
    topik: "Analogi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Kemudi digunakan untuk mengarahkan mobil, setang digunakan untuk mengarahkan sepeda.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "Jalan",
      B: "Roda",
      C: "Helm",
      D: "Sepeda",
      E: "Rem",
    }),
  },
  {
    konten: "AWAN : HUJAN = ASAP : ...",
    topik: "Analogi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Awan dapat menjadi tanda akan hujan, asap dapat menjadi tanda adanya api.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "Api",
      B: "Udara",
      C: "Debu",
      D: "Dingin",
      E: "Angin",
    }),
  },
  {
    konten:
      "Diskon 25% untuk barang Rp 480.000. Harga setelah diskon adalah...",
    topik: "Persentase",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Diskon = 25% x 480.000 = 120.000. Harga akhir = 480.000 - 120.000 = 360.000.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "Rp 320.000",
      B: "Rp 340.000",
      C: "Rp 360.000",
      D: "Rp 380.000",
      E: "Rp 400.000",
    }),
  },
  {
    konten: "Deret: 2, 5, 10, 17, 26, ... Bilangan berikutnya adalah...",
    topik: "Deret Angka",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Selisih deret adalah 3, 5, 7, 9, sehingga selisih berikutnya 11. Maka 26 + 11 = 37.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "35",
      B: "37",
      C: "39",
      D: "41",
      E: "43",
    }),
  },
  {
    konten: "Deret: 7, 11, 18, 29, 47, ... Bilangan berikutnya adalah...",
    topik: "Deret Angka",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Selisihnya 4, 7, 11, 18. Selisih berikutnya adalah 29 karena 11 + 18 = 29, maka 47 + 29 = 76.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "65",
      B: "68",
      C: "71",
      D: "74",
      E: "76",
    }),
  },
  {
    konten:
      "Perbandingan uang Ali dan Beni adalah 3 : 5. Jika total uang mereka Rp 160.000, maka uang Beni adalah...",
    topik: "Perbandingan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Total rasio 3 + 5 = 8. Bagian Beni = 5/8 x 160.000 = 100.000.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "Rp 60.000",
      B: "Rp 80.000",
      C: "Rp 90.000",
      D: "Rp 100.000",
      E: "Rp 120.000",
    }),
  },
  {
    konten:
      "Rata-rata nilai 6 siswa adalah 78. Jika satu siswa baru dengan nilai 90 bergabung, rata-rata baru menjadi...",
    topik: "Rata-rata",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Total nilai awal = 6 x 78 = 468. Total baru = 468 + 90 = 558. Rata-rata baru = 558 / 7 = 79,71.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "78,50",
      B: "79,00",
      C: "79,71",
      D: "80,00",
      E: "81,25",
    }),
  },
  {
    konten:
      "Usia Ani 4 tahun lebih tua dari Budi. Jumlah usia mereka 34 tahun. Usia Ani adalah...",
    topik: "Aljabar Cerita",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Misal usia Budi x, usia Ani x + 4. Maka 2x + 4 = 34, x = 15. Usia Ani = 19.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "17 tahun",
      B: "19 tahun",
      C: "20 tahun",
      D: "21 tahun",
      E: "23 tahun",
    }),
  },
  {
    konten: "Nilai dari 3/4 + 2/5 adalah...",
    topik: "Pecahan",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "KPK 4 dan 5 adalah 20. 3/4 = 15/20 dan 2/5 = 8/20, jadi hasilnya 23/20.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "5/9",
      B: "7/10",
      C: "19/20",
      D: "21/20",
      E: "23/20",
    }),
  },
  {
    konten:
      "Sebuah kendaraan menempuh 180 km dalam 3 jam. Kecepatan rata-ratanya adalah...",
    topik: "Kecepatan",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks: "Kecepatan = jarak / waktu = 180 / 3 = 60 km/jam.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "60 km/jam",
      B: "65 km/jam",
      C: "70 km/jam",
      D: "75 km/jam",
      E: "80 km/jam",
    }),
  },
  {
    konten:
      "Dari 5 bola merah dan 3 bola biru diambil 1 bola secara acak. Peluang terambil bola biru adalah...",
    topik: "Peluang",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks: "Jumlah bola 8, bola biru 3, sehingga peluangnya 3/8.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "1/8",
      B: "1/3",
      C: "2/5",
      D: "3/8",
      E: "5/8",
    }),
  },
  {
    konten: "Jika a = 2b dan b = 3c, maka a sama dengan...",
    topik: "Perbandingan Kuantitatif",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks: "Karena a = 2b dan b = 3c, maka a = 2 x 3c = 6c.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "2c",
      B: "3c",
      C: "4c",
      D: "5c",
      E: "6c",
    }),
  },
  {
    konten: "Deret: 1, 4, 9, 16, 25, ... Bilangan berikutnya adalah...",
    topik: "Deret Angka",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Deret merupakan kuadrat bilangan asli: 1^2, 2^2, 3^2, 4^2, 5^2, sehingga berikutnya 6^2 = 36.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "30",
      B: "32",
      C: "36",
      D: "42",
      E: "49",
    }),
  },
  {
    konten:
      "Jika 12 pekerja menyelesaikan pekerjaan dalam 10 hari, maka 15 pekerja dengan kemampuan sama menyelesaikannya dalam...",
    topik: "Perbandingan Berbalik Nilai",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Jumlah pekerjaan = 12 x 10 = 120 pekerja-hari. Jika pekerjanya 15, waktu = 120 / 15 = 8 hari.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "6 hari",
      B: "8 hari",
      C: "9 hari",
      D: "12 hari",
      E: "15 hari",
    }),
  },
  {
    konten: "Huruf berikutnya dari deret A, C, F, J, O, ... adalah...",
    topik: "Deret Huruf",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Posisi huruf bertambah 2, 3, 4, 5, sehingga berikutnya bertambah 6. O + 6 = U.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "U",
      B: "T",
      C: "V",
      D: "W",
      E: "X",
    }),
  },
  {
    konten:
      "Pasangan berikut: A3, C6, F12, J24, ... Pasangan berikutnya adalah...",
    topik: "Pola Huruf Angka",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Huruf bertambah 2, 3, 4, 5 sehingga J + 5 = O. Angka dikali 2, maka 24 x 2 = 48.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "M36",
      B: "N42",
      C: "O42",
      D: "O48",
      E: "P48",
    }),
  },
  {
    konten: "Manakah yang berbeda dari kelompok berikut?",
    topik: "Figural Verbal",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Persegi, segitiga, lingkaran, dan trapesium adalah bangun datar. Kubus adalah bangun ruang.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "Persegi",
      B: "Segitiga",
      C: "Lingkaran",
      D: "Trapesium",
      E: "Kubus",
    }),
  },
  {
    konten:
      "Pola sisi bangun: segitiga, persegi, pentagon, ... Bangun berikutnya adalah...",
    topik: "Figural Verbal",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Jumlah sisi bertambah 1: 3, 4, 5, sehingga berikutnya 6 sisi yaitu heksagon.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "Lingkaran",
      B: "Heksagon",
      C: "Oktagon",
      D: "Trapesium",
      E: "Jajar genjang",
    }),
  },
  {
    konten:
      "Semua arsip digital tersimpan di server. Sebagian dokumen rahasia adalah arsip digital. Kesimpulan yang tepat adalah...",
    topik: "Silogisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Karena semua arsip digital tersimpan di server dan sebagian dokumen rahasia adalah arsip digital, maka sebagian dokumen rahasia tersimpan di server.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "Semua dokumen rahasia tersimpan di server",
      B: "Tidak ada dokumen rahasia di server",
      C: "Sebagian dokumen rahasia tersimpan di server",
      D: "Semua arsip digital adalah dokumen rahasia",
      E: "Tidak dapat ditarik kesimpulan apa pun",
    }),
  },
  {
    konten:
      "Tiga kotak A, B, dan C berisi dokumen. Kotak A lebih berat dari B, tetapi lebih ringan dari C. Kotak paling berat adalah...",
    topik: "Penalaran Analitis",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "C lebih berat dari A, dan A lebih berat dari B. Jadi kotak paling berat adalah C.",
    subtes: "TIU",
    opsi: makePg("C", {
      A: "A",
      B: "B",
      C: "C",
      D: "A dan B sama berat",
      E: "Tidak dapat ditentukan",
    }),
  },
  {
    konten:
      "Urutan kalimat yang logis adalah: (1) Data diverifikasi. (2) Laporan dikirim. (3) Data dikumpulkan. (4) Laporan disusun.",
    topik: "Penalaran Verbal",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Proses yang logis adalah data dikumpulkan, diverifikasi, laporan disusun, lalu dikirim.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "1-3-4-2",
      B: "3-4-1-2",
      C: "4-3-1-2",
      D: "3-1-4-2",
      E: "2-4-1-3",
    }),
  },
  {
    konten:
      "Jika x lebih besar dari y, dan y lebih besar dari z, maka pernyataan yang pasti benar adalah...",
    topik: "Perbandingan Kuantitatif",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks: "Relasi transitif: jika x > y dan y > z, maka x > z.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "x lebih besar dari z",
      B: "z lebih besar dari x",
      C: "x sama dengan z",
      D: "y lebih kecil dari z",
      E: "Hubungan x dan z tidak dapat ditentukan",
    }),
  },
  {
    konten:
      "Jika setiap huruf digeser 2 huruf ke depan, maka kata RUMAH menjadi...",
    topik: "Pola Huruf",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "R menjadi T, U menjadi W, M menjadi O, A menjadi C, H menjadi J. Jadi RUMAH menjadi TWOCJ.",
    subtes: "TIU",
    opsi: makePg("B", {
      A: "SVNBI",
      B: "TWOCJ",
      C: "TWNCI",
      D: "QTLZG",
      E: "UVPDK",
    }),
  },
  {
    konten:
      "Sebagian analis adalah peneliti. Semua peneliti teliti. Kesimpulan yang tepat adalah...",
    topik: "Silogisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Karena sebagian analis adalah peneliti dan semua peneliti teliti, maka sebagian analis teliti.",
    subtes: "TIU",
    opsi: makePg("E", {
      A: "Semua analis teliti",
      B: "Tidak ada analis yang teliti",
      C: "Semua peneliti adalah analis",
      D: "Sebagian peneliti tidak teliti",
      E: "Sebagian analis teliti",
    }),
  },
  {
    konten:
      "Sebuah bilangan jika dikalikan 4 lalu dikurangi 7 menghasilkan 25. Bilangan tersebut adalah...",
    topik: "Aljabar",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks: "Misal bilangan x. 4x - 7 = 25, maka 4x = 32 dan x = 8.",
    subtes: "TIU",
    opsi: makePg("D", {
      A: "6",
      B: "7",
      C: "7,5",
      D: "8",
      E: "9",
    }),
  },
  {
    konten:
      "Harga sebuah barang naik dari Rp 200.000 menjadi Rp 230.000. Persentase kenaikannya adalah...",
    topik: "Persentase",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kenaikan = 30.000. Persentase kenaikan = 30.000 / 200.000 x 100% = 15%.",
    subtes: "TIU",
    opsi: makePg("A", {
      A: "15%",
      B: "12%",
      C: "10%",
      D: "8%",
      E: "5%",
    }),
  },
  {
    konten:
      "Atasan memberi tugas mendadak di luar jam kerja karena harus dikirim malam ini. Sikap Anda...",
    topik: "Profesionalisme",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Respons terbaik menunjukkan tanggung jawab, komunikasi, dan penyelesaian tugas tanpa mengabaikan kualitas.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 4, E: 5 },
      {
        A: "Menolak karena sudah di luar jam kerja",
        B: "Menerima tetapi mengerjakan seadanya",
        C: "Meminta kompensasi terlebih dahulu sebelum mulai",
        D: "Membantu sebagian lalu menyerahkan sisanya ke rekan",
        E: "Menerima, mengatur waktu, dan menyelesaikan dengan bertanggung jawab",
      }
    ),
  },
  {
    konten:
      "Rekan kerja melakukan kecurangan kecil dalam laporan. Anda sebaiknya...",
    topik: "Integritas",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Integritas menuntut keberanian menegur secara tepat dan mendorong perbaikan sebelum eskalasi sesuai prosedur.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 1, C: 3, D: 5, E: 2 },
      {
        A: "Pura-pura tidak tahu agar hubungan tetap baik",
        B: "Ikut melakukan hal yang sama agar tidak rugi",
        C: "Langsung melaporkan ke atasan tanpa klarifikasi",
        D: "Menegur secara personal dan meminta laporan diperbaiki",
        E: "Membicarakannya dengan rekan lain",
      }
    ),
  },
  {
    konten:
      "Target kerja sangat tinggi dan tampak sulit dicapai. Sikap Anda...",
    topik: "Semangat Berprestasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Sikap berprestasi ditunjukkan dengan menerima tantangan, menyusun rencana, memantau progres, dan mencari solusi.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengeluh dan meminta target diturunkan",
        B: "Menerima tetapi bekerja seperti biasa",
        C: "Meminta bantuan rekan tanpa membuat rencana",
        D: "Menerima tantangan dan membuat rencana kerja terukur",
        E: "Menunggu arahan rinci dari atasan",
      }
    ),
  },
  {
    konten: "Ide Anda ditolak mayoritas peserta rapat. Reaksi Anda...",
    topik: "Pengendalian Diri",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pengendalian diri terlihat dari kemampuan menerima keputusan, tetap objektif, dan mendukung hasil rapat.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 1, D: 5, E: 4 },
      {
        A: "Marah dan meninggalkan rapat",
        B: "Diam dan tidak lagi berkontribusi",
        C: "Memaksakan ide meskipun sudah ditolak",
        D: "Menerima dengan lapang dada dan mendukung keputusan",
        E: "Menyampaikan catatan keberatan secara tertulis setelah rapat",
      }
    ),
  },
  {
    konten: "Warga kesulitan mengurus dokumen di kantor Anda. Anda akan...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Orientasi pelayanan mengutamakan bantuan aktif, informasi jelas, dan memastikan kebutuhan masyarakat tertangani.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 3, C: 5, D: 1, E: 4 },
      {
        A: "Membiarkannya karena bukan tugas langsung Anda",
        B: "Mengarahkannya ke loket lain tanpa memastikan",
        C: "Membantu menjelaskan prosedur dan memastikan prosesnya jelas",
        D: "Menyuruh warga kembali besok",
        E: "Melaporkan antrean tersebut ke atasan",
      }
    ),
  },
  {
    konten:
      "Tim Anda tertinggal dari jadwal karena beberapa anggota kesulitan. Sikap Anda...",
    topik: "Kerja Sama",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kerja sama efektif dilakukan dengan membantu pemetaan masalah, pembagian tugas, dan koordinasi progres.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 4, D: 5, E: 3 },
      {
        A: "Menyalahkan anggota yang lambat",
        B: "Mengerjakan bagian sendiri saja",
        C: "Memberi semangat tanpa mengubah cara kerja",
        D: "Membantu memetakan kendala dan membagi ulang prioritas tim",
        E: "Meminta atasan mengganti anggota tim",
      }
    ),
  },
  {
    konten:
      "Anda menemukan SOP pelayanan sudah tidak sesuai dengan kondisi lapangan. Anda...",
    topik: "Inisiatif",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Inisiatif yang baik dilakukan dengan mengumpulkan bukti, mengusulkan pembaruan, dan tetap mengikuti prosedur yang berlaku sampai ada perubahan resmi.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 2, B: 1, C: 3, D: 5, E: 4 },
      {
        A: "Tetap diam karena bukan kewenangan Anda",
        B: "Langsung mengganti SOP sendiri",
        C: "Mengeluhkan SOP kepada rekan kerja",
        D: "Mencatat masalah dan mengusulkan pembaruan lewat mekanisme resmi",
        E: "Menyampaikan kepada atasan saat diminta saja",
      }
    ),
  },
  {
    konten:
      "Kantor menerapkan aplikasi baru yang belum Anda kuasai. Sikap Anda...",
    topik: "Teknologi Informasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Adaptasi TIK ditunjukkan dengan mau belajar, berlatih, dan memanfaatkan panduan agar pekerjaan tetap efektif.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menolak memakai aplikasi tersebut",
        B: "Memakai cara lama sampai ditegur",
        C: "Meminta rekan selalu mengoperasikannya untuk Anda",
        D: "Mempelajari panduan dan berlatih menggunakan aplikasi",
        E: "Mengikuti pelatihan jika jadwalnya tersedia",
      }
    ),
  },
  {
    konten:
      "Anda bekerja dengan rekan dari budaya berbeda yang memiliki kebiasaan komunikasi berbeda. Anda...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Kompetensi sosial budaya ditunjukkan dengan menghargai perbedaan, berkomunikasi terbuka, dan mencari cara kerja yang disepakati.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 4, D: 5, E: 3 },
      {
        A: "Menghindari kerja sama dengannya",
        B: "Meminta ia mengikuti gaya komunikasi Anda",
        C: "Tetap sopan meskipun tidak membahas perbedaan",
        D: "Membangun komunikasi terbuka dan menghargai kebiasaannya",
        E: "Bertanya kepada rekan lain tentang latar belakangnya",
      }
    ),
  },
  {
    konten:
      "Seorang rekan membagikan konten intoleran di grup kantor. Sikap Anda...",
    topik: "Anti Radikalisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Sikap antiradikalisme menolak intoleransi secara bijak, menjaga suasana kerja, dan menggunakan kanal pelaporan jika diperlukan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Ikut menyebarkan karena sedang ramai",
        B: "Diam saja agar tidak berkonflik",
        C: "Menegurnya dengan kata-kata keras di grup",
        D: "Mengingatkan secara santun dan melaporkan jika berulang atau berbahaya",
        E: "Keluar dari grup tanpa memberi respons",
      }
    ),
  },
  {
    konten:
      "Teman dekat meminta akses data pribadi pemohon layanan untuk kepentingan bisnisnya. Anda...",
    topik: "Integritas Data",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Data pribadi harus dilindungi. Memberikan akses tanpa kewenangan melanggar integritas dan keamanan informasi.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Memberikan karena teman dekat",
        B: "Memberikan sebagian data yang dianggap tidak penting",
        C: "Meminta imbalan agar risikonya sepadan",
        D: "Menolak dan menjelaskan bahwa data bersifat rahasia",
        E: "Menyarankan ia mengajukan permohonan resmi",
      }
    ),
  },
  {
    konten:
      "Anda mendapat beberapa tugas dengan tenggat bersamaan. Langkah terbaik adalah...",
    topik: "Manajemen Kerja",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Prioritas kerja perlu ditentukan berdasarkan urgensi, dampak, tenggat, dan komunikasi dengan pihak terkait.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 2, B: 1, C: 3, D: 5, E: 4 },
      {
        A: "Mengerjakan yang paling mudah dahulu",
        B: "Menunda sampai ada yang menagih",
        C: "Mengerjakan semuanya sekaligus tanpa urutan",
        D: "Menyusun prioritas dan mengomunikasikan progres secara jelas",
        E: "Meminta perpanjangan waktu untuk semua tugas",
      }
    ),
  },
  {
    konten:
      "Dua rekan satu tim berselisih sehingga pekerjaan terganggu. Anda...",
    topik: "Jejaring Kerja",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Sikap terbaik adalah menjadi penengah secara objektif, fokus pada tujuan kerja, dan membantu menemukan kesepakatan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 4, D: 5, E: 3 },
      {
        A: "Memihak rekan yang lebih dekat dengan Anda",
        B: "Membiarkan karena bukan urusan pribadi Anda",
        C: "Meminta keduanya berhenti berdebat",
        D: "Memfasilitasi komunikasi dan mengembalikan fokus pada target tim",
        E: "Melaporkan ke atasan tanpa mencoba memahami masalah",
      }
    ),
  },
  {
    konten:
      "Pemohon layanan memberi hadiah setelah urusannya selesai. Anda sebaiknya...",
    topik: "Antikorupsi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Hadiah terkait layanan publik berpotensi gratifikasi. Sikap tepat adalah menolak dengan sopan dan mengikuti prosedur pelaporan jika perlu.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menerima karena urusannya sudah selesai",
        B: "Menerima asal nilainya kecil",
        C: "Membagi hadiah dengan rekan kerja",
        D: "Menolak dengan sopan dan menjelaskan aturan gratifikasi",
        E: "Melaporkan hadiah setelah diterima",
      }
    ),
  },
  {
    konten:
      "Masyarakat mengeluh di media sosial tentang pelayanan unit Anda. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Keluhan publik perlu ditangani cepat, empatik, berbasis fakta, dan diarahkan ke kanal resmi untuk penyelesaian.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengabaikannya karena hanya komentar online",
        B: "Membalas dengan defensif agar instansi tidak disalahkan",
        C: "Meminta admin menghapus komentar tersebut",
        D: "Mencatat keluhan, merespons sopan, dan menindaklanjuti melalui kanal resmi",
        E: "Meneruskan keluhan ke humas tanpa memantau tindak lanjut",
      }
    ),
  },
  {
    konten:
      "Anda menyadari ada kesalahan angka dalam laporan yang sudah dikirim. Anda...",
    topik: "Integritas",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Kesalahan harus diakui dan diperbaiki segera agar keputusan tidak berbasis data keliru.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Membiarkan karena belum ada yang mengetahui",
        B: "Mengubah file pribadi tanpa memberi tahu",
        C: "Menunggu sampai ada yang bertanya",
        D: "Segera memberi tahu pihak terkait dan mengirim revisi resmi",
        E: "Berkonsultasi dengan rekan sebelum melapor",
      }
    ),
  },
  {
    konten:
      "Seorang senior meminta Anda melewati prosedur agar pekerjaannya cepat selesai. Anda...",
    topik: "Profesionalisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Profesionalisme menuntut kepatuhan pada prosedur, sekaligus menawarkan solusi yang tetap sah dan efisien.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengikuti karena ia lebih senior",
        B: "Menolak dengan kasar agar jera",
        C: "Membiarkan senior mencari cara sendiri",
        D: "Menolak melewati prosedur dan menawarkan jalur percepatan yang sesuai aturan",
        E: "Meminta persetujuan tertulis dari senior",
      }
    ),
  },
  {
    konten:
      "Usulan inovasi Anda belum diterima atasan karena dianggap belum lengkap. Anda...",
    topik: "Inovasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Sikap inovatif ditunjukkan dengan menerima masukan, memperbaiki data pendukung, dan mengajukan kembali secara lebih matang.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Berhenti mengusulkan ide baru",
        B: "Menyalahkan atasan karena tidak terbuka",
        C: "Menceritakan kekecewaan kepada rekan kerja",
        D: "Memperbaiki kajian dan melengkapi data pendukung",
        E: "Menunggu kesempatan lain untuk menyampaikan lagi",
      }
    ),
  },
  {
    konten:
      "Saat rapat daring penting, koneksi Anda bermasalah. Langkah paling tepat adalah...",
    topik: "Teknologi Informasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Dalam kendala TIK, tindakan cepat adalah mencari alternatif koneksi/perangkat dan memberi informasi ke peserta rapat.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Keluar dari rapat tanpa kabar",
        B: "Menunggu sampai koneksi membaik",
        C: "Mengirim pesan setelah rapat selesai",
        D: "Segera memberi kabar dan menggunakan alternatif koneksi atau perangkat",
        E: "Meminta rekan mewakili tanpa menjelaskan kendala",
      }
    ),
  },
  {
    konten:
      "Seorang penyandang disabilitas datang membutuhkan layanan khusus. Anda...",
    topik: "Pelayanan Inklusif",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pelayanan publik harus inklusif, menghormati martabat pengguna layanan, dan memberi bantuan sesuai kebutuhan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Meminta ia datang bersama pendamping",
        B: "Menyuruh menunggu hingga kantor sepi",
        C: "Memberikan layanan sama persis tanpa bertanya kebutuhan",
        D: "Menanyakan kebutuhan aksesibilitas dan membantu dengan hormat",
        E: "Meminta petugas lain menangani karena lebih paham",
      }
    ),
  },
  {
    konten:
      "Di grup kantor beredar rumor yang belum jelas kebenarannya. Anda...",
    topik: "Literasi Digital",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Literasi digital menuntut verifikasi informasi, tidak menyebarkan rumor, dan menjaga komunikasi kerja tetap sehat.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Meneruskan rumor agar semua tahu",
        B: "Menambahkan komentar spekulatif",
        C: "Diam saja meski rumor makin luas",
        D: "Mengajak verifikasi sumber dan tidak ikut menyebarkan",
        E: "Menghapus pesan dari ponsel sendiri",
      }
    ),
  },
  {
    konten:
      "Anda mendapat undangan pelatihan yang relevan, tetapi pekerjaan sedang banyak. Anda...",
    topik: "Pengembangan Diri",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pengembangan diri penting, tetapi tetap perlu pengaturan tugas dan koordinasi agar tanggung jawab berjalan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 2, B: 1, C: 3, D: 5, E: 4 },
      {
        A: "Menolak pelatihan karena pekerjaan banyak",
        B: "Mengikuti pelatihan dan meninggalkan semua pekerjaan",
        C: "Meminta rekan menyelesaikan pekerjaan tanpa koordinasi",
        D: "Mengatur prioritas, berkoordinasi, lalu mengikuti pelatihan",
        E: "Meminta jadwal pelatihan diganti",
      }
    ),
  },
  {
    konten:
      "Beberapa pegawai menolak sistem kerja baru karena merasa nyaman dengan cara lama. Anda...",
    topik: "Adaptasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Adaptasi perubahan dilakukan dengan memahami kekhawatiran, menjelaskan manfaat, dan mendampingi proses transisi.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Membiarkan mereka karena perubahan pasti sulit",
        B: "Mengkritik mereka sebagai penghambat",
        C: "Menggunakan sistem baru untuk pekerjaan sendiri saja",
        D: "Membantu menjelaskan manfaat dan mendampingi penggunaan sistem",
        E: "Melaporkan penolakan tersebut ke atasan",
      }
    ),
  },
  {
    konten:
      "Dalam kerja lintas instansi, pendapat tim lain berbeda dengan tim Anda. Sikap Anda...",
    topik: "Jejaring Kerja",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Jejaring kerja yang baik menekankan komunikasi setara, fokus tujuan bersama, dan pencarian solusi berbasis data.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 4, D: 5, E: 3 },
      {
        A: "Memaksakan pendapat tim sendiri",
        B: "Menghindari diskusi lanjutan",
        C: "Menerima pendapat mereka agar cepat selesai",
        D: "Mendiskusikan dasar data dan mencari kesepakatan terbaik",
        E: "Meminta pimpinan memutuskan tanpa pembahasan",
      }
    ),
  },
  {
    konten:
      "Anggaran kegiatan terbatas, tetapi target layanan tetap harus tercapai. Anda...",
    topik: "Efisiensi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Efisiensi dilakukan dengan memprioritaskan kebutuhan utama, mencari alternatif sah, dan menjaga kualitas layanan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengurangi kualitas layanan agar hemat",
        B: "Membatalkan kegiatan tanpa kajian",
        C: "Meminta tambahan anggaran saja",
        D: "Menyusun prioritas dan mencari cara efisien yang tetap sesuai aturan",
        E: "Mengurangi jumlah peserta layanan",
      }
    ),
  },
  {
    konten: "Pegawai baru sering bertanya tentang pekerjaan dasar. Anda...",
    topik: "Kerja Sama",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Membantu pegawai baru memahami pekerjaan mendukung kinerja tim dan transfer pengetahuan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menghindar agar pekerjaan Anda tidak terganggu",
        B: "Menyuruhnya membaca semua aturan sendiri",
        C: "Menjawab singkat jika sempat",
        D: "Membantu menjelaskan hal penting dan mengarahkannya ke panduan kerja",
        E: "Meminta atasan menunjuk mentor khusus",
      }
    ),
  },
  {
    konten:
      "Antrean layanan sangat panjang dan masyarakat mulai gelisah. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pelayanan yang baik mencakup manajemen antrean, informasi yang transparan, dan koordinasi penambahan bantuan bila perlu.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Tetap bekerja biasa karena antrean wajar",
        B: "Meminta masyarakat menunggu tanpa penjelasan",
        C: "Menutup sementara loket agar lebih tenang",
        D: "Memberi informasi jelas dan mengoordinasikan percepatan layanan",
        E: "Meminta petugas keamanan menenangkan antrean",
      }
    ),
  },
  {
    konten:
      "Anda menemukan informasi lama yang masih tayang di website instansi. Anda...",
    topik: "Teknologi Informasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Informasi publik harus akurat. Temuan perlu dilaporkan kepada pengelola konten dengan usulan pembaruan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengabaikan karena bukan tugas Anda",
        B: "Mengunggah koreksi di akun pribadi",
        C: "Memberitahu rekan secara informal saja",
        D: "Melaporkan ke pengelola website dan menyiapkan informasi pembaruan",
        E: "Menunggu ada keluhan dari masyarakat",
      }
    ),
  },
  {
    konten:
      "Percakapan politik praktis di kantor mulai menimbulkan ketegangan. Anda...",
    topik: "Netralitas ASN",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "ASN harus menjaga netralitas dan suasana kerja kondusif. Diskusi yang memecah fokus perlu diarahkan kembali pada pekerjaan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Ikut berdebat mendukung pilihan Anda",
        B: "Merekam dan menyebarkan percakapan itu",
        C: "Meninggalkan ruangan tanpa komentar",
        D: "Mengingatkan dengan sopan agar menjaga netralitas dan fokus kerja",
        E: "Melaporkan semua peserta diskusi ke atasan",
      }
    ),
  },
  {
    konten:
      "Anda mencurigai ada akses tidak sah ke data kantor. Langkah pertama terbaik adalah...",
    topik: "Keamanan Informasi",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Dugaan insiden keamanan perlu segera diamankan dan dilaporkan sesuai prosedur agar dapat ditangani tim berwenang.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengabaikan sampai ada bukti besar",
        B: "Mencari pelaku sendiri dengan menebak-nebak",
        C: "Membahasnya di grup kantor",
        D: "Mengamankan akun dan melaporkan melalui prosedur keamanan informasi",
        E: "Mengganti kata sandi pribadi saja",
      }
    ),
  },
  {
    konten:
      "Kinerja seorang anggota tim menurun karena masalah keluarga. Anda...",
    topik: "Empati dan Kerja Sama",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Empati profesional dilakukan dengan memahami kondisi, menjaga target tim, dan menyesuaikan dukungan secara proporsional.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menegurnya keras karena menghambat tim",
        B: "Mengabaikan karena urusan pribadi",
        C: "Mengambil semua pekerjaannya tanpa diskusi",
        D: "Mengajak bicara, memahami kendala, dan mengatur dukungan tim secara wajar",
        E: "Meminta ia cuti saja",
      }
    ),
  },
  {
    konten:
      "Anda diminta membantu tugas unit lain sementara pekerjaan utama belum selesai. Anda...",
    topik: "Profesionalisme",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Profesionalisme menuntut koordinasi prioritas agar bantuan lintas unit tidak mengorbankan tanggung jawab utama.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 2, B: 1, C: 3, D: 5, E: 4 },
      {
        A: "Menolak langsung karena bukan tugas unit Anda",
        B: "Meninggalkan pekerjaan utama untuk membantu sepenuhnya",
        C: "Membantu sebisanya tanpa memberi tahu atasan",
        D: "Mengomunikasikan prioritas dan membantu sesuai kapasitas yang disepakati",
        E: "Meminta tugas utama Anda dialihkan dahulu",
      }
    ),
  },
  {
    konten: "Pemohon layanan marah karena prosesnya terlambat. Anda...",
    topik: "Orientasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Pelayanan prima membutuhkan empati, penjelasan faktual, dan solusi tindak lanjut tanpa terpancing emosi.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Membalas dengan nada tegas agar ia tenang",
        B: "Meminta keamanan mengeluarkannya",
        C: "Menyuruhnya mengajukan komplain tertulis",
        D: "Mendengarkan keluhan, meminta maaf atas ketidaknyamanan, dan memberi kepastian tindak lanjut",
        E: "Menjelaskan bahwa keterlambatan bukan kesalahan Anda",
      }
    ),
  },
  {
    konten: "Unit Anda diminta melakukan penghematan kertas. Anda...",
    topik: "Efisiensi dan TIK",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Penghematan dapat dilakukan melalui digitalisasi dokumen, pencetakan selektif, dan edukasi kebiasaan kerja baru.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Tetap mencetak seperti biasa",
        B: "Mencetak hanya dokumen Anda sendiri",
        C: "Menunggu instruksi teknis lengkap",
        D: "Mengusulkan alur dokumen digital dan pencetakan hanya bila perlu",
        E: "Mengurangi jumlah salinan tanpa mengubah alur kerja",
      }
    ),
  },
  {
    konten: "Atasan memberi kritik tajam terhadap hasil kerja Anda. Anda...",
    topik: "Pengembangan Diri",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Sikap matang adalah menerima masukan, mengklarifikasi bagian yang perlu diperbaiki, dan meningkatkan kualitas kerja.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Tersinggung dan membela diri",
        B: "Menghindari atasan setelah itu",
        C: "Menerima tanpa bertanya meski belum paham",
        D: "Menerima kritik, meminta arahan perbaikan, dan memperbaiki hasil kerja",
        E: "Meminta rekan menilai apakah kritik itu benar",
      }
    ),
  },
  {
    konten:
      "Anda melihat indikasi penyalahgunaan anggaran dalam kegiatan kantor. Anda...",
    topik: "Integritas",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Indikasi penyalahgunaan perlu dicatat, diverifikasi secukupnya, dan dilaporkan melalui kanal yang sesuai tanpa menyebarkan tuduhan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mendiamkan karena takut berdampak pada posisi Anda",
        B: "Menyebarkan dugaan tersebut ke banyak rekan",
        C: "Menegur semua pihak di depan umum",
        D: "Mengumpulkan informasi relevan dan melapor melalui mekanisme resmi",
        E: "Berkonsultasi dengan rekan terpercaya sebelum melapor",
      }
    ),
  },
  {
    konten: "Ada regulasi baru yang memengaruhi pekerjaan Anda. Sikap Anda...",
    topik: "Profesionalisme",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "ASN perlu aktif memperbarui pengetahuan regulasi dan menerapkannya dalam pekerjaan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menunggu sampai ada teguran",
        B: "Menggunakan aturan lama karena lebih familiar",
        C: "Bertanya hanya saat menemui masalah",
        D: "Mempelajari regulasi baru dan menyesuaikan alur kerja",
        E: "Meminta ringkasan dari rekan yang sudah membaca",
      }
    ),
  },
  {
    konten:
      "Anda ditugaskan dalam program bersama masyarakat lokal. Langkah terbaik adalah...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Program masyarakat perlu dibangun dengan memahami kebutuhan lokal, menghormati budaya setempat, dan melibatkan pemangku kepentingan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menerapkan program tanpa konsultasi agar cepat",
        B: "Menggunakan pendekatan yang sama untuk semua daerah",
        C: "Meminta tokoh lokal menyetujui rencana yang sudah jadi",
        D: "Berdialog dengan masyarakat untuk memahami kebutuhan dan budaya setempat",
        E: "Mengumpulkan data sekunder sebelum turun ke lapangan",
      }
    ),
  },
  {
    konten:
      "Anda sering terganggu notifikasi saat mengerjakan tugas penting. Anda...",
    topik: "Manajemen Diri",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Manajemen diri dilakukan dengan mengatur fokus kerja, mengelola notifikasi, dan tetap responsif pada hal penting.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 2, B: 1, C: 3, D: 5, E: 4 },
      {
        A: "Membalas semua notifikasi begitu masuk",
        B: "Mematikan semua komunikasi sepanjang hari",
        C: "Mengerjakan tugas sambil terus memantau pesan",
        D: "Mengatur waktu fokus dan mengecek pesan pada jeda tertentu",
        E: "Meminta rekan menyaring semua pesan untuk Anda",
      }
    ),
  },
  {
    konten:
      "Atasan meminta Anda mengubah data agar hasil laporan terlihat lebih baik. Anda...",
    topik: "Integritas",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Mengubah data tidak benar melanggar integritas. Sikap tepat adalah menolak secara profesional dan menawarkan perbaikan berbasis fakta.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengubah data karena perintah atasan",
        B: "Mengubah sebagian agar tidak terlalu terlihat",
        C: "Menolak tetapi tidak memberi solusi",
        D: "Menolak dengan sopan dan menawarkan analisis perbaikan berbasis data asli",
        E: "Meminta perintah tertulis sebelum melakukan perubahan",
      }
    ),
  },
  {
    konten:
      "Anda ditempatkan di daerah dengan adat kerja yang berbeda dari kebiasaan Anda. Anda...",
    topik: "Sosial Budaya",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Adaptasi sosial budaya membutuhkan sikap terbuka, belajar dari warga/rekan lokal, dan tetap menjaga standar kerja.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Membandingkan adat setempat dengan daerah asal",
        B: "Tetap memakai kebiasaan sendiri tanpa menyesuaikan",
        C: "Berinteraksi seperlunya agar tidak salah bersikap",
        D: "Mempelajari adat setempat dan menyesuaikan komunikasi kerja",
        E: "Meminta arahan rekan lokal saat ada kegiatan tertentu",
      }
    ),
  },
  {
    konten:
      "Rekan meminta kata sandi akun kerja Anda agar bisa membantu saat Anda cuti. Anda...",
    topik: "Keamanan Informasi",
    tingkatKesulitan: "MUDAH",
    pembahasanTeks:
      "Kata sandi bersifat pribadi. Delegasi pekerjaan harus memakai mekanisme akses resmi, bukan berbagi akun.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Memberikan kata sandi karena percaya",
        B: "Memberikan lalu mengganti setelah cuti",
        C: "Mencatat kata sandi di meja agar mudah diakses",
        D: "Menolak berbagi kata sandi dan meminta mekanisme delegasi akses resmi",
        E: "Meminta rekan menggunakan komputer Anda saja",
      }
    ),
  },
  {
    konten:
      "Anda memiliki ide layanan digital sederhana untuk mempercepat antrean. Anda...",
    topik: "Inovasi Pelayanan",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "Inovasi pelayanan perlu diuji secara terukur, melibatkan pihak terkait, dan memastikan keamanan serta keberlanjutan.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menerapkannya sendiri tanpa koordinasi",
        B: "Menyimpan ide karena khawatir ditolak",
        C: "Menceritakan ide ke rekan tanpa tindak lanjut",
        D: "Menyusun konsep, manfaat, risiko, dan mengusulkannya untuk uji coba",
        E: "Menunggu lomba inovasi sebelum mengajukan",
      }
    ),
  },
  {
    konten:
      "Anda ingin mengkritik kebijakan instansi di media sosial pribadi. Sikap paling tepat adalah...",
    topik: "Etika ASN Digital",
    tingkatKesulitan: "SEDANG",
    pembahasanTeks:
      "ASN perlu menjaga etika digital, menggunakan kanal internal/resmi, dan menyampaikan kritik secara konstruktif tanpa membuka informasi yang tidak layak.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Mengunggah kritik keras agar cepat viral",
        B: "Membocorkan dokumen agar publik paham",
        C: "Menyindir tanpa menyebut nama instansi",
        D: "Menyampaikan masukan melalui kanal resmi secara konstruktif",
        E: "Berdiskusi dulu dengan rekan dekat",
      }
    ),
  },
  {
    konten:
      "Terjadi bencana di wilayah kerja dan layanan publik terganggu. Anda...",
    topik: "Pelayanan Publik",
    tingkatKesulitan: "SULIT",
    pembahasanTeks:
      "Dalam kondisi darurat, ASN perlu menjaga keselamatan, berkoordinasi, dan memprioritaskan layanan esensial sesuai prosedur.",
    subtes: "TKP",
    opsi: makeTkp(
      { A: 1, B: 2, C: 3, D: 5, E: 4 },
      {
        A: "Menunggu instruksi tanpa melakukan apa pun",
        B: "Tetap membuka semua layanan seperti biasa",
        C: "Menghentikan seluruh layanan sampai kondisi normal",
        D: "Berkoordinasi, memprioritaskan keselamatan, dan menjalankan layanan esensial",
        E: "Menginformasikan gangguan layanan kepada masyarakat",
      }
    ),
  },
];

function assertSeedData(): void {
  const counts: Record<Subtes, number> = { TWK: 0, TIU: 0, TKP: 0 };

  for (const [index, soal] of soalCpnsSkdBerbayar.entries()) {
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

    if (soal.subtes === "TKP") {
      const allHaveScores = soal.opsi.every(
        (opsi) => opsi.nilaiTkp !== undefined
      );
      if (!allHaveScores) {
        throw new Error(
          `Soal TKP ke-${index + 1} belum memiliki nilaiTkp lengkap.`
        );
      }
    }
  }

  if (counts.TWK !== 30 || counts.TIU !== 35 || counts.TKP !== 45) {
    throw new Error(
      `Jumlah soal tidak sesuai. TWK=${counts.TWK}, TIU=${counts.TIU}, TKP=${counts.TKP}.`
    );
  }
}

export async function seedCpnsBerbayar(cid: string) {
  console.log("Seeding paket CPNS SKD berbayar...");

  if (!cid) {
    throw new Error(
      "cid (Instruktur ID) is required for seeding paket berbayar."
    );
  }

  assertSeedData();

  const slug = "tryout-skd-cpns-premium-paket-b";
  const existing = await prisma.paketTryout.findUnique({ where: { slug } });

  if (existing) {
    console.log("Paket sudah ada, skip.");
    return;
  }

  const soalIds: string[] = [];

  async function buatSoal(soal: SoalSeed) {
    const created = await prisma.soal.create({
      data: {
        konten: soal.konten,
        topik: soal.topik,
        tingkatKesulitan: soal.tingkatKesulitan as never,
        pembahasanTeks: soal.pembahasanTeks,
        kategori: "CPNS_SKD",
        subtes: soal.subtes as never,
        tipe: "PILIHAN_GANDA",
        createdById: cid,
        opsi: { create: soal.opsi },
      },
    });

    soalIds.push(created.id);
  }

  for (const soal of soalCpnsSkdBerbayar) {
    await buatSoal(soal);
  }

  console.log("30 soal TWK dibuat");
  console.log("35 soal TIU dibuat");
  console.log("45 soal TKP dibuat");

  const paket = await prisma.paketTryout.create({
    data: {
      slug,
      judul: "Tryout SKD CPNS Premium - Paket B",
      deskripsi:
        "Paket tryout SKD CPNS premium berisi 110 soal latihan orisinal yang mengikuti pola seleksi terakhir, lengkap dengan pembahasan dan analisis skor per subtes.",
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
      createdById: cid,
      soal: {
        create: soalIds.map((soalId, i) => ({ soalId, urutan: i + 1 })),
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
    throw new Error("Instruktur not found");
  }

  await seedCpnsBerbayar(instruktur.id);
}

run()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

