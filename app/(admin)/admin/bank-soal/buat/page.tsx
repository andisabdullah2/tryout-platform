"use client";

import { useRouter } from "next/navigation";
import { SoalEditor, type SoalFormData } from "@/components/admin/soal-editor";
import { useState } from "react";
import Link from "next/link";

export default function BuatSoalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: SoalFormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Gagal menyimpan soal");
      }

      router.push("/admin/bank-soal");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin/bank-soal" className="hover:text-blue-600 dark:hover:text-blue-400">
          Bank Soal
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Tambah Soal Baru</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Soal Baru</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Buat soal baru untuk bank soal platform
        </p>
      </div>

      <SoalEditor
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Simpan Soal"
      />
    </div>
  );
}
