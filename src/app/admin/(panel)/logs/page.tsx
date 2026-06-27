"use client";
import { useEffect, useState, useCallback } from "react";

interface Log {
  id: number;
  accion: string;
  tabla: string;
  registro_id: number | null;
  detalle: string | null;
  created_at: string;
  usuario: string | null;
}

const ACCION_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  CREATE: { bg: "#DCFCE7", color: "#166534", border: "#BBF7D0", dot: "#22C55E" },
  UPDATE: { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6" },
  DELETE: { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5", dot: "#EF4444" },
};

const TABLAS = ["servicios", "pagos", "gastos", "usuarios"];

const S = {
  input: { width: "100%", padding: "9px 12px", border: "1px solid #E4E4E7", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", color: "#10121A", outline: "none", background: "#fff" },
  ghost: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid #E4E4E7", borderRadius: "8px", background: "transparent", fontSize: "13px", color: "#71717A", cursor: "pointer", fontFamily: "inherit" },
  th:    { padding: "10px 16px", textAlign: "left" as const, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#A1A1AA" },
  td:    { padding: "13px 16px" },
};

const IconFilter = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

function FocusSelect({ value, onChange, children, style }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; style?: React.CSSProperties }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...S.input, appearance: "none", paddingRight: "32px", borderColor: f ? "#10121A" : "#E4E4E7", boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", cursor: "pointer", ...style }}>
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  );
}

export default function LogsPage() {
  const [rows, setRows]       = useState<Log[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [filtroTabla, setFiltroTabla] = useState("");
  const [hoveredRow, setHoveredRow]   = useState<number | null>(null);

  const limit = 30;
  const totalPages = Math.ceil(total / limit);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (filtroTabla) p.set("tabla", filtroTabla);
    const res = await fetch(`/api/admin/logs?${p}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filtroTabla]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  return (
    <>
      <style>{`
        .btn-ghost:hover{background:#F4F4F5;border-color:#D4D4D8;color:#3F3F46}
        .pg-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid #E4E4E7;border-radius:7px;background:transparent;font-size:12px;color:#3F3F46;cursor:pointer;font-family:inherit;transition:background 0.12s}
        .pg-btn:hover:not(:disabled){background:#F4F4F5}
        .pg-btn:disabled{opacity:0.35;cursor:not-allowed}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ padding: "32px 28px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", letterSpacing: "-0.5px" }}>Logs</h1>
          <p style={{ fontSize: "13px", color: "#A1A1AA", marginTop: "3px" }}>{total > 0 ? `${total} eventos registrados` : "Registro de actividad del sistema"}</p>
        </div>

        {/* Filtro */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
          <span style={{ color: "#A1A1AA" }}><IconFilter /></span>
          <div style={{ width: "180px" }}>
            <FocusSelect value={filtroTabla} onChange={e => { setFiltroTabla(e.target.value); setPage(1); }}>
              <option value="">Todas las tablas</option>
              {TABLAS.map(t => <option key={t} value={t}>{t}</option>)}
            </FocusSelect>
          </div>
          {filtroTabla && (
            <button className="btn-ghost" onClick={() => { setFiltroTabla(""); setPage(1); }} style={{ ...S.ghost, padding: "7px 12px", fontSize: "12px" }}>
              <IconX /> Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E4E7", background: "#FAFAFA" }}>
                {["#", "Acción", "Tabla / Registro", "Detalle", "Usuario", "Fecha"].map(h => <th key={h} style={S.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <span style={{ fontSize: "13px", color: "#A1A1AA" }}>Cargando...</span>
                  </div>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", fontSize: "13px", color: "#A1A1AA" }}>Sin registros de actividad</td></tr>
              ) : rows.map((l, i) => {
                const ac    = ACCION_STYLE[l.accion] ?? { bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7", dot: "#A1A1AA" };
                const fecha = new Date(l.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
                const hora  = new Date(l.created_at).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
                const isHovered = hoveredRow === l.id;
                return (
                  <tr key={l.id} onMouseEnter={() => setHoveredRow(l.id)} onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none", background: isHovered ? "#FAFAFA" : "#fff", transition: "background 0.12s" }}>
                    <td style={{ ...S.td, fontSize: "11px", fontFamily: "monospace", color: "#C4C4C8" }}>#{l.id}</td>
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px", background: ac.bg, color: ac.color, border: `1px solid ${ac.border}`, fontFamily: "monospace" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ac.dot, flexShrink: 0 }} />
                        {l.accion}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#10121A" }}>{l.tabla}</span>
                      {l.registro_id != null && <span style={{ display: "block", fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace" }}>#{l.registro_id}</span>}
                    </td>
                    <td style={{ ...S.td, maxWidth: "260px" }}>
                      {l.detalle
                        ? <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px", color: "#3F3F46" }}>{l.detalle}</span>
                        : <span style={{ fontSize: "12px", color: "#C4C4C8", fontStyle: "italic" }}>—</span>}
                    </td>
                    <td style={{ ...S.td, fontSize: "13px", color: "#3F3F46" }}>
                      {l.usuario ?? <span style={{ color: "#C4C4C8" }}>—</span>}
                    </td>
                    <td style={{ ...S.td, fontSize: "11px", fontFamily: "monospace", color: "#A1A1AA" }}>
                      {fecha}
                      <span style={{ display: "block", opacity: 0.6, marginTop: "1px" }}>{hora}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#A1A1AA" }}>{total} registros · página {page} de {totalPages}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><IconChevronLeft /> Anterior</button>
                <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente <IconChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}