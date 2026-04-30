import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid" },
        { status: 422 }
      );
    }

    const { email } = validation.data;

    // Selalu kembalikan respons sukses untuk mencegah email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.password) {
      // Hapus token lama jika ada
      await prisma.verificationToken.deleteMany({
        where: { identifier: `reset_${email}` },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

      await prisma.verificationToken.create({
        data: {
          identifier: `reset_${email}`,
          token,
          expires,
        },
      });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      success: true,
      data: {
        message:
          "Jika email terdaftar, tautan reset password telah dikirimkan.",
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
