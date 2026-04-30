"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ChatMessage { id: string; userId: string; pesan: string; createdAt: string }
interface LiveClassData {
  id: string; judul: string; status: string; streamUrl?: string | null;
  jumlahHadir: number; kelas: { judul: string; slug: string };
  chatMessages: ChatMessage[];
}

export default function LiveClassRoomPage() {
  const params = useParams();
  const { data: session } = useSession();
  const liveClassId = params["liveClassId"] as string;

  const [liveClass, setLiveClass] = useState<LiveClassData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLiveClass();
    const interval = setInterval(fetchLiveClass, 30000); // refresh setiap 30 detik
    return () => clearInterval(interval);
  }, [liveClassId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchLiveClass() {
    const res = await fetch(`/api/live-class/${liveClassId}`);
    if (res.ok) {
      const data = await res.json() as { data: LiveClassData };
      setLiveClass(data.data);
      setMessages(data.data.chatMessages);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/live-class/${liveClassId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { data: ChatMessage };
        setMessages((prev) => [...prev, data.data]);
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  }

  if (!liveClass) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{liveClass.judul}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{liveClass.kelas.judul}</p>
        </div>
        <div className="flex items-center gap-3">
          {liveClass.status === "LIVE" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE · {liveClass.jumlahHadir} hadir
            </span>
          )}
          <Link href="/live-class"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Video stream */}
        <div className="lg:col-span-2 bg-black rounded-xl overflow-hidden flex items-center justify-center">
          {liveClass.streamUrl ? (
            <iframe
              src={liveClass.streamUrl}
              className="w-full h-full"
              allow="camera; microphone; fullscreen; display-capture"
              title={liveClass.judul}
            />
          ) : (
            <div className="text-center text-gray-400 p-8">
              {liveClass.status === "SCHEDULED" ? (
                <>
                  <div className="text-5xl mb-4">⏰</div>
                  <p className="text-lg font-medium">Live class belum dimulai</p>
                  <p className="text-sm mt-2">Instruktur akan segera memulai sesi</p>
                </>
              ) : liveClass.status === "ENDED" ? (
                <>
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-lg font-medium">Live class telah berakhir</p>
                  <p className="text-sm mt-2">Rekaman akan tersedia dalam 2 jam</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">📡</div>
                  <p>Stream belum tersedia</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">Belum ada pesan</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id}
                  className={`flex flex-col ${msg.userId === session?.user?.id ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.userId === session?.user?.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}>
                    {msg.pesan}
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {liveClass.status === "LIVE" && (
            <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pertanyaan..."
                maxLength={500}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={isSending || !newMessage.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                Kirim
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
