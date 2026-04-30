import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const page = parseInt(searchParams.get("page") ?? "1");
  const skip = (page - 1) * limit;
  const onlyUnread = searchParams.get("unread") === "true";

  const where = {
    userId: session.user.id,
    ...(onlyUnread && { isRead: false }),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/** PATCH /api/notifikasi — tandai semua notifikasi sebagai dibaca */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { all?: boolean };

  if (body.all) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, data: { message: "Semua notifikasi ditandai dibaca" } });
  }

  return NextResponse.json({ success: false, error: "Parameter tidak valid" }, { status: 422 });
}
