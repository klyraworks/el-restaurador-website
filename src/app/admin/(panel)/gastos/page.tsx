"use client";
import { useEffect, useState, useCallback } from "react";

interface Gasto {
  id: number;
  tipo: string;
  monto: string;
  descripcion: string | null;
  created_at: string;
  registrado_por: string;
}

const TIPO_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  gasto:    { bg:"#FEE2E2", color:"#991B1B", border:"#FCA5A5", label:"Gasto"    },
  adelanto: { bg:"#DBEAFE", color:"#1E40AF", border:"#BFDBFE", label:"Adelanto" },
};

const S = {
  label:   { display:"block", fontSize:"11px", fontWeight:600, color:"#3F3F46", marginBottom:"5px", textTransform:"uppercase" as const, letterSpacing:"0.05em" },
  input:   { width:"100%", padding:"9px 12px", border:"1px solid #E4E4E7", borderRadius:"8px", fontSize:"13px", fontFamily:"inherit", color:"#10121A", outline:"none", background:"#fff" },
  primary: { padding:"8px 16px", border:"none", borderRadius:"8px", background:"#10121A", fontSize:"13px", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:600 },
  ghost:   { padding:"8px 16px", border:"1px solid #E4E4E7", borderRadius:"8px", background:"transparent", fontSize:"13px", color:"#71717A", cursor:"pointer", fontFamily:"inherit" },
  danger:  { padding:"8px 16px", border:"none", borderRadius:"8px", background:"#EF4444", fontSize:"13px", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:600 },
  th:      { padding:"10px 16px", textAlign:"left" as const, fontSize:"10px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.07em", color:"#A1A1AA" },
  td:      { padding:"12px 16px" },
};

const DEF = { tipo:"gasto", monto:"", descripcion:"" };

export default function GastosPage() {
  const [rows, setRows]         = useState<Gasto[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [modal, setModal]       = useState<"create"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Gasto|null>(null);
  const [form, setForm]         = useState({ ...DEF });
  const [saving, setSaving]     = useState(false);

  const limit      = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (filtroTipo) p.set("tipo", filtroTipo);
    const res  = await fetch(`/api/admin/gastos?${p}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filtroTipo]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openEdit(g: Gasto) {
    setSelected(g);
    setForm({ tipo: g.tipo, monto: g.monto, descripcion: g.descripcion ?? "" });
    setModal("edit");
  }

  async function handleSave() {
    setSaving(true);
    const body = { ...form, monto: parseFloat(form.monto), ...(selected ? { id: selected.id } : {}) };
    await fetch("/api/admin/gastos", { method: selected ? "PATCH" : "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    setSaving(false); setModal(null); fetchRows();
  }

  async function handleDelete() {
    setSaving(true);
    await fetch("/api/admin/gastos", { method:"DELETE", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id: selected!.id }) });
    setSaving(false); setModal(null); fetchRows();
  }

  return (
    <div style={{ padding:"32px 28px 60px" }}>
      <style>{`.adm-sel{appearance:none;-webkit-appearance:none;padding:9px 34px 9px 12px;border:1px solid #D4D4D8;border-radius:8px;font-size:13px;font-family:inherit;color:#10121A;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;outline:none;cursor:pointer;transition:border-color 0.12s;width:100%;box-sizing:border-box}.adm-sel:hover{border-color:#A1A1AA}.adm-sel:focus{border-color:#10121A;box-shadow:0 0 0 3px rgba(16,18,26,0.06)}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h1 style={{ fontSize:"22px", fontWeight:800, color:"#10121A", letterSpacing:"-0.5px" }}>Gastos</h1>
          <p style={{ fontSize:"13px", color:"#A1A1AA", marginTop:"3px" }}>Gastos y adelantos del taller</p>
        </div>
        <button onClick={() => { setForm({ ...DEF }); setSelected(null); setModal("create"); }} style={S.primary}>+ Nuevo gasto</button>
      </div>

      {/* Filtro */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPage(1); }} className="adm-sel" style={{ width:"auto", minWidth:"150px" }}>
          <option value="">Todos los tipos</option>
          <option value="gasto">Gasto</option>
          <option value="adelanto">Adelanto</option>
        </select>
        {filtroTipo && (
          <button onClick={() => { setFiltroTipo(""); setPage(1); }} style={S.ghost}>Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"14px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #E4E4E7", background:"#FAFAFA" }}>
              {["#","Tipo","Monto / Descripción","Registrado por","Fecha",""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Sin resultados</td></tr>
            ) : rows.map((g, i) => {
              const t     = TIPO_STYLE[g.tipo] ?? TIPO_STYLE.gasto;
              const fecha = new Date(g.created_at).toLocaleDateString("es-EC", { day:"2-digit", month:"short", year:"numeric" });
              return (
                <tr key={g.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none" }}>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>#{g.id}</td>
                  <td style={S.td}>
                    <span style={{ display:"inline-flex", alignItems:"center", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"20px", background:t.bg, color:t.color, border:`1px solid ${t.border}` }}>
                      {t.label}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize:"14px", fontWeight:700, color:"#10121A", fontFamily:"monospace" }}>${Number(g.monto).toFixed(2)}</span>
                    {g.descripcion && (
                      <span style={{ display:"block", fontSize:"11px", color:"#A1A1AA", marginTop:"2px" }}>{g.descripcion}</span>
                    )}
                  </td>
                  <td style={{ ...S.td, fontSize:"13px", color:"#3F3F46" }}>{g.registrado_por}</td>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>{fecha}</td>
                  <td style={S.td}>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={() => openEdit(g)} style={{ padding:"5px 10px", border:"1px solid #E4E4E7", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#3F3F46", cursor:"pointer", fontFamily:"inherit" }}>Editar</button>
                      <button onClick={() => { setSelected(g); setModal("delete"); }} style={{ padding:"5px 10px", border:"1px solid #FCA5A5", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#EF4444", cursor:"pointer", fontFamily:"inherit" }}>Eliminar</button>
                    </div>
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

      {/* Modal crear/editar */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#fff", borderRadius:"14px", width:"100%", maxWidth:"400px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #E4E4E7" }}>
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>{selected ? "Editar gasto" : "Nuevo gasto"}</h2>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <label style={S.label}>Tipo</label>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="adm-sel">
                  <option value="gasto">Gasto</option>
                  <option value="adelanto">Adelanto</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Monto</label>
                <input type="number" step="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} style={S.input} placeholder="0.00" />
              </div>
              <div>
                <label style={S.label}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Descripción opcional..." style={{ ...S.input, resize:"vertical" }} />
              </div>
            </div>
            <div style={{ padding:"16px 24px", borderTop:"1px solid #E4E4E7", display:"flex", justifyContent:"flex-end", gap:"8px" }}>
              <button onClick={() => setModal(null)} style={S.ghost}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ ...S.primary, opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {modal === "delete" && selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#fff", borderRadius:"14px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #E4E4E7" }}>
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>Eliminar {selected.tipo}</h2>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <p style={{ fontSize:"13px", color:"#3F3F46", lineHeight:"1.6" }}>
                ¿Eliminar este {TIPO_STYLE[selected.tipo]?.label.toLowerCase()} de <strong>${Number(selected.monto).toFixed(2)}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ padding:"16px 24px", borderTop:"1px solid #E4E4E7", display:"flex", justifyContent:"flex-end", gap:"8px" }}>
              <button onClick={() => setModal(null)} style={S.ghost}>Cancelar</button>
              <button onClick={handleDelete} disabled={saving} style={{ ...S.danger, opacity: saving ? 0.6 : 1 }}>{saving ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}