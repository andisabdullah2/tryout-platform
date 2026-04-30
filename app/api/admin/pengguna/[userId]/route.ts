import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "INSTRUKTUR", "PESERTA"]).optional(),
  isActive: z.boolean().optional(),
});

/** PATCH /api/admin/pengguna/[userId] — update role dan/atau status aktif pengguna */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { userId } = await params;

  try {
    const body = await request.json();

    // Cegah admin menonaktifkan akun sendiri
    if (userId === session.user.id && body.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menonaktifkan akun sendiri" },
        { status: 422 }
      );
    }
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { role, isActive } = validation.data;

    if (role === undefined && isActive === undefined) {
      return NextResponse.json(
        { success: false, error: "Tidak ada data yang diperbarui" },
        { status: 422 }
      );
    }

    // Pastikan pengguna yang akan diubah ada
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
