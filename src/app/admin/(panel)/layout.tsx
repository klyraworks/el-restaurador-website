import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.rol !== "admin") redirect("/admin/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F4F5", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Sidebar nombre={session.user.nombre} rol={session.user.rol} />
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}