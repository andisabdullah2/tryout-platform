import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["SCHEDULED", "LIVE", "ENDED"]).optional(),
  streamUrl: z.string().url().optional().nullable(),
  recordingUrl: z.string().url().optional().nullable(),
});

type RouteParams = { params: Promise<{ liveClassId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { liveClassId } = await params;
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: liveClassId },
    include: {
      kelas: { select: { id: true, judul: true, slug: true } },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { liveClass: false },
      },
    },
  });
  if (!liveClass) {
    return NextResponse.json({ success: false, error: "Live class tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: liveClass });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { liveClassId } = await params;
  const body = await request.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, error: "Data tidak valid" }, { status: 422 });
  }

  const updated = await prisma.liveClass.update({
    where: { id: liveClassId },
    data: validation.data,
  });

  return NextResponse.json({ success: true, data: updated });
}
