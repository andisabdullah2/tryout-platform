"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SoalEditor, type SoalFormData } from "@/components/admin/soal-editor";
import Link from "next/link";

interface SoalData extends SoalFormData {
  id: string;
  totalDijawab: number;
  totalBenar: number;
}

export default function EditSoalPage() {
  const router = useRouter();
  const params = useParams();
  const soalId = params["soalId"] as string;

  const [soal, setSoal] = useState<SoalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoal();
  }, [soalId]);

  async function fetchSoal() {
    try {
      const res = await fetch(`/api/soal/${soalId}`);
      if (!res.ok) {
        setError("Soal tidak ditemukan");
        return;
      }
      const data = await res.json();
      setSoal(data.data);
    } catch {
      setError("Gagal memuat soal");
    } finally {
      setIsFetching(false);
    }
  }

  async function handleSubmit(data: SoalFormData) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/soal/${soalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Gagal memperbarui soal");
      }

      router.push("/admin/bank-soal");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !soal) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-red-500">{error ?? "Soal tidak ditemukan"}</p>
        <Link href="/admin/bank-soal" className="text-blue-600 hover:underline mt-4 inline-block">
          Kembali ke Bank Soal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin/bank-soal" className="hover:text-blue-600 dark:hover:text-blue-400">
          Bank Soal
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Edit Soal</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Soal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Dijawab {soal.totalDijawab}× · Benar {soal.totalBenar}×
            {soal.totalDijawab > 0 && (
              <span> · Akurasi {Math.round((soal.totalBenar / soal.totalDijawab) * 100)}%</span>
            )}
          </p>
        </div>
      </div>

      <SoalEditor
        initialData={soal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Perbarui Soal"
      />
    </div>
  );
}
