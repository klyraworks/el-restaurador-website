import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.rol !== "admin") redirect("/admin/login");

  const nombre = session.user.nombre;
  const rol = session.user.rol;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F4F4F5; }
        body { font-family: Inter, system-ui, -apple-system, sans-serif; }
        a { text-decoration: none; color: inherit; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #3F3F46;
          transition: background 0.12s;
          cursor: pointer;
        }
        .nav-link:hover { background: #F4F4F5; }
        .nav-link.active { background: #F4F4F5; color: #10121A; font-weight: 600; }
        .nav-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          background: #F4F4F5;
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#F4F4F5" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position: "fixed",
          top: 0, left: 0,
          width: "220px",
          height: "100vh",
          background: "#fff",
          borderRight: "1px solid #E4E4E7",
          display: "flex",
          flexDirection: "column",
          zIndex: 20,
        }}>
          {/* Logo */}
          <div style={{
            padding: "18px 16px",
            borderBottom: "1px solid #E4E4E7",
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}>
            <div style={{
              width: "28px", height: "28px",
              background: "#10121A",
              borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 900 }}>R</span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#10121A", letterSpacing: "-0.2px" }}>El Restaurador</p>
              <p style={{ fontSize: "10px", color: "#A1A1AA" }}>Panel admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "1px", overflowY: "auto" }}>
            {[
              { href: "/admin",           label: "Dashboard",  icon: "◈" },
              { href: "/admin/servicios", label: "Servicios",  icon: "⚙" },
              { href: "/admin/pagos",     label: "Pagos",      icon: "◎" },
              { href: "/admin/gastos",    label: "Gastos",     icon: "◉" },
              { href: "/admin/usuarios",  label: "Usuarios",   icon: "◑" },
              { href: "/admin/logs",      label: "Logs",       icon: "≡" },
            ].map(({ href, label, icon }) => (
              <a key={href} href={href} className="nav-link">
                <span className="nav-icon">{icon}</span>
                {label}
              </a>
            ))}
          </nav>

          {/* Usuario + logout */}
          <div style={{ padding: "12px", borderTop: "1px solid #E4E4E7" }}>
            <div style={{
              background: "#F4F4F5",
              borderRadius: "9px",
              padding: "10px 12px",
              marginBottom: "8px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#10121A" }}>{nombre}</p>
              <p style={{ fontSize: "10px", color: "#A1A1AA", fontFamily: "monospace", marginTop: "2px" }}>{rol}</p>
            </div>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}>
              <button type="submit" style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #E4E4E7",
                borderRadius: "7px",
                background: "transparent",
                fontSize: "12px",
                color: "#71717A",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        {/* ── Contenido ── */}
        <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
          {children}
        </main>

      </div>
    </>
  );
}