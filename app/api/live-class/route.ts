import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLiveClassSchema = z.object({
  kelasId: z.string().min(1),
  judul: z.string().min(3),
  deskripsi: z.string().optional().nullable(),
  jadwalMulai: z.string().datetime(),
  durasiEstimasi: z.number().int().min(15).max(480), // 15 menit - 8 jam
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId");
  const upcoming = searchParams.get("upcoming") === "true";

  const where = {
    ...(kelasId && { kelasId }),
    ...(upcoming && { jadwalMulai: { gte: new Date() }, status: { in: ["SCHEDULED", "LIVE"] as const } }),
  };

  const liveClasses = await prisma.liveClass.findMany({
    where,
    include: {
      kelas: { select: { id: true, judul: true, slug: true } },
    },
    orderBy: { jadwalMulai: "asc" },
    take: 20,
  });

  return NextResponse.json({ success: true, data: liveClasses });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createLiveClassSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { jadwalMulai, ...rest } = validation.data;

    const liveClass = await prisma.liveClass.create({
      data: {
        ...rest,
        jadwalMulai: new Date(jadwalMulai),
        instrukturId: session.user.id,
      },
    });

    // Kirim notifikasi ke peserta yang terdaftar di kelas (async)
    sendLiveClassNotifications(liveClass.id, liveClass.kelasId, liveClass.judul, new Date(jadwalMulai))
      .catch(console.error);

    return NextResponse.json({ success: true, data: liveClass }, { status: 201 });
  } catch (error) {
    console.error("Create live class error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

async function sendLiveClassNotifications(
  liveClassId: string,
  kelasId: string,
  judul: string,
  jadwalMulai: Date
) {
  const enrollments = await prisma.enrollment.findMany({
    where: { kelasId },
    include: { user: { select: { id: true } } },
  });

  const notifications = enrollments.map((e) => ({
    userId: e.user.id,
    tipe: "LIVE_CLASS_REMINDER" as const,
    judul: `Live Class: ${judul}`,
    pesan: `Live class dijadwalkan pada ${jadwalMulai.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
    data: { liveClassId, jadwalMulai: jadwalMulai.toISOString() },
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}
