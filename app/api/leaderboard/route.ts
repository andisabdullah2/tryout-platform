import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeaderboard } from "@/lib/tryout/leaderboard";
import { cacheGet } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paketId = searchParams.get("paketId");
  const periode = (searchParams.get("periode") ?? "ALL_TIME") as "ALL_TIME" | "MINGGUAN" | "BULANAN";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  if (!paketId) {
    return NextResponse.json({ success: false, error: "paketId diperlukan" }, { status: 422 });
  }

  const session = await auth();
  const userId = session?.user?.id;

  // Cache leaderboard selama 60 detik (tanpa data user-spesifik)
  const cacheKey = `leaderboard:${paketId}:${periode}:${limit}`;
  const { entries } = await cacheGet(
    cacheKey,
    () => getLeaderboard(paketId, periode, limit),
    60
  );

  // Tandai entri milik user saat ini (tidak di-cache)
  const sanitizedEntries = entries.map((e) => ({
    ...e,
    isCurrentUser: userId ? e.isCurrentUser : false,
  }));

  // Ambil posisi user secara langsung (tidak di-cache)
  let userEntry = null;
  if (userId && !sanitizedEntries.some((e) => e.isCurrentUser)) {
    const { userEntry: ue } = await getLeaderboard(paketId, periode, 1, userId);
    userEntry = ue;
  }

  return NextResponse.json({
    success: true,
    data: { entries: sanitizedEntries, userEntry, periode, paketId },
  });
}
