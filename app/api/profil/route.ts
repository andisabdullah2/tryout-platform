import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfilSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  image: z.string().url("URL gambar tidak valid").optional().nullable(),
  darkMode: z.boolean().optional(),
  useAlias: z.boolean().optional(),
  alias: z.string().max(50).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      darkMode: true,
      useAlias: true,
      alias: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = updateProfilSchema.safeParse(body);

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

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        darkMode: true,
        useAlias: true,
        alias: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profil berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update profil error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
