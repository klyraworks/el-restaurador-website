import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.rol !== "admin") redirect("/admin/login");

  return (
    <AdminShell nombre={session.user.nombre} rol={session.user.rol}>
      {children}
    </AdminShell>
  );
}