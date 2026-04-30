out = []
A = out.append

A('import { PrismaClient } from "@prisma/client";')
A('const prisma = new PrismaClient();')
A('')
A('async function main() {')
A('  console.log("Seeding paket CPNS SKD berbayar...");')
A('  const instruktur = await prisma.user.findFirst({ where: { role: "INSTRUKTUR" }, select: { id: true } });')
A('  if (!instruktur) throw new Error("Jalankan seed utama dulu.");')
A('  const cid = instruktur.id;')
A('  const soalIds: string[] = [];')
A('')
A('  async function buatSoal(konten: string, topik: string, tk: string, pem: string, subtes: string, opsi: {label:string;konten:string;isBenar:boolean;nilaiTkp?:number}[]) {')
A('    const s = await prisma.soal.create({')
A('      data: { konten, topik, tingkatKesulitan: tk as never, pembahasanTeks: pem, kategori: "CPNS_SKD", subtes: subtes as never, tipe: "PILIHAN_GANDA", createdById: cid, opsi: { create: opsi } },')
A('    });')
A('    soalIds.push(s.id);')
A('  }')
A('')

# TWK soal
twk = [
  ('Pancasila ditetapkan sebagai dasar negara pada tanggal...', 'Pancasila', 'MUDAH',
   'Pancasila ditetapkan pada 18 Agustus 1945 oleh PPKI.',
   [('A','17 Agustus 1945',False),('B','18 Agustus 1945',True),('C','1 Juni 1945',False),('D','22 Juni 1945',False),('E','29 Mei 1945',False)]),
  ('Lembaga yang berwenang mengubah UUD 1945 adalah...', 'UUD 1945', 'MUDAH',
   'Berdasarkan Pasal 37 UUD 1945, MPR berwenang mengubah UUD.',
   [('A','DPR',False),('B','DPD',False),('C','MPR',True),('D','Presiden',False),('E','Mahkamah Konstitusi',False)]),
  ('Nilai utama sila ke-2 Pancasila adalah...', 'Pancasila', 'SEDANG',
   'Sila ke-2 mengandung nilai pengakuan harkat dan martabat manusia.',
   [('A','Ketuhanan',False),('B','Pengakuan harkat dan martabat manusia',True),('C','Persatuan bangsa',False),('D','Musyawarah',False),('E','Keadilan distributif',False)]),
  ('Hak yang diatur Pasal 28C UUD 1945 adalah...', 'UUD 1945', 'SEDANG',
   'Pasal 28C mengatur hak mengembangkan diri melalui pendidikan.',
   [('A','Hak atas pekerjaan',False),('B','Hak mengembangkan diri melalui pendidikan',True),('C','Hak kewarganegaraan',False),('D','Hak beragama',False),('E','Hak atas kesehatan',False)]),
  ('Bhinneka Tunggal Ika berasal dari kitab...', 'Wawasan Kebangsaan', 'SEDANG',
   'Bhinneka Tunggal Ika berasal dari Kitab Sutasoma karangan Mpu Tantular.',
   [('A','Negarakertagama',False),('B','Pararaton',False),('C','Sutasoma',True),('D','Arjunawiwaha',False),('E','Ramayana',False)]),
]

for konten, topik, tk, pem, opsi_list in twk:
    opsi_str = '[' + ','.join('{label:"%s",konten:"%s",isBenar:%s}' % (l,k,'true' if b else 'false') for l,k,b in opsi_list) + ']'
    A('  await buatSoal("%s","%s","%s","%s","TWK",%s);' % (konten, topik, tk, pem, opsi_str))

A('  console.log("5 soal TWK dibuat");')
A('')

# TIU soal
tiu = [
  ('Jika 5x - 3 = 17, maka nilai x adalah...', 'Matematika Dasar', 'MUDAH',
   '5x - 3 = 17 maka 5x = 20 maka x = 4.',
   [('A','2',False),('B','3',False),('C','4',True),('D','5',False),('E','6',False)]),
  ('Deret: 3, 6, 12, 24, 48, ... Bilangan berikutnya...', 'Deret Angka', 'MUDAH',
   'Pola geometri rasio 2. Setelah 48: 48 x 2 = 96.',
   [('A','72',False),('B','84',False),('C','96',True),('D','108',False),('E','120',False)]),
  ('DOKTER : PASIEN = GURU : ...', 'Analogi', 'MUDAH',
   'Dokter melayani pasien, guru melayani murid.',
   [('A','Sekolah',False),('B','Murid',True),('C','Pelajaran',False),('D','Kelas',False),('E','Buku',False)]),
  ('Diskon 25% untuk barang Rp 480.000. Harga setelah diskon...', 'Persentase', 'SEDANG',
   'Diskon = 25% x 480.000 = 120.000. Harga = 480.000 - 120.000 = 360.000.',
   [('A','Rp 320.000',False),('B','Rp 340.000',False),('C','Rp 360.000',True),('D','Rp 380.000',False),('E','Rp 400.000',False)]),
  ('Semua pegawai negeri wajib menaati peraturan. Budi adalah pegawai negeri. Kesimpulan...', 'Penalaran Logis', 'MUDAH',
   'Silogisme: semua A adalah B, Budi adalah A, maka Budi wajib menaati peraturan.',
   [('A','Budi mungkin menaati peraturan',False),('B','Budi wajib menaati peraturan',True),('C','Budi tidak perlu menaati peraturan',False),('D','Tidak dapat disimpulkan',False),('E','Budi boleh tidak menaati peraturan',False)]),
]

for konten, topik, tk, pem, opsi_list in tiu:
    opsi_str = '[' + ','.join('{label:"%s",konten:"%s",isBenar:%s}' % (l,k,'true' if b else 'false') for l,k,b in opsi_list) + ']'
    A('  await buatSoal("%s","%s","%s","%s","TIU",%s);' % (konten, topik, tk, pem, opsi_str))

A('  console.log("5 soal TIU dibuat");')
A('')

# TKP soal
tkp = [
  ('Atasan memberi tugas mendadak di luar jam kerja. Sikap Anda...', 'Profesionalisme', 'MUDAH',
   'Profesionalisme: menerima dan menyelesaikan dengan tanggung jawab.',
   [('A','Menolak karena di luar jam kerja',False,1),('B','Menerima tapi seadanya',False,2),('C','Minta kompensasi dulu',False,3),('D','Delegasikan ke rekan',False,4),('E','Menerima dan menyelesaikan dengan tanggung jawab',True,5)]),
  ('Rekan kerja melakukan kecurangan kecil dalam laporan. Anda...', 'Integritas', 'SEDANG',
   'Integritas: tegur personal dulu sebelum melaporkan.',
   [('A','Pura-pura tidak tahu',False,1),('B','Ikut melakukan hal sama',False,1),('C','Langsung lapor atasan',False,3),('D','Tegur personal dan minta perbaiki',True,5),('E','Bicarakan dengan rekan lain',False,2)]),
  ('Target kerja sangat tinggi dan sulit dicapai. Sikap Anda...', 'Semangat Berprestasi', 'MUDAH',
   'Semangat berprestasi: terima tantangan dan buat rencana terstruktur.',
   [('A','Mengeluh dan minta target turun',False,1),('B','Terima tapi tidak berusaha keras',False,2),('C','Minta bantuan rekan',False,3),('D','Terima dan buat rencana kerja terstruktur',True,5),('E','Tunggu arahan atasan',False,4)]),
  ('Ide Anda ditolak mayoritas peserta rapat. Reaksi Anda...', 'Pengendalian Diri', 'SEDANG',
   'Pengendalian diri: terima dengan lapang dada dan dukung keputusan.',
   [('A','Marah dan tinggalkan rapat',False,1),('B','Diam dan tidak berkontribusi',False,2),('C','Paksa ide meski ditolak',False,1),('D','Terima lapang dada dan dukung keputusan',True,5),('E','Sampaikan keberatan tertulis setelah rapat',False,4)]),
  ('Warga kesulitan mengurus dokumen di kantor Anda. Anda...', 'Orientasi Pelayanan', 'MUDAH',
   'Orientasi pelayanan: bantu secara proaktif dan pastikan selesai.',
   [('A','Biarkan bukan tugas Anda',False,1),('B','Arahkan ke petugas lain tanpa memastikan',False,3),('C','Bantu jelaskan prosedur dan pastikan selesai',True,5),('D','Suruh kembali besok',False,1),('E','Laporkan ke atasan',False,4)]),
]

for konten, topik, tk, pem, opsi_list in tkp:
    opsi_str = '[' + ','.join('{label:"%s",konten:"%s",isBenar:%s,nilaiTkp:%d}' % (l,k,'true' if b else 'false',n) for l,k,b,n in opsi_list) + ']'
    A('  await buatSoal("%s","%s","%s","%s","TKP",%s);' % (konten, topik, tk, pem, opsi_str))

A('  console.log("5 soal TKP dibuat");')
A('')
A('  // Buat paket berbayar')
A('  const slug = "tryout-skd-cpns-premium-paket-a";')
A('  const existing = await prisma.paketTryout.findUnique({ where: { slug } });')
A('  if (existing) { console.log("Paket sudah ada, skip."); return; }')
A('')
A('  const paket = await prisma.paketTryout.create({')
A('    data: {')
A('      slug,')
A('      judul: "Tryout SKD CPNS Premium — Paket A",')
A('      deskripsi: "Paket tryout SKD CPNS premium dengan soal pilihan berkualitas tinggi. Dilengkapi pembahasan lengkap dan analisis skor per subtes.",')
A('      kategori: "CPNS_SKD",')
A('      durasi: 100,')
A('      totalSoal: soalIds.length,')
A('      harga: 75000,')
A('      modelAkses: "BERBAYAR",')
A('      status: "PUBLISHED",')
A('      passingGrade: { twk: 65, tiu: 80, tkp: 166, total: 311 },')
A('      konfigurasi: { twk: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 }, tiu: { jumlahSoal: 5, nilaiBenar: 5, nilaiSalah: 0 }, tkp: { jumlahSoal: 5, skala: [1,2,3,4,5] } },')
A('      createdById: cid,')
A('      soal: { create: soalIds.map((soalId, i) => ({ soalId, urutan: i + 1 })) },')
A('    },')
A('  });')
A('')
A('  console.log("Paket dibuat:", paket.judul);')
A('  console.log("Harga: Rp", paket.harga.toString());')
A('  console.log("Total soal:", paket.totalSoal);')
A('  console.log("Selesai!");')
A('}')
A('')
A('main()')
A('  .catch((e) => { console.error("Error:", e); process.exit(1); })')
A('  .finally(() => prisma.$disconnect());')

with open('prisma/seed-cpns-berbayar.ts', 'w') as f:
    f.write('\n'.join(out))

import os
print('Done. Size:', os.path.getsize('prisma/seed-cpns-berbayar.ts'))
