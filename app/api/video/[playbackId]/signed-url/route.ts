import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSignedPlaybackUrl } from "@/lib/mux";

type RouteParams = { params: Promise<{ playbackId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { playbackId } = await params;

  // Cari konten dengan playbackId ini
  const konten = await prisma.kontenModul.findFirst({
    where: { muxPlaybackId: playbackId },
    include: {
      modul: {
        include: {
          kelas: { select: { id: true, modelAkses: true } },
        },
      },
    },
  });

  if (!konten) {
    return NextResponse.json({ success: false, error: "Video tidak ditemukan" }, { status: 404 });
  }

  const kelas = konten.modul.kelas;

  // Validasi akses untuk konten premium
  if (kelas.modelAkses !== "GRATIS") {
    const [enrollment, langganan] = await Promise.all([
      prisma.enrollment.findUnique({
        where: { userId_kelasId: { userId: session.user.id, kelasId: kelas.id } },
      }),
      prisma.subscription.findFirst({
        where: { userId: session.user.id, isActive: true, endDate: { gt: new Date() } },
      }),
    ]);

    if (!enrollment && !langganan) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak", code: "ACCESS_DENIED" },
        { status: 403 }
      );
    }
  }

  try {
    const signedUrl = await createSignedPlaybackUrl(playbackId);
    return NextResponse.json({ success: true, data: { signedUrl } });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat signed URL" },
      { status: 500 }
    );
  }
}
