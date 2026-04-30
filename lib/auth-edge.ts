/**
 * Konfigurasi NextAuth minimal untuk Edge Runtime (middleware).
 * TIDAK boleh import Prisma atau library Node.js lainnya.
 * Hanya membaca JWT token — tidak ada database query.
 */
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
