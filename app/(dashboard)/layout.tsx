import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/layouts/dashboard-layout-client";

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
    <DashboardLayoutClient
      userName={session.user.name ?? undefined}
      userEmail={session.user.email ?? undefined}
      userImage={session.user.image ?? undefined}
      userRole={session.user.role}
    >
      {children}
    </DashboardLayoutClient>
  );
}
