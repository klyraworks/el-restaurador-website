"use client";
import { useEffect, useState, useCallback } from "react";

interface Usuario {
  id: number;
  telegram_id: string;
  username: string | null;
  nombre: string;
  rol: string;
  is_active: boolean;
  created_at: string;
}

const ROL_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  admin:    { bg:"#10121A", color:"#fff",     border:"#10121A" },
  jefe:     { bg:"#FEF3C7", color:"#92400E",  border:"#FDE68A" },
  mecanico: { bg:"#F4F4F5", color:"#3F3F46",  border:"#E4E4E7" },
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

const DEF = { telegram_id:"", username:"", nombre:"", rol:"mecanico", password:"", is_active: true };

export default function UsuariosPage() {
  const [rows, setRows]         = useState<Usuario[]>([]);
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState<"create"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Usuario|null>(null);
  const [form, setForm]         = useState({ ...DEF });
  const [saving, setSaving]     = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/usuarios");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openCreate() {
    setForm({ ...DEF });
    setSelected(null);
    setModal("create");
  }

  function openEdit(u: Usuario) {
    setSelected(u);
    setForm({ telegram_id: u.telegram_id, username: u.username ?? "", nombre: u.nombre, rol: u.rol, password:"", is_active: u.is_active });
    setModal("edit");
  }

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = { ...form, telegram_id: parseInt(form.telegram_id) };
    if (!body.password) delete body.password;
    if (selected) body.id = selected.id;
    await fetch("/api/admin/usuarios", { method: selected ? "PATCH" : "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    setSaving(false); setModal(null); fetchRows();
  }

  async function handleDelete() {
    setSaving(true);
    const res  = await fetch("/api/admin/usuarios", { method:"DELETE", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id: selected!.id }) });
    const data = await res.json();
    setSaving(false);
    if (data.error) { alert(data.error); return; }
    setModal(null); fetchRows();
  }

  return (
    <div style={{ padding:"32px 28px 60px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h1 style={{ fontSize:"22px", fontWeight:800, color:"#10121A", letterSpacing:"-0.5px" }}>Usuarios</h1>
          <p style={{ fontSize:"13px", color:"#A1A1AA", marginTop:"3px" }}>Mecánicos y administradores del sistema</p>
        </div>
        <button onClick={openCreate} style={S.primary}>+ Nuevo usuario</button>
      </div>

      {/* Tabla */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"14px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #E4E4E7", background:"#FAFAFA" }}>
              {["#","Usuario","Rol","Estado","Fecha",""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", fontSize:"13px", color:"#A1A1AA" }}>Sin usuarios</td></tr>
            ) : rows.map((u, i) => {
              const rol   = ROL_STYLE[u.rol] ?? ROL_STYLE.mecanico;
              const fecha = new Date(u.created_at).toLocaleDateString("es-EC", { day:"2-digit", month:"short", year:"numeric" });
              return (
                <tr key={u.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none" }}>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>#{u.id}</td>
                  <td style={S.td}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#10121A" }}>{u.nombre}</span>
                    <span style={{ display:"block", fontSize:"11px", color:"#A1A1AA", fontFamily:"monospace", marginTop:"2px" }}>
                      {u.telegram_id}{u.username ? ` · @${u.username}` : ""}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ display:"inline-flex", alignItems:"center", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"20px", background:rol.bg, color:rol.color, border:`1px solid ${rol.border}` }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ display:"inline-flex", alignItems:"center", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"20px",
                      background: u.is_active ? "#DCFCE7" : "#F4F4F5",
                      color:      u.is_active ? "#166534" : "#71717A",
                      border:     u.is_active ? "1px solid #BBF7D0" : "1px solid #E4E4E7",
                    }}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize:"11px", fontFamily:"monospace", color:"#A1A1AA" }}>{fecha}</td>
                  <td style={S.td}>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={() => openEdit(u)} style={{ padding:"5px 10px", border:"1px solid #E4E4E7", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#3F3F46", cursor:"pointer", fontFamily:"inherit" }}>Editar</button>
                      <button onClick={() => { setSelected(u); setModal("delete"); }} style={{ padding:"5px 10px", border:"1px solid #FCA5A5", borderRadius:"6px", background:"transparent", fontSize:"11px", color:"#EF4444", cursor:"pointer", fontFamily:"inherit" }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#fff", borderRadius:"14px", width:"100%", maxWidth:"460px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #E4E4E7" }}>
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>{selected ? "Editar usuario" : "Nuevo usuario"}</h2>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <label style={S.label}>Nombre completo</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={S.input} placeholder="Nombre del usuario" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={S.label}>Telegram ID</label>
                  <input type="number" value={form.telegram_id} onChange={e => setForm(f => ({ ...f, telegram_id: e.target.value }))} style={S.input} placeholder="123456789" />
                </div>
                <div>
                  <label style={S.label}>Username</label>
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={S.input} placeholder="@usuario (opcional)" />
                </div>
              </div>
              <div>
                <label style={S.label}>Rol</label>
                <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} style={S.input}>
                  <option value="admin">Admin</option>
                  <option value="jefe">Jefe</option>
                  <option value="mecanico">Mecánico</option>
                </select>
              </div>
              <div>
                <label style={S.label}>{selected ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={S.input} placeholder="••••••••" />
              </div>
              {selected && (
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width:"16px", height:"16px", cursor:"pointer" }} />
                  <label htmlFor="is_active" style={{ fontSize:"13px", color:"#3F3F46", cursor:"pointer" }}>Usuario activo</label>
                </div>
              )}
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
              <h2 style={{ fontSize:"15px", fontWeight:700, color:"#10121A" }}>Eliminar usuario</h2>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <p style={{ fontSize:"13px", color:"#3F3F46", lineHeight:"1.6" }}>
                ¿Eliminar al usuario <strong>{selected.nombre}</strong>? Esta acción no se puede deshacer.
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