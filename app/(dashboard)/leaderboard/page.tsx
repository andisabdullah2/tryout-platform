import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getStatistikPeserta } from "@/lib/tryout/leaderboard";

export const metadata = { title: "Leaderboard" };

interface SearchParams {
  paketId?: string;
  periode?: string;
}

const PERIODE_LABEL: Record<string, string> = {
  ALL_TIME: "Semua Waktu",
  MINGGUAN: "Minggu Ini",
  BULANAN: "Bulan Ini",
};

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function formatDurasi(detik: number): string {
  const menit = Math.floor(detik / 60);
  const sisa = detik % 60;
  return `${menit}m ${sisa}s`;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const periode = (params.periode ?? "ALL_TIME") as "ALL_TIME" | "MINGGUAN" | "BULANAN";

  // Ambil paket tryout yang tersedia
  const paketList = await prisma.paketTryout.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, judul: true, kategori: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const selectedPaketId = params.paketId ?? paketList[0]?.id;

  // Ambil leaderboard dengan durasi pengerjaan
  type LeaderboardRow = {
    peringkat: number;
    skor: number;
    nama: string;
    image: string | null;
    isCurrentUser: boolean;
    durasiPengerjaan: number | null;
    completedAt: Date | null;
  };

  let entries: LeaderboardRow[] = [];
  let userEntry: { peringkat: number; skor: number; nama: string } | null = null;

  if (selectedPaketId) {
    const leaderboardData = await prisma.leaderboardEntry.findMany({
      where: { paketId: selectedPaketId, periode },
      include: {
        user: {
          select: { id: true, name: true, image: true, useAlias: true, alias: true },
        },
      },
      orderBy: { peringkat: "asc" },
      take: 10,
    });

    // Ambil durasi pengerjaan dari HasilTryout via sessionId
    const sessionIds = leaderboardData
      .map((e) => e.sessionId)
      .filter((id): id is string => id !== null);

    const hasilMap = new Map<string, { durasiPengerjaan: number; createdAt: Date }>();
    if (sessionIds.length > 0) {
      const hasilList = await prisma.hasilTryout.findMany({
        where: { sessionId: { in: sessionIds } },
        select: { sessionId: true, durasiPengerjaan: true, createdAt: true },
      });
      for (const h of hasilList) {
        hasilMap.set(h.sessionId, { durasiPengerjaan: h.durasiPengerjaan, createdAt: h.createdAt });
      }
    }

    entries = leaderboardData.map((e) => {
      const hasil = e.sessionId ? hasilMap.get(e.sessionId) : undefined;
      return {
        peringkat: e.peringkat,
        skor: Number(e.skor),
        // 12.5: Sembunyikan nama asli jika useAlias aktif
        nama: e.user.useAlias && e.user.alias ? e.user.alias : e.user.name,
        image: e.user.useAlias ? null : e.user.image,
        isCurrentUser: e.userId === session?.user?.id,
        durasiPengerjaan: hasil?.durasiPengerjaan ?? null,
        completedAt: hasil?.createdAt ?? null,
      };
    });

    // 12.4: Posisi user jika tidak ada di top 10
    if (session?.user?.id && !entries.some((e) => e.isCurrentUser)) {
      const myEntry = await prisma.leaderboardEntry.findUnique({
        where: {
          userId_paketId_periode: {
            userId: session.user.id,
            paketId: selectedPaketId,
            periode,
          },
        },
        include: {
          user: { select: { name: true, useAlias: true, alias: true } },
        },
      });
      if (myEntry) {
        userEntry = {
          peringkat: myEntry.peringkat,
          skor: Number(myEntry.skor),
          nama:
            myEntry.user.useAlias && myEntry.user.alias
              ? myEntry.user.alias
              : myEntry.user.name,
        };
      }
    }
  }

  // 12.7: Statistik personal peserta
  const statistik = session?.user?.id
    ? await getStatistikPeserta(session.user.id)
    : null;

  // Badge peserta
  const userBadges = session?.user?.id
    ? await prisma.userBadge.findMany({
        where: { userId: session.user.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Peringkat peserta tryout</p>
      </div>

      {/* 12.7: Statistik personal */}
      {statistik && statistik.totalTryout > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5">
          <h2 className="text-sm font-medium text-blue-100 mb-3">Statistik Kamu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Tryout", value: statistik.totalTryout },
              { label: "Skor Tertinggi", value: statistik.skorTertinggi.toFixed(0) },
              { label: "Rata-rata Skor", value: statistik.skorRataRata.toFixed(0) },
              { label: "Lulus", value: `${statistik.totalLulus}×` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tren skor mini */}
          {statistik.trendSkor.length >= 2 && (
            <div className="mt-4">
              <p className="text-xs text-blue-200 mb-2">Tren Skor (10 Tryout Terakhir)</p>
              <div className="flex items-end gap-1 h-10">
                {statistik.trendSkor.map((t, i) => {
                  const maxSkor = Math.max(...statistik.trendSkor.map((x) => x.skor));
                  const heightPct = maxSkor > 0 ? (t.skor / maxSkor) * 100 : 0;
                  return (
                    <div
                      key={i}
                      title={`${t.tanggal}: ${t.skor}`}
                      className={`flex-1 rounded-sm transition-all ${
                        t.lulus ? "bg-green-300" : "bg-blue-300"
                      }`}
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                Hijau = lulus passing grade
              </p>
            </div>
          )}
        </div>
      )}

      {/* Badge peserta */}
      {userBadges.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Badge Kamu</h2>
          <div className="flex flex-wrap gap-3">
            {userBadges.map((ub) => (
              <div
                key={ub.id}
                title={ub.badge.deskripsi}
                className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2"
              >
                <span className="text-xl">{getBadgeIcon(ub.badge.tipe)}</span>
                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  {ub.badge.nama}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter paket & periode */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <select
            name="paketId"
            defaultValue={selectedPaketId}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {paketList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.judul}
              </option>
            ))}
          </select>
          <select
            name="periode"
            defaultValue={periode}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PERIODE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Tampilkan
          </button>
        </form>
      </div>

      {/* Tabel leaderboard */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Top 10 — {PERIODE_LABEL[periode]}
          </h2>
          <span className="text-xs text-gray-400">
            {entries.length} peserta
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🏆</div>
            <p>Belum ada data leaderboard</p>
            <p className="text-sm mt-1">Jadilah yang pertama mengikuti tryout ini!</p>
            {selectedPaketId && (
              <Link
                href="/tryout"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
              >
                Mulai Tryout →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Header tabel */}
            <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_7rem] gap-2 px-5 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
              <span>#</span>
              <span>Peserta</span>
              <span className="text-right">Skor</span>
              <span className="text-right">Durasi</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((entry) => (
                <div
                  key={entry.peringkat}
                  className={`px-5 py-4 flex items-center gap-4 ${
                    entry.isCurrentUser
                      ? "bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  {/* Peringkat */}
                  <div className="w-10 text-center flex-shrink-0">
                    {MEDAL[entry.peringkat] ? (
                      <span className="text-2xl">{MEDAL[entry.peringkat]}</span>
                    ) : (
                      <span className="text-base font-bold text-gray-400">
                        #{entry.peringkat}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                    {entry.nama.charAt(0).toUpperCase()}
                  </div>

                  {/* Nama */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        entry.isCurrentUser
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {entry.nama}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          Kamu
                        </span>
                      )}
                    </p>
                    {entry.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.completedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Skor */}
                  <div className="text-right flex-shrink-0 min-w-[4rem]">
                    <span
                      className={`text-lg font-bold ${
                        entry.isCurrentUser
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {entry.skor.toFixed(0)}
                    </span>
                  </div>

                  {/* Durasi */}
                  <div className="text-right flex-shrink-0 min-w-[5rem] hidden sm:block">
                    {entry.durasiPengerjaan !== null ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDurasi(entry.durasiPengerjaan)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 12.4: Posisi user jika di luar top 10 */}
        {userEntry && (
          <div className="px-5 py-4 border-t-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 flex items-center gap-4">
            <div className="w-10 text-center flex-shrink-0">
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                #{userEntry.peringkat}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm flex-shrink-0">
              {userEntry.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-700 dark:text-blue-300 truncate">
                {userEntry.nama}
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Kamu
                </span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                Di luar top 10
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {userEntry.skor.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info privasi alias */}
      {session?.user && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Nama kamu ditampilkan sesuai pengaturan privasi.{" "}
          <Link
            href="/profil"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ubah di Profil →
          </Link>
        </p>
      )}
    </div>
  );
}

function getBadgeIcon(tipe: string): string {
  const icons: Record<string, string> = {
    PERINGKAT_1: "🥇",
    PERINGKAT_2: "🥈",
    PERINGKAT_3: "🥉",
    TRYOUT_PERTAMA: "🎯",
    LULUS_PASSING_GRADE: "✅",
    STREAK_7_HARI: "🔥",
  };
  return icons[tipe] ?? "🏅";
}
