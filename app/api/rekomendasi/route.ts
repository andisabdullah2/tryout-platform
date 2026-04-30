import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecommendations } from "@/lib/recommendation/engine";

/**
 * GET /api/rekomendasi
 * Ambil rekomendasi konten untuk user yang sedang login.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const recommendations = await getRecommendations(session.user.id, 6);

  return NextResponse.json({ success: true, data: recommendations });
}
