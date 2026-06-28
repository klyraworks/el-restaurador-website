"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  nombre: string;
  rol: string;
}

export default function AdminShell({ children, nombre, rol }: AdminShellProps) {
  // Ambos en false para que SSR y el cliente inicial sean idénticos (evita hydration mismatch)
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setOpen(!mobile); // desktop: abre, mobile: cerrado
    setMounted(true);

    const handleResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // En mobile el sidebar siempre overlay (marginLeft = 0 siempre)
  const mainMargin = mounted && !isMobile && open ? "220px" : "0";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#F4F4F5",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    }}>

      {/* Overlay mobile */}
      {mounted && isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 19,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar — contenedor animado */}
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "220px",
        height: "100vh",
        transform: open ? "translateX(0)" : "translateX(-220px)",
        // Sin transición en el montaje inicial para evitar el slide-in en page load
        transition: mounted ? "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        zIndex: 20,
        willChange: "transform",
      }}>
        <Sidebar nombre={nombre} rol={rol} onCollapse={() => setOpen(false)} />
      </div>

      {/* Botón tab de apertura */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          transform: `translateY(-50%) translateX(${open ? "-48px" : "0"})`,
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          transition: mounted ? "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease" : "none",
          zIndex: 21,
          background: "#10121A",
          border: "none",
          borderRadius: "0 8px 8px 0",
          width: "32px",
          height: "56px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "2px 0 14px rgba(0,0,0,0.18)",
          padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Contenido principal */}
      <main style={{
        marginLeft: mainMargin,
        transition: mounted ? "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        flex: 1,
        minHeight: "100vh",
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}