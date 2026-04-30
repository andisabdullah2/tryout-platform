import Pusher from "pusher";
import PusherClient from "pusher-js";

/**
 * Pusher server-side client untuk mengirim event real-time.
 * Digunakan di API routes dan server actions.
 */
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1",
      useTLS: true,
    });
  }
  return pusherServer;
}

/**
 * Kirim notifikasi real-time ke channel user tertentu.
 * Channel: `private-user-{userId}`
 * Event: `notification`
 */
export async function sendRealtimeNotification(
  userId: string,
  payload: {
    id: string;
    judul: string;
    pesan: string;
    tipe: string;
    createdAt: string;
  }
): Promise<void> {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(`private-user-${userId}`, "notification", payload);
  } catch (error) {
    // Real-time gagal tidak boleh memblokir alur utama
    console.error("Pusher trigger error:", error);
  }
}

/**
 * Pusher client-side config untuk digunakan di komponen React.
 * Gunakan singleton agar tidak membuat koneksi baru setiap render.
 */
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient hanya dapat dipanggil di sisi client");
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1",
        authEndpoint: "/api/pusher/auth",
      }
    );
  }

  return pusherClientInstance;
}
