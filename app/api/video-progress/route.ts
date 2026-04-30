import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProgressSchema = z.object({
  modulId: z.string().min(1),
  posisiDetik: z.number().int().min(0),
  isSelesai: z.boolean().optional().default(false),
});

// GET: ambil progress video untuk modul tertentu
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const modulId = searchParams.get("modulId");

  if (!modulId) {
    return NextResponse.json({ success: false, error: "modulId diperlukan" }, { status: 422 });
  }

  const progress = await prisma.videoProgress.findUnique({
    where: { userId_modulId: { userId: session.user.id, modulId } },
  });

  return NextResponse.json({
    success: true,
    data: progress ?? { posisiDetik: 0, isSelesai: false },
  });
}

// POST: simpan/update posisi video (Property 12)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = updateProgressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { modulId, posisiDetik, isSelesai } = validation.data;
    const userId = session.user.id;

    const progress = await prisma.videoProgress.upsert({
      where: { userId_modulId: { userId, modulId } },
      create: { userId, modulId, posisiDetik, isSelesai },
      update: { posisiDetik, isSelesai },
    });

    // Cek apakah semua modul dalam kelas sudah selesai
    if (isSelesai) {
      await checkKelasCompletion(userId, modulId);
    }

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("Video progress error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

async function checkKelasCompletion(userId: string, modulId: string) {
  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
    select: { kelasId: true },
  });
  if (!modul) return;

  const [totalModul, selesaiModul] = await Promise.all([
    prisma.modul.count({ where: { kelasId: modul.kelasId } }),
    prisma.videoProgress.count({
      where: { userId, isSelesai: true, modul: { kelasId: modul.kelasId } },
    }),
  ]);

  if (totalModul > 0 && totalModul === selesaiModul) {
    await prisma.enrollment.updateMany({
      where: { userId, kelasId: modul.kelasId, completedAt: null },
      data: { completedAt: new Date() },
    });
  }
}
