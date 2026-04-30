import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const chatSchema = z.object({ pesan: z.string().min(1).max(500) });
type RouteParams = { params: Promise<{ liveClassId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { liveClassId } = await params;
  const body = await request.json();
  const validation = chatSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, error: "Pesan tidak valid" }, { status: 422 });
  }

  // Cek live class masih aktif
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: liveClassId },
    select: { status: true },
  });
  if (!liveClass || liveClass.status !== "LIVE") {
    return NextResponse.json({ success: false, error: "Live class tidak aktif" }, { status: 400 });
  }

  const chat = await prisma.liveClassChat.create({
    data: { liveClassId, userId: session.user.id, pesan: validation.data.pesan },
  });

  return NextResponse.json({ success: true, data: chat }, { status: 201 });
}
