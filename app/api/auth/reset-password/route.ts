import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

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

    const { token, password } = validation.data;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Token tidak valid atau sudah digunakan" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { success: false, error: "Token sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    // Ambil email dari identifier (format: reset_email@example.com)
    const email = verificationToken.identifier.replace("reset_", "");

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      data: { message: "Kata sandi berhasil diperbarui. Silakan login." },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
