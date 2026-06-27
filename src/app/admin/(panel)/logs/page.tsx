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

const ACCION_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  CREATE: { bg:"#DCFCE7", color:"#166534", border:"#BBF7D0" },
  UPDATE: { bg:"#DBEAFE", color:"#1E40AF", border:"#BFDBFE" },
  DELETE: { bg:"#FEE2E2", color:"#991B1B", border:"#FCA5A5" },
};

const TABLAS = ["servicios","pagos","gastos","usuarios"];

const S = {
  input: { width:"100%", padding:"9px 12px", border:"1px solid #E4E4E7", borderRadius:"8px", fontSize:"13px", fontFamily:"inherit", color:"#10121A", outline:"none", background:"#fff" },
  ghost: { padding:"8px 16px", border:"1px solid #E4E4E7", borderRadius:"8px", background:"transparent", fontSize:"13px", color:"#71717A", cursor:"pointer", fontFamily:"inherit" },
  th:    { padding:"10px 16px", textAlign:"left" as const, fontSize:"10px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.07em", color:"#A1A1AA" },
  td:    { padding:"12px 16px" },
};

export default function LogsPage() {
  const [rows, setRows]       = useState<Log[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [filtroTabla, setFiltroTabla] = useState("");

  const limit      = 30;
  const totalPages = Math.ceil(total / limit);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (filtroTabla) p.set("tabla", filtroTabla);
    const res  = await fetch(`/api/admin/logs?${p}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filtroTabla]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  return (
    <div style={{ padding:"32px 28px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom:"24px" }}>
        <h1 style={{ fontSize:"22px", fontWeight:800, color:"#10121A", letterSpacing:"-0.5px" }}>Logs</h1>
        <p style={{ fontSize:"13px", color:"#A1A1AA", marginTop:"3px" }}>Registro de actividad del sistema</p>
      </div>

      {/* Filtro */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
        <select value={filtroTabla} onChange={e => { setFiltroTabla(e.target.value); setPage(1); }} style={{ ...S.input, width:"auto", minWidth:"150px" }}>
          <option value="">Todas las tablas</option>
          {TABLAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {filtroTabla && (
          <button onClick={() => { setFiltroTabla(""); setPage(1); }} style={S.ghost}>Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"14px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #E4E4E7", background:"#FAFAFA" }}>
              {["#","Acción","Tabla / Registro","Detalle","Usuario","Fecha"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Sin registros</td></tr>
            ) : rows.map((l, i) => {
              const ac    = ACCION_STYLE[l.accion] ?? { bg:"#F4F4F5", color:"#71717A", border:"#E4E4E7" };
              const fecha = new Date(l.created_at).toLocaleDateString("es-EC", { day:"2-digit", month:"short", year:"numeric" });
              const hora  = new Date(l.created_at).toLocaleTimeString("es-EC", { hour:"2-digit", minute:"2-digit" });
              return (
                <tr key={l.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none" }}>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>#{l.id}</td>
                  <td style={S.td}>
                    <span style={{ display:"inline-flex", alignItems:"center", fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"20px", background:ac.bg, color:ac.color, border:`1px solid ${ac.border}`, fontFamily:"monospace" }}>
                      {l.accion}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#10121A" }}>{l.tabla}</span>
                    {l.registro_id != null && (
                      <span style={{ display:"block", fontSize:"11px", color:"#A1A1AA", fontFamily:"monospace" }}>#{l.registro_id}</span>
                    )}
                  </td>
                  <td style={{ ...S.td, fontSize:"13px", color:"#3F3F46", maxWidth:"260px" }}>
                    <span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {l.detalle ?? <span style={{ color:"#A1A1AA", fontStyle:"italic" }}>—</span>}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize:"13px", color:"#3F3F46" }}>{l.usuario ?? <span style={{ color:"#A1A1AA" }}>—</span>}</td>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>
                    {fecha}
                    <span style={{ display:"block", opacity:0.7 }}>{hora}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding:"12px 16px", borderTop:"1px solid #E4E4E7", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:"12px", color:"#A1A1AA" }}>{total} registros</span>
            <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...S.ghost, padding:"5px 10px", fontSize:"12px", opacity: page === 1 ? 0.4 : 1 }}>← Ant.</button>
              <span style={{ fontSize:"12px", color:"#3F3F46", padding:"0 8px" }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...S.ghost, padding:"5px 10px", fontSize:"12px", opacity: page === totalPages ? 0.4 : 1 }}>Sig. →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}