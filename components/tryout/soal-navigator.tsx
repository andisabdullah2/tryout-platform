"use client";

export interface SoalInfo {
  id: string;
  subtes: string;
}

interface SoalNavigatorProps {
  totalSoal: number;
  currentIndex: number;
  answeredIds: Set<string>;
  soalList: SoalInfo[];
  onNavigate: (index: number) => void;
}

// Warna badge per subtes
const SUBTES_COLOR: Record<string, string> = {
  TWK: "bg-blue-600",
  TIU: "bg-purple-600",
  TKP: "bg-orange-500",
  TPS_PENALARAN_UMUM: "bg-indigo-600",
  TPS_PPU: "bg-violet-600",
  TPS_PBM: "bg-fuchsia-600",
  TPS_PK: "bg-pink-600",
  LITERASI_IND: "bg-rose-600",
  LITERASI_ENG: "bg-red-600",
  PENALARAN_MATEMATIKA: "bg-amber-600",
  MATEMATIKA: "bg-amber-600",
  BAHASA_INDONESIA: "bg-green-600",
  BAHASA_INGGRIS: "bg-teal-600",
  PENGETAHUAN_UMUM: "bg-cyan-600",
  WAWASAN_KEBANGSAAN: "bg-blue-700",
  UMUM: "bg-gray-600",
};

const SUBTES_LABEL: Record<string, string> = {
  TWK: "TWK",
  TIU: "TIU",
  TKP: "TKP",
  TPS_PENALARAN_UMUM: "Penalaran Umum",
  TPS_PPU: "PPU",
  TPS_PBM: "PBM",
  TPS_PK: "PK",
  LITERASI_IND: "Literasi Ind",
  LITERASI_ENG: "Literasi Eng",
  PENALARAN_MATEMATIKA: "Penalaran Mat",
  MATEMATIKA: "Matematika",
  BAHASA_INDONESIA: "B. Indonesia",
  BAHASA_INGGRIS: "B. Inggris",
  PENGETAHUAN_UMUM: "Pengetahuan Umum",
  WAWASAN_KEBANGSAAN: "Wawasan Kebangsaan",
  UMUM: "Umum",
};

export function SoalNavigator({
  totalSoal,
  currentIndex,
  answeredIds,
  soalList,
  onNavigate,
}: SoalNavigatorProps) {
  // Kelompokkan soal per subtes (pertahankan urutan kemunculan pertama)
  const subtesOrder: string[] = [];
  const subtesGroups: Record<string, { index: number; soalId: string }[]> = {};

  soalList.forEach((soal, index) => {
    if (!subtesGroups[soal.subtes]) {
      subtesGroups[soal.subtes] = [];
      subtesOrder.push(soal.subtes);
    }
    subtesGroups[soal.subtes].push({ index, soalId: soal.id });
  });

  const currentSubtes = soalList[currentIndex]?.subtes ?? "";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Navigasi Soal</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {answeredIds.size}/{totalSoal} dijawab
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${(answeredIds.size / totalSoal) * 100}%` }}
        />
      </div>

      {/* Soal dikelompokkan per subtes */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {subtesOrder.map((subtes) => {
          const items = subtesGroups[subtes]!;
          const answeredInGroup = items.filter((i) => answeredIds.has(i.soalId)).length;
          const colorClass = SUBTES_COLOR[subtes] ?? "bg-gray-600";
          const isActiveGroup = subtes === currentSubtes;

          return (
            <div key={subtes}>
              {/* Header subtes */}
              <div className={`flex items-center justify-between mb-2 px-1`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <span className={`text-xs font-semibold ${
                    isActiveGroup
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {SUBTES_LABEL[subtes] ?? subtes}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {answeredInGroup}/{items.length}
                </span>
              </div>

              {/* Grid nomor soal dalam subtes */}
              <div className="grid grid-cols-5 gap-1.5">
                {items.map(({ index, soalId }) => {
                  const isAnswered = answeredIds.has(soalId);
                  const isCurrent = index === currentIndex;

                  return (
                    <button
                      key={soalId}
                      onClick={() => onNavigate(index)}
                      title={`Soal ${index + 1} — ${SUBTES_LABEL[subtes] ?? subtes}${isAnswered ? " (dijawab)" : ""}`}
                      className={`
                        w-full aspect-square rounded-lg text-xs font-bold transition-all
                        ${isCurrent
                          ? `${colorClass} text-white ring-2 ring-offset-1 ring-blue-400`
                          : isAnswered
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span>Aktif</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900" />
          <span>Dijawab</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
          <span>Belum</span>
        </div>
      </div>
    </div>
  );
}
