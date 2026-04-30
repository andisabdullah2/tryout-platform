import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
        userImage={session.user.image ?? undefined}
        userRole={session.user.role}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        {/* 19.1: id="main-content" untuk skip link aksesibilitas */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
