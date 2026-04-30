import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export const metadata = { title: "Pembahasan Tryout" };

export default async function PembahasanPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  // Validasi: sesi harus COMPLETED (Property 16.6)
  const tryoutSession = await prisma.tryoutSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: { paket: { select: { slug: true, judul: true } } },
  });

  if (!tryoutSession || tryoutSession.status !== "COMPLETED") {
    notFound();
  }

  // Ambil jawaban peserta dengan detail soal
  const jawaban = await prisma.jawabanPeserta.findMany({
    where: { sessionId },
    include: {
      soal: {
        include: {
          opsi: { orderBy: { label: "asc" } },
        },
      },
    },
    orderBy: { answeredAt: "asc" },
  });

  // Urutkan sesuai urutan soal dalam sesi
  const urutanSoal = tryoutSession.urutanSoal as string[];
  const jawabanMap = new Map(jawaban.map((j) => [j.soalId, j]));
  const jawabanTerurut = urutanSoal
    .map((soalId) => jawabanMap.get(soalId))
    .filter(Boolean) as typeof jawaban;

  const totalBenar = jawaban.filter((j) => j.isBenar).length;
  const totalSoal = jawaban.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pembahasan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{tryoutSession.paket.judul}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalBenar}/{totalSoal}
          </div>
          <div className="text-xs text-gray-400">Jawaban Benar</div>
        </div>
      </div>

      <Link href={`/tryout/sesi/${sessionId}/hasil`}
        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Kembali ke Hasil
      </Link>

      {/* Daftar soal dengan pembahasan */}
      <div className="space-y-6">
        {jawabanTerurut.map((j, index) => {
          const soal = j.soal;
          const opsiDipilih = soal.opsi.find((o) => o.id === j.opsiId);
          const opsiBenar = soal.opsi.find((o) => o.isBenar);
          const isBenar = j.isBenar;
          const tidakDijawab = !j.opsiId;

          return (
            <div key={j.id}
              className={`bg-white dark:bg-gray-900 border-2 rounded-xl overflow-hidden ${
                tidakDijawab ? "border-gray-200 dark:border-gray-700"
                : isBenar ? "border-green-300 dark:border-green-700"
                : "border-red-300 dark:border-red-700"
              }`}
            >
              {/* Status header */}
              <div className={`px-5 py-3 flex items-center justify-between ${
                tidakDijawab ? "bg-gray-50 dark:bg-gray-800"
                : isBenar ? "bg-green-50 dark:bg-green-950"
                : "bg-red-50 dark:bg-red-950"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    tidakDijawab ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    : isBenar ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  }`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm font-semibold ${
                    tidakDijawab ? "text-gray-500 dark:text-gray-400"
                    : isBenar ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                  }`}>
                    {tidakDijawab ? "Tidak Dijawab" : isBenar ? "✓ Benar" : "✗ Salah"}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{soal.subtes}</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Konten soal */}
                <div className="text-gray-900 dark:text-white">
                  <MarkdownRenderer content={soal.konten} />
                </div>

                {/* Opsi jawaban */}
                <div className="space-y-2">
                  {soal.opsi.map((opsi) => {
                    const isPilihan = opsi.id === j.opsiId;
                    const isCorrect = opsi.isBenar;
                    return (
                      <div key={opsi.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isCorrect ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950"
                          : isPilihan && !isCorrect ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950"
                          : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCorrect ? "bg-green-500 text-white"
                          : isPilihan ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}>
                          {opsi.label}
                        </span>
                        <div className="flex-1 text-sm">
                          <MarkdownRenderer content={opsi.konten} />
                        </div>
                        <div className="flex-shrink-0 text-xs font-medium">
                          {isCorrect && <span className="text-green-600 dark:text-green-400">✓ Benar</span>}
                          {isPilihan && !isCorrect && <span className="text-red-500 dark:text-red-400">Pilihanmu</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pembahasan */}
                {soal.pembahasanTeks && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Pembahasan</p>
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <MarkdownRenderer content={soal.pembahasanTeks} />
                    </div>
                  </div>
                )}

                {/* Info jawaban */}
                <div className="text-xs text-gray-400 flex items-center gap-3">
                  {opsiDipilih && (
                    <span>Jawabanmu: <strong className="text-gray-600 dark:text-gray-300">{opsiDipilih.label}</strong></span>
                  )}
                  {opsiBenar && (
                    <span>Jawaban benar: <strong className="text-green-600 dark:text-green-400">{opsiBenar.label}</strong></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pb-8">
        <Link href={`/tryout/sesi/${sessionId}/hasil`}
          className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center">
          Kembali ke Hasil
        </Link>
      </div>
    </div>
  );
}
