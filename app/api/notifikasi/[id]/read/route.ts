import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;

  const notif = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!notif) {
    return NextResponse.json({ success: false, error: "Notifikasi tidak ditemukan" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, data: { message: "Notifikasi ditandai dibaca" } });
}
