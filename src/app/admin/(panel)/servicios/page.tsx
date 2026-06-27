"use client";
import { useEffect, useState, useCallback } from "react";

interface Servicio {
  id: number;
  tricimoto_num: string;
  tricimoto_color: string;
  descripcion: string | null;
  monto_total: string;
  monto_pendiente: string;
  estado: string;
  created_at: string;
  mecanico: string;
  mecanico_id: number;
}

interface Usuario { id: number; nombre: string; rol: string; }

const ESTADOS = ["pendiente", "pagado", "anulado"];
const COLORES = ["Rojo","Azul","Verde","Amarillo"];

const EST: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pagado:  { bg: "#DCFCE7", color: "#166534", border: "#BBF7D0", label: "Pagado"   },
  pendiente: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", label: "Pendiente"},
  anulado: { bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7", label: "Anulado"  },
};

const S = {
  label: { display:"block", fontSize:"11px", fontWeight:600, color:"#3F3F46", marginBottom:"5px", textTransform:"uppercase" as const, letterSpacing:"0.05em" },
  input: { width:"100%", padding:"9px 12px", border:"1px solid #E4E4E7", borderRadius:"8px", fontSize:"13px", fontFamily:"inherit", color:"#10121A", outline:"none", background:"#fff" },
  primary: { padding:"8px 16px", border:"none", borderRadius:"8px", background:"#10121A", fontSize:"13px", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:600 },
  ghost:   { padding:"8px 16px", border:"1px solid #E4E4E7", borderRadius:"8px", background:"transparent", fontSize:"13px", color:"#71717A", cursor:"pointer", fontFamily:"inherit" },
  danger:  { padding:"8px 16px", border:"none", borderRadius:"8px", background:"#EF4444", fontSize:"13px", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:600 },
  th:      { padding:"10px 16px", textAlign:"left" as const, fontSize:"10px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.07em", color:"#A1A1AA" },
  td:      { padding:"12px 16px" },
};

const DEF = { tricimoto_num:"", tricimoto_color:"Rojo", descripcion:"", monto_total:"", monto_pendiente:"", mecanico_id:"", estado:"pendiente" };

export default function ServiciosPage() {
  const [rows, setRows]         = useState<Servicio[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroColor, setFiltroColor]   = useState("");
  const [modal, setModal]       = useState<"create"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Servicio|null>(null);
  const [mecanicos, setMecanicos] = useState<Usuario[]>([]);
  const [form, setForm]         = useState({ ...DEF });
  const [saving, setSaving]     = useState(false);

  const limit      = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (filtroEstado) p.set("estado", filtroEstado);
    if (filtroColor)  p.set("color",  filtroColor);
    const res  = await fetch(`/api/admin/servicios?${p}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filtroEstado, filtroColor]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  useEffect(() => {
    if (modal === "create" || modal === "edit") {
      fetch("/api/admin/usuarios").then(r => r.json()).then(d => setMecanicos(d.rows ?? []));
    }
  }, [modal]);

  function openCreate() { setForm({ ...DEF }); setSelected(null); setModal("create"); }
  function openEdit(s: Servicio) {
    setSelected(s);
    setForm({ tricimoto_num: s.tricimoto_num, tricimoto_color: s.tricimoto_color, descripcion: s.descripcion ?? "", monto_total: s.monto_total, monto_pendiente: s.monto_pendiente, mecanico_id: String(s.mecanico_id), estado: s.estado });
    setModal("edit");
  }

  async function handleSave() {
    setSaving(true);
    const body = { ...form, monto_total: parseFloat(form.monto_total), monto_pendiente: parseFloat(form.monto_pendiente), mecanico_id: parseInt(form.mecanico_id), ...(selected ? { id: selected.id } : {}) };
    await fetch("/api/admin/servicios", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false); setModal(null); fetchRows();
  }

  async function handleDelete() {
    setSaving(true);
    await fetch("/api/admin/servicios", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected!.id }) });
    setSaving(false); setModal(null); fetchRows();
  }

  const f = (field: keyof typeof form) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value })),
    style: S.input,
  });

  return (
    <div style={{ padding: "32px 28px 60px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h1 style={{ fontSize:"22px", fontWeight:800, color:"#10121A", letterSpacing:"-0.5px" }}>Servicios</h1>
          <p style={{ fontSize:"13px", color:"#A1A1AA", marginTop:"3px" }}>Gestión de órdenes de servicio</p>
        </div>
        <button onClick={openCreate} style={S.primary}>+ Nuevo servicio</button>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }} style={{ ...S.input, width:"auto", minWidth:"150px" }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{EST[e]?.label ?? e}</option>)}
        </select>
        <select value={filtroColor} onChange={e => { setFiltroColor(e.target.value); setPage(1); }} style={{ ...S.input, width:"auto", minWidth:"150px" }}>
          <option value="">Todos los colores</option>
          {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filtroEstado || filtroColor) && (
          <button onClick={() => { setFiltroEstado(""); setFiltroColor(""); setPage(1); }} style={S.ghost}>Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"14px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #E4E4E7", background:"#FAFAFA" }}>
              {["#","Tricimoto","Mecánico","Montos","Estado","Fecha",""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Sin resultados</td></tr>
            ) : rows.map((s, i) => {
              const est  = EST[s.estado] ?? EST.anulado;
              const fecha = new Date(s.created_at).toLocaleDateString("es-EC", { day:"2-digit", month:"short", year:"numeric" });
              return (
                <tr key={s.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none" }}>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>#{s.id}</td>
                  <td style={S.td}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#10121A" }}>{s.tricimoto_num}</span>
                    <span style={{ fontSize:"11px", color:"#A1A1AA", marginLeft:"6px" }}>{s.tricimoto_color}</span>
                  </td>
                  <td style={{ ...S.td, fontSize:"13px", color:"#3F3F46" }}>{s.mecanico}</td>
                  <td style={S.td}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#10121A", fontFamily:"monospace" }}>${Number(s.monto_total).toFixed(2)}</span>
                    {Number(s.monto_pendiente) > 0 && (
                      <span style={{ display:"block", fontSize:"11px", color:"#92400E", fontFamily:"monospace" }}>Pend. ${Number(s.monto_pendiente).toFixed(2)}</span>
                    )}
                  </td>
                  <td style={S.td}>
                    <span style={{ display:"inline-flex", alignItems:"center", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"20px", background:est.bg, color:est.color, border:`1px solid ${est.border}` }}>
                      {est.label}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>{fecha}</td>
                  <td style={S.td}>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={() => openEdit(s)} style={{ padding:"5px 10px", border:"1px solid #E4E4E7", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#3F3F46", cursor:"pointer", fontFamily:"inherit" }}>Editar</button>
                      <button onClick={() => { setSelected(s); setModal("delete"); }} style={{ padding:"5px 10px", border:"1px solid #FCA5A5", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#EF4444", cursor:"pointer", fontFamily:"inherit" }}>Eliminar</button>
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
          <div style={{ background:"#fff", borderRadius:"14px", width:"100%", maxWidth:"480px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #E4E4E7" }}>
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>{selected ? "Editar servicio" : "Nuevo servicio"}</h2>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={S.label}>Número</label>
                  <input {...f("tricimoto_num")} placeholder="001" />
                </div>
                <div>
                  <label style={S.label}>Color</label>
                  <select {...f("tricimoto_color")}>
                    {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={S.label}>Mecánico</label>
                <select {...f("mecanico_id")}>
                  <option value="">Seleccionar mecánico</option>
                  {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={S.label}>Monto total</label>
                  <input {...f("monto_total")} type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <label style={S.label}>Monto pendiente</label>
                  <input {...f("monto_pendiente")} type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              {selected && (
                <div>
                  <label style={S.label}>Estado</label>
                  <select {...f("estado")}>
                    {ESTADOS.map(e => <option key={e} value={e}>{EST[e]?.label ?? e}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={S.label}>Descripción</label>
                <textarea {...f("descripcion")} rows={3} placeholder="Descripción del servicio..." style={{ ...S.input, resize:"vertical" }} />
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
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>Eliminar servicio</h2>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <p style={{ fontSize:"13px", color:"#3F3F46", lineHeight:"1.6" }}>
                ¿Eliminar el servicio de la tricimoto <strong>{selected.tricimoto_num} ({selected.tricimoto_color})</strong>? Esta acción no se puede deshacer.
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