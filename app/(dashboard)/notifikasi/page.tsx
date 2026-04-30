import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NotifikasiList } from "./notifikasi-list";

export const metadata = { title: "Notifikasi" };

export default async function NotifikasiPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        <a
          href="/notifikasi/pengaturan"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Pengaturan →
        </a>
      </div>

      <NotifikasiList
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          judul: n.judul,
          pesan: n.pesan,
          tipe: n.tipe,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
          data: n.data as Record<string, unknown> | null,
        }))}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
