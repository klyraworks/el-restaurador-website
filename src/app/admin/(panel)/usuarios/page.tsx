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
  admin:    { bg: "#10121A", color: "#fff",    border: "#10121A"  },
  jefe:     { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A"  },
  mecanico: { bg: "#F4F4F5", color: "#3F3F46", border: "#E4E4E7"  },
};

const S = {
  label:   { display: "block", fontSize: "11px", fontWeight: 600, color: "#3F3F46", marginBottom: "5px", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  input:   { width: "100%", padding: "9px 12px", border: "1px solid #E4E4E7", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", color: "#10121A", outline: "none", background: "#fff", transition: "border-color 0.15s" },
  primary: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "8px", background: "#10121A", fontSize: "13px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  ghost:   { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid #E4E4E7", borderRadius: "8px", background: "transparent", fontSize: "13px", color: "#71717A", cursor: "pointer", fontFamily: "inherit" },
  danger:  { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "8px", background: "#EF4444", fontSize: "13px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  th:      { padding: "10px 16px", textAlign: "left" as const, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#A1A1AA" },
  td:      { padding: "13px 16px" },
};

const DEF = { telegram_id: "", username: "", nombre: "", rol: "mecanico", password: "", is_active: true };

const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false);
  return <input {...props} onFocus={e => { setF(true); props.onFocus?.(e); }} onBlur={e => { setF(false); props.onBlur?.(e); }} style={{ ...S.input, borderColor: f ? "#10121A" : "#E4E4E7", boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", ...props.style }} />;
}

function FocusSelect({ value, onChange, children }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...S.input, appearance: "none", paddingRight: "32px", borderColor: f ? "#10121A" : "#E4E4E7", boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", cursor: "pointer" }}>
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  );
}

// Toggle switch para is_active
function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: "36px", height: "20px", borderRadius: "20px", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0,
          background: checked ? "#10121A" : "#E4E4E7", transition: "background 0.2s",
          display: "flex", alignItems: "center",
        }}
        aria-checked={checked}
        role="switch"
        id={id}
      >
        <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transform: checked ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s" }} />
      </button>
      <label htmlFor={id} style={{ fontSize: "13px", color: "#3F3F46", cursor: "pointer" }}>{label}</label>
    </div>
  );
}

export default function UsuariosPage() {
  const [rows, setRows]         = useState<Usuario[]>([]);
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [form, setForm]         = useState({ ...DEF });
  const [saving, setSaving]     = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openCreate() { setForm({ ...DEF }); setSelected(null); setModal("create"); }
  function openEdit(u: Usuario) {
    setSelected(u);
    setForm({ telegram_id: u.telegram_id, username: u.username ?? "", nombre: u.nombre, rol: u.rol, password: "", is_active: u.is_active });
    setModal("edit");
  }

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = { ...form, telegram_id: parseInt(form.telegram_id) };
    if (!body.password) delete body.password;
    if (selected) body.id = selected.id;
    await fetch("/api/admin/usuarios", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false); setModal(null); fetchRows();
  }

  async function handleDelete() {
    setSaving(true);
    const res  = await fetch("/api/admin/usuarios", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected!.id }) });
    const data = await res.json();
    setSaving(false);
    if (data.error) { alert(data.error); return; }
    setModal(null); fetchRows();
  }

  function initials(nombre: string) {
    return nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  }

  return (
    <>
      <style>{`
        .ra-edit{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;font-size:11px;font-family:inherit;cursor:pointer;font-weight:500;border:1px solid #E4E4E7;background:transparent;color:#71717A;transition:background 0.12s,border-color 0.12s,color 0.12s}
        .ra-edit:hover{background:#F4F4F5;border-color:#D4D4D8;color:#10121A}
        .ra-del{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;font-size:11px;font-family:inherit;cursor:pointer;font-weight:500;border:1px solid #FECDD3;background:transparent;color:#EF4444;transition:background 0.12s,border-color 0.12s}
        .ra-del:hover{background:#FEF2F2;border-color:#FCA5A5}
        .btn-primary:hover:not(:disabled){opacity:0.85}
        .btn-ghost:hover{background:#F4F4F5;border-color:#D4D4D8;color:#3F3F46}
        .btn-danger:hover:not(:disabled){opacity:0.85}
        @keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ padding: "32px 28px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", letterSpacing: "-0.5px" }}>Usuarios</h1>
            <p style={{ fontSize: "13px", color: "#A1A1AA", marginTop: "3px" }}>{rows.length > 0 ? `${rows.length} usuarios registrados` : "Mecánicos y administradores del sistema"}</p>
          </div>
          <button onClick={openCreate} className="btn-primary" style={S.primary}><IconPlus /> Nuevo usuario</button>
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E4E7", background: "#FAFAFA" }}>
                {["#", "Usuario", "Rol", "Estado", "Alta", ""].map(h => <th key={h} style={S.th}>{h}</th>)}
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
                <tr><td colSpan={6} style={{ padding: "56px", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "#A1A1AA", marginBottom: "12px" }}>Sin usuarios registrados</p>
                  <button onClick={openCreate} className="btn-primary" style={{ ...S.primary, fontSize: "12px", padding: "7px 14px" }}><IconPlus /> Crear el primero</button>
                </td></tr>
              ) : rows.map((u, i) => {
                const rol   = ROL_STYLE[u.rol] ?? ROL_STYLE.mecanico;
                const fecha = new Date(u.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
                const isHovered = hoveredRow === u.id;
                return (
                  <tr key={u.id} onMouseEnter={() => setHoveredRow(u.id)} onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none", background: isHovered ? "#FAFAFA" : "#fff", transition: "background 0.12s" }}>
                    <td style={{ ...S.td, fontSize: "11px", fontFamily: "monospace", color: "#C4C4C8" }}>#{u.id}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#10121A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>{initials(u.nombre)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#10121A" }}>{u.nombre}</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace", marginTop: "1px" }}>
                            {u.telegram_id}{u.username ? ` · @${u.username}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", background: rol.bg, color: rol.color, border: `1px solid ${rol.border}` }}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
                        background: u.is_active ? "#DCFCE7" : "#F4F4F5",
                        color:      u.is_active ? "#166534" : "#71717A",
                        border:     u.is_active ? "1px solid #BBF7D0" : "1px solid #E4E4E7",
                      }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: u.is_active ? "#22C55E" : "#A1A1AA", flexShrink: 0 }} />
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: "11px", fontFamily: "monospace", color: "#A1A1AA" }}>{fecha}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "5px", opacity: isHovered ? 1 : 0.5, transition: "opacity 0.15s" }}>
                        <button onClick={() => openEdit(u)} className="ra-edit"><IconEdit /> Editar</button>
                        <button onClick={() => { setSelected(u); setModal("delete"); }} className="ra-del"><IconTrash /> Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "modalIn 0.18s ease" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#10121A" }}>{selected ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", display: "flex", padding: "2px" }}><IconX /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={S.label}>Nombre completo</label>
                <FocusInput value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del usuario" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Telegram ID</label>
                  <FocusInput type="number" value={form.telegram_id} onChange={e => setForm(f => ({ ...f, telegram_id: e.target.value }))} placeholder="123456789" />
                </div>
                <div>
                  <label style={S.label}>Username</label>
                  <FocusInput value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="@usuario (opcional)" />
                </div>
              </div>
              <div>
                <label style={S.label}>Rol</label>
                <FocusSelect value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="jefe">Jefe</option>
                  <option value="mecanico">Mecánico</option>
                </FocusSelect>
              </div>
              <div>
                <label style={S.label}>{selected ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <FocusInput type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              {selected && (
                <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Usuario activo" id="is_active" />
              )}
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E4E4E7", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setModal(null)} className="btn-ghost" style={S.ghost}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ ...S.primary, opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {modal === "delete" && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "380px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "modalIn 0.18s ease" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#10121A" }}>Eliminar usuario</h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", display: "flex", padding: "2px" }}><IconX /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: "1px" }}><IconAlert /></div>
              <p style={{ fontSize: "13px", color: "#3F3F46", lineHeight: "1.65" }}>
                ¿Eliminar al usuario <strong style={{ color: "#10121A" }}>{selected.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E4E4E7", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setModal(null)} className="btn-ghost" style={S.ghost}>Cancelar</button>
              <button onClick={handleDelete} disabled={saving} className="btn-danger" style={{ ...S.danger, opacity: saving ? 0.6 : 1 }}>{saving ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}