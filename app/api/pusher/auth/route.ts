import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPusherServer } from "@/lib/realtime/pusher";

/**
 * Pusher channel authentication endpoint.
 * Memvalidasi bahwa user hanya dapat subscribe ke channel miliknya sendiri.
 * Channel format: private-user-{userId}
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
  }

  // Validasi: user hanya boleh subscribe ke channel miliknya
  const expectedChannel = `private-user-${session.user.id}`;
  if (channelName !== expectedChannel) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const pusher = getPusherServer();
  const authResponse = pusher.authorizeChannel(socketId, channelName);

  return NextResponse.json(authResponse);
}
