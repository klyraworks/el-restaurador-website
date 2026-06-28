"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/servicios",
    label: "Servicios",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/admin/pagos",
    label: "Pagos",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    href: "/admin/gastos",
    label: "Gastos",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/logs",
    label: "Logs",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

interface SidebarProps {
  nombre: string;
  rol: string;
  onCollapse?: () => void;
}

export default function Sidebar({ nombre, rol, onCollapse }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <style>{`
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #71717A;
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          user-select: none;
        }
        .sidebar-nav-link:hover {
          background: #F4F4F5;
          color: #18181B;
        }
        .sidebar-nav-link.active {
          background: #F4F4F5;
          color: #10121A;
          font-weight: 600;
        }
        .sidebar-nav-link.active .nav-icon-wrap {
          background: #10121A;
          color: #fff;
        }
        .nav-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #EDEDEE;
          color: #71717A;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .sidebar-nav-link:hover .nav-icon-wrap {
          background: #E4E4E7;
          color: #18181B;
        }
        .logout-btn {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          background: transparent;
          font-size: 12px;
          color: #71717A;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .logout-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
          color: #DC2626;
        }
        .logout-btn:hover .logout-icon {
          color: #DC2626;
        }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          color: #A1A1AA;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 8px 10px 4px;
          margin-top: 4px;
        }
        .collapse-btn {
          width: 26px;
          height: 26px;
          border: 1px solid #E4E4E7;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A1A1AA;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          padding: 0;
        }
        .collapse-btn:hover {
          background: #F4F4F5;
          color: #10121A;
          border-color: #D4D4D8;
        }
      `}</style>

      <aside style={{
        width: "220px",
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid #E4E4E7",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Logo + collapse */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid #E4E4E7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div style={{
              width: "30px", height: "30px",
              background: "#10121A",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#10121A", letterSpacing: "-0.2px", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>El Restaurador</p>
              <p style={{ fontSize: "10px", color: "#A1A1AA", marginTop: "1px", whiteSpace: "nowrap" }}>Panel de administración</p>
            </div>
          </div>

          {onCollapse && (
            <button className="collapse-btn" onClick={onCollapse} aria-label="Colapsar menú">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "1px", overflowY: "auto" }}>
          <div className="nav-section-label">General</div>
          {NAV_ITEMS.slice(0, 1).map(({ href, label, icon, exact }) => (
            <a key={href} href={href} className={`sidebar-nav-link${isActive(href, exact) ? " active" : ""}`}>
              <span className="nav-icon-wrap">{icon}</span>
              {label}
            </a>
          ))}

          <div className="nav-section-label" style={{ marginTop: "8px" }}>Operaciones</div>
          {NAV_ITEMS.slice(1, 4).map(({ href, label, icon, exact }) => (
            <a key={href} href={href} className={`sidebar-nav-link${isActive(href, exact) ? " active" : ""}`}>
              <span className="nav-icon-wrap">{icon}</span>
              {label}
            </a>
          ))}

          <div className="nav-section-label" style={{ marginTop: "8px" }}>Sistema</div>
          {NAV_ITEMS.slice(4).map(({ href, label, icon, exact }) => (
            <a key={href} href={href} className={`sidebar-nav-link${isActive(href, exact) ? " active" : ""}`}>
              <span className="nav-icon-wrap">{icon}</span>
              {label}
            </a>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div style={{ padding: "10px 10px 12px", borderTop: "1px solid #E4E4E7", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            background: "#F4F4F5",
            borderRadius: "9px",
            padding: "9px 11px",
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}>
            <div style={{
              width: "30px", height: "30px",
              background: "#10121A",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.02em" }}>{initials}</span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#10121A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nombre}</p>
              <p style={{ fontSize: "10px", color: "#A1A1AA", fontFamily: "monospace", marginTop: "1px" }}>{rol}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button type="submit" className="logout-btn">
              <svg className="logout-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "color 0.15s" }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}