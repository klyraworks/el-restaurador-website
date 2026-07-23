"use client";
import {useEffect, useState, useCallback} from "react";

interface Pago {
    id: number;
    monto: string;
    created_at: string;
    servicio_id: number;
    tricimoto_num: string;
    tricimoto_compania: string;
    registrado_por: string;
}

interface Servicio {
    id: number;
    tricimoto_num: string;
    tricimoto_compania: string;
    monto_pendiente: string;
}

const COMPANIAS: Record<string, string> = {"19 de Mayo": "19 de Mayo", "Comtrilamana": "Comtrilamana", "Quilotoa": "Quilotoa", "Patria Vuelve": "Patria Vuelve", "Taxsancar": "Taxsancar", "Transtrival":"Transtrival"};
const COLORES_DOT: Record<string, string> = {"19 de Mayo": "#EF4444", "Comtrilamana": "#22C55E", "Quilotoa": "#EAB308", "Patria Vuelve": "#3B82F6", "Taxsancar": "#EF4444", "Transtrival": "#EF4444"};

const S = {
    label: {
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        color: "#3F3F46",
        marginBottom: "5px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em"
    },
    input: {
        width: "100%",
        padding: "9px 12px",
        border: "1px solid #E4E4E7",
        borderRadius: "8px",
        fontSize: "13px",
        fontFamily: "inherit",
        color: "#10121A",
        outline: "none",
        background: "#fff",
        transition: "border-color 0.15s"
    },
    primary: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#10121A",
        fontSize: "13px",
        color: "#fff",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 600
    },
    ghost: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        border: "1px solid #E4E4E7",
        borderRadius: "8px",
        background: "transparent",
        fontSize: "13px",
        color: "#71717A",
        cursor: "pointer",
        fontFamily: "inherit"
    },
    danger: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#EF4444",
        fontSize: "13px",
        color: "#fff",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 600
    },
    th: {
        padding: "10px 16px",
        textAlign: "left" as const,
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.07em",
        color: "#A1A1AA"
    },
    td: {padding: "13px 16px"},
};

const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);
const IconTrash = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
    </svg>
);
const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
const IconChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);
const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <input {...props}
               onFocus={e => {
                   setFocused(true);
                   props.onFocus?.(e);
               }}
               onBlur={e => {
                   setFocused(false);
                   props.onBlur?.(e);
               }}
               style={{
                   ...S.input,
                   borderColor: focused ? "#10121A" : "#E4E4E7",
                   boxShadow: focused ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", ...props.style
               }}
        />
    );
}

function Select({value, onChange, children}: {value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode}) {
    const [focused, setFocused] = useState(false);
    return (
        <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{...S.input, appearance: "none", borderColor: focused ? "#10121A" : "#E4E4E7", boxShadow: focused ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", cursor: "pointer"}}>
            {children}
        </select>
    );
}

export default function PagosPage() {
    const [rows, setRows] = useState<Pago[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<"create" | "delete" | null>(null);
    const [selected, setSelected] = useState<Pago | null>(null);
    const [form, setForm] = useState({servicio_id: "", monto: ""});
    const [saving, setSaving] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [pagoModal, setPagoModal] = useState(false);
    const [pendientes, setPendientes] = useState<Servicio[]>([]);
    const [pagoForm, setPagoForm] = useState({ servicio_id: "", monto: "" });
    const [selectedPago, setSelectedPago] = useState<Servicio | null>(null);

    const limit = 20;
    const totalPages = Math.ceil(total / limit);

    const fetchRows = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/pagos?page=${page}`);
        const data = await res.json();
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
    }, [page]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    async function handleCreate() {
        setSaving(true);
        await fetch("/api/admin/pagos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({servicio_id: parseInt(form.servicio_id), monto: parseFloat(form.monto)})
        });
        setSaving(false);
        setModal(null);
        setForm({servicio_id: "", monto: ""});
        fetchRows();
    }

    async function handleDelete() {
        setSaving(true);
        await fetch("/api/admin/pagos", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: selected!.id})
        });
        setSaving(false);
        setModal(null);
        fetchRows();
    }

    useEffect(() => {
      if (pagoModal) {
        fetch("/api/admin/servicios?estado=pendiente&limit=100")
          .then(r => r.json())
          .then(d => setPendientes((d.rows ?? []).filter((s: Servicio) => Number(s.monto_pendiente) > 0)));
      }
    }, [pagoModal]);

    function openPago() {
      setPagoForm({ servicio_id: "", monto: "" });
      setSelectedPago(null);
      setPagoModal(true);
    }

    function handleServicioSelect(id: string) {
      const s = pendientes.find(p => String(p.id) === id) ?? null;
      setSelectedPago(s);
      setPagoForm({ servicio_id: id, monto: "" });
    }

    async function handlePago(montoOverride?: number) {
      const monto = montoOverride ?? parseFloat(pagoForm.monto);
      if (!pagoForm.servicio_id || isNaN(monto) || monto <= 0) {
        alert("Completa los campos requeridos.");
        return;
      }
      setSaving(true);
      const res = await fetch("/api/admin/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicio_id: parseInt(pagoForm.servicio_id), monto }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Error al guardar");
        setSaving(false);
        return;
      }
      setSaving(false);
      setPagoModal(false);
      fetchRows();
    }

    return (
        <>
            <style>{`
                .row-action-delete { display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;font-size:11px;font-family:inherit;cursor:pointer;font-weight:500;border:1px solid #FECDD3;background:transparent;color:#EF4444;transition:background 0.12s,border-color 0.12s; }
                .row-action-delete:hover { background:#FEF2F2;border-color:#FCA5A5; }
                .btn-primary:hover:not(:disabled){opacity:0.85}
                .btn-ghost:hover{background:#F4F4F5;border-color:#D4D4D8;color:#3F3F46}
                .btn-danger:hover:not(:disabled){opacity:0.85}
                .pagination-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid #E4E4E7;border-radius:7px;background:transparent;font-size:12px;color:#3F3F46;cursor:pointer;font-family:inherit;transition:background 0.12s;}
                .pagination-btn:hover:not(:disabled){background:#F4F4F5}
                .pagination-btn:disabled{opacity:0.35;cursor:not-allowed}
                @keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
              `}</style>

            <div style={{padding: "32px 28px 60px"}}>

                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "24px"
                }}>
                    <div>
                        <h1 style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#10121A",
                            letterSpacing: "-0.5px"
                        }}>Pagos</h1>
                        <p style={{fontSize: "13px", color: "#A1A1AA", marginTop: "3px"}}>
                            {total > 0 ? `${total} cobros registrados` : "Historial de cobros registrados"}
                        </p>
                    </div>
                    <button onClick={openPago} className="btn-primary" style={S.primary}>
                      <IconPlus/> Registrar pago
                    </button>
                </div>

                {/* Tabla */}
                <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
                    <div style={{overflowX: "auto", WebkitOverflowScrolling: "touch"}}>
                        <table style={{width: "100%", borderCollapse: "collapse"}}>
                            <thead>
                            <tr style={{borderBottom: "1px solid #E4E4E7", background: "#FAFAFA"}}>
                                {["#", "Servicio", "Monto", "Registrado por", "Fecha", ""].map(h => (
                                    <th key={h} style={S.th}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{padding: "48px", textAlign: "center"}}>
                                        <div style={{
                                            display: "inline-flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8"
                                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                 style={{animation: "spin 1s linear infinite"}}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                            <span style={{fontSize: "13px", color: "#A1A1AA"}}>Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{padding: "56px", textAlign: "center"}}>
                                        <p style={{fontSize: "13px", color: "#A1A1AA", marginBottom: "12px"}}>Sin pagos
                                            registrados</p>
                                        <button onClick={() => {
                                            setForm({servicio_id: "", monto: ""});
                                            setModal("create");
                                        }} className="btn-primary"
                                                style={{...S.primary, fontSize: "12px", padding: "7px 14px"}}>
                                            <IconPlus/> Registrar el primero
                                        </button>
                                    </td>
                                </tr>
                            ) : rows.map((p, i) => {
                                const fecha = new Date(p.created_at).toLocaleDateString("es-EC", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                });
                                const isHovered = hoveredRow === p.id;
                                return (
                                    <tr key={p.id}
                                        onMouseEnter={() => setHoveredRow(p.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none",
                                            background: isHovered ? "#FAFAFA" : "#fff",
                                            transition: "background 0.12s"
                                        }}
                                    >
                                        <td style={{
                                            ...S.td,
                                            fontSize: "11px",
                                            fontFamily: "monospace",
                                            color: "#C4C4C8"
                                        }}>#{p.id}</td>
                                        <td style={S.td}>
                                            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                                            <span style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                flexShrink: 0,
                                                background: COLORES_DOT[p.tricimoto_compania] ?? "#A1A1AA",
                                                boxShadow: `0 0 0 2px ${(COLORES_DOT[p.tricimoto_compania] ?? "#A1A1AA")}30`
                                            }}/>
                                                <div>
                                                <span style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#10121A"
                                                }}>#{p.servicio_id} · {p.tricimoto_num}</span>
                                                    <span style={{
                                                        display: "block",
                                                        fontSize: "11px",
                                                        color: "#A1A1AA"
                                                    }}>{COMPANIAS[p.tricimoto_compania] ?? p.tricimoto_compania}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            color: "#10121A",
                                            fontFamily: "monospace"
                                        }}>
                                            ${Number(p.monto).toFixed(2)}
                                        </td>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "13px",
                                            color: "#3F3F46"
                                        }}>{p.registrado_por}</td>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "11px",
                                            fontFamily: "monospace",
                                            color: "#A1A1AA"
                                        }}>{fecha}</td>
                                        <td style={S.td}>
                                            <div style={{opacity: isHovered ? 1 : 0.5, transition: "opacity 0.15s"}}>
                                                <button onClick={() => {
                                                    setSelected(p);
                                                    setModal("delete");
                                                }} className="row-action-delete">
                                                    <IconTrash/> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div style={{
                            padding: "12px 16px",
                            borderTop: "1px solid #E4E4E7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <span style={{
                                fontSize: "12px",
                                color: "#A1A1AA"
                            }}>{total} registros · página {page} de {totalPages}</span>
                            <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
                                <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}><IconChevronLeft/> Anterior
                                </button>
                                <button className="pagination-btn"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}>Siguiente <IconChevronRight/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal crear */}
            {modal === "create" && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    backdropFilter: "blur(2px)"
                }}
                     onClick={e => {
                         if (e.target === e.currentTarget) setModal(null);
                     }}>
                    <div style={{
                        background: "#fff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "380px",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                        animation: "modalIn 0.18s ease"
                    }}>
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #E4E4E7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <h2 style={{fontSize: "15px", fontWeight: 700, color: "#10121A"}}>Registrar pago</h2>
                            <button onClick={() => setModal(null)} style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#A1A1AA",
                                display: "flex",
                                padding: "2px"
                            }}><IconX/></button>
                        </div>
                        <div style={{padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
                            <div>
                                <label style={S.label}>ID del servicio</label>
                                <FocusInput type="number" value={form.servicio_id} onChange={e => setForm(f => ({...f, servicio_id: e.target.value}))} placeholder="Ej: 42"/>
                            </div>
                            <div>
                                <label style={S.label}>Monto</label>
                                <FocusInput
                                    type="number" step="0.01"
                                    placeholder={`Máx. ${Number(selectedPago?.monto_pendiente).toFixed(2)}`}
                                    value={pagoForm.monto}
                                    onChange={e => setPagoForm(p => ({...p, monto: e.target.value}))}
                                />
                            </div>
                        </div>
                        <div style={{
                            padding: "16px 24px",
                            borderTop: "1px solid #E4E4E7",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px"
                        }}>
                            <button onClick={() => setModal(null)} className="btn-ghost" style={S.ghost}>Cancelar
                            </button>
                            <button onClick={handleCreate} disabled={saving} className="btn-primary"
                                    style={{...S.primary, opacity: saving ? 0.6 : 1}}>
                                {saving ? "Guardando..." : "Registrar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal eliminar */}
            {modal === "delete" && selected && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    backdropFilter: "blur(2px)"
                }}
                     onClick={e => {
                         if (e.target === e.currentTarget) setModal(null);
                     }}>
                    <div style={{
                        background: "#fff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "380px",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                        animation: "modalIn 0.18s ease"
                    }}>
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #E4E4E7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <h2 style={{fontSize: "15px", fontWeight: 700, color: "#10121A"}}>Eliminar pago</h2>
                            <button onClick={() => setModal(null)} style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#A1A1AA",
                                display: "flex",
                                padding: "2px"
                            }}><IconX/></button>
                        </div>
                        <div style={{padding: "20px 24px", display: "flex", gap: "14px", alignItems: "flex-start"}}>
                            <div style={{flexShrink: 0, marginTop: "1px"}}><IconAlertTriangle/></div>
                            <p style={{fontSize: "13px", color: "#3F3F46", lineHeight: "1.65"}}>
                                ¿Eliminar el pago de <strong
                                style={{color: "#10121A"}}>${Number(selected.monto).toFixed(2)}</strong> del
                                servicio <strong style={{color: "#10121A"}}>#{selected.servicio_id}</strong>? Esta
                                acción no se puede deshacer.
                            </p>
                        </div>
                        <div style={{
                            padding: "16px 24px",
                            borderTop: "1px solid #E4E4E7",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px"
                        }}>
                            <button onClick={() => setModal(null)} className="btn-ghost" style={S.ghost}>Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={saving} className="btn-danger"
                                    style={{...S.danger, opacity: saving ? 0.6 : 1}}>
                                {saving ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {pagoModal && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(2px)"}}
                   onClick={e => { if (e.target === e.currentTarget) setPagoModal(false); }}>
                <div style={{background:"#fff",borderRadius:"16px",width:"100%",maxWidth:"420px",boxShadow:"0 24px 64px rgba(0,0,0,0.18)",animation:"modalIn 0.18s ease"}}>
                  <div style={{padding:"20px 24px",borderBottom:"1px solid #E4E4E7",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <h2 style={{fontSize:"15px",fontWeight:700,color:"#10121A"}}>Registrar pago</h2>
                    <button onClick={() => setPagoModal(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#A1A1AA",display:"flex",padding:"2px"}}><IconX/></button>
                  </div>
                  <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"14px"}}>
                    <div>
                      <label style={S.label}>Servicio pendiente</label>
                      <Select value={pagoForm.servicio_id} onChange={e => handleServicioSelect(e.target.value)}>
                        <option value="">Seleccionar servicio</option>
                        {pendientes.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.tricimoto_num} - {COMPANIAS[s.tricimoto_compania] ?? s.tricimoto_compania} · Debe ${Number(s.monto_pendiente).toFixed(2)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {selectedPago && (
                      <>
                        <div>
                          <label style={S.label}>Monto del pago</label>
                          <FocusInput
                            type="number" step="0.01"
                            placeholder={`Máx. ${Number(selectedPago.monto_pendiente).toFixed(2)}`}
                            value={pagoForm.monto}
                            onChange={e => setPagoForm(p => ({...p, monto: e.target.value}))}
                          />
                        </div>
                        <button
                          onClick={() => handlePago(Number(selectedPago.monto_pendiente))}
                          className="btn-ghost" style={{...S.ghost, justifyContent:"center"}}
                        >
                          Pagar total (${Number(selectedPago.monto_pendiente).toFixed(2)})
                        </button>
                      </>
                    )}
                  </div>
                  <div style={{padding:"16px 24px",borderTop:"1px solid #E4E4E7",display:"flex",justifyContent:"flex-end",gap:"8px"}}>
                    <button onClick={() => setPagoModal(false)} className="btn-ghost" style={S.ghost}>Cancelar</button>
                    <button onClick={() => handlePago()} disabled={saving || !selectedPago} className="btn-primary" style={{...S.primary, opacity: saving?0.6:1}}>
                      {saving ? "Guardando..." : "Registrar pago"}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </>
    );
}