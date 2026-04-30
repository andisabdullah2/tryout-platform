import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route yang memerlukan autentikasi
const protectedRoutes = ["/dashboard", "/tryout/sesi", "/kelas", "/profil", "/riwayat", "/notifikasi", "/leaderboard"];

// Route yang hanya bisa diakses Admin
const adminRoutes = ["/admin"];

// Route yang hanya bisa diakses Instruktur atau Admin
const instrukturRoutes = ["/instruktur"];

// Route yang hanya bisa diakses tamu (belum login)
const guestOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role;

  // Redirect tamu dari halaman yang butuh auth
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect user yang sudah login dari halaman guest-only
  const isGuestOnly = guestOnlyRoutes.some((route) => pathname.startsWith(route));
  if (isGuestOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Proteksi route admin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // Proteksi route instruktur
  const isInstrukturRoute = instrukturRoutes.some((route) => pathname.startsWith(route));
  if (isInstrukturRoute && userRole !== "INSTRUKTUR" && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
