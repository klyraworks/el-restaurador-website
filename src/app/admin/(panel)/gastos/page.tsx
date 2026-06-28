"use client";
import {useEffect, useState, useCallback} from "react";

interface Gasto {
    id: number;
    tipo: string;
    monto: string;
    descripcion: string | null;
    created_at: string;
    registrado_por: string;
}

const TIPO_STYLE: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
    gasto: {bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5", label: "Gasto", dot: "#EF4444"},
    adelanto: {bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE", label: "Adelanto", dot: "#3B82F6"},
};

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

const DEF = {tipo: "gasto", monto: "", descripcion: ""};

const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
</svg>;
const IconEdit = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>;
const IconTrash = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
</svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
</svg>;
const IconFilter = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
</svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
</svg>;
const IconChevronLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
</svg>;
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
</svg>;

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [f, setF] = useState(false);
    return <input {...props} onFocus={e => {
        setF(true);
        props.onFocus?.(e);
    }} onBlur={e => {
        setF(false);
        props.onBlur?.(e);
    }} style={{
        ...S.input,
        borderColor: f ? "#10121A" : "#E4E4E7",
        boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", ...props.style
    }}/>;
}

function FocusSelect({value, onChange, children}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode
}) {
    const [f, setF] = useState(false);
    return (
        <div style={{position: "relative"}}>
            <select value={value} onChange={onChange} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{
                ...S.input,
                appearance: "none",
                paddingRight: "32px",
                borderColor: f ? "#10121A" : "#E4E4E7",
                boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none",
                cursor: "pointer"
            }}>
                {children}
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none"
            }}>
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </div>
    );
}

function FocusTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const [f, setF] = useState(false);
    return <textarea {...props} onFocus={e => {
        setF(true);
        props.onFocus?.(e);
    }} onBlur={e => {
        setF(false);
        props.onBlur?.(e);
    }} style={{
        ...S.input,
        resize: "vertical",
        borderColor: f ? "#10121A" : "#E4E4E7",
        boxShadow: f ? "0 0 0 3px rgba(16,18,26,0.08)" : "none", ...props.style
    }}/>;
}

export default function GastosPage() {
    const [rows, setRows] = useState<Gasto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
    const [selected, setSelected] = useState<Gasto | null>(null);
    const [form, setForm] = useState({...DEF});
    const [saving, setSaving] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const limit = 20;
    const totalPages = Math.ceil(total / limit);

    const fetchRows = useCallback(async () => {
        setLoading(true);
        const p = new URLSearchParams({page: String(page)});
        if (filtroTipo) p.set("tipo", filtroTipo);
        const res = await fetch(`/api/admin/gastos?${p}`);
        const data = await res.json();
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
    }, [page, filtroTipo]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    function openEdit(g: Gasto) {
        setSelected(g);
        setForm({tipo: g.tipo, monto: g.monto, descripcion: g.descripcion ?? ""});
        setModal("edit");
    }

    async function handleSave() {
        setSaving(true);
        const body = {...form, monto: parseFloat(form.monto), ...(selected ? {id: selected.id} : {})};
        await fetch("/api/admin/gastos", {
            method: selected ? "PATCH" : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        setSaving(false);
        setModal(null);
        fetchRows();
    }

    async function handleDelete() {
        setSaving(true);
        await fetch("/api/admin/gastos", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: selected!.id})
        });
        setSaving(false);
        setModal(null);
        fetchRows();
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
              .pg-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid #E4E4E7;border-radius:7px;background:transparent;font-size:12px;color:#3F3F46;cursor:pointer;font-family:inherit;transition:background 0.12s}
              .pg-btn:hover:not(:disabled){background:#F4F4F5}
              .pg-btn:disabled{opacity:0.35;cursor:not-allowed}
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
                        }}>Gastos</h1>
                        <p style={{
                            fontSize: "13px",
                            color: "#A1A1AA",
                            marginTop: "3px"
                        }}>{total > 0 ? `${total} registros` : "Gastos y adelantos del taller"}</p>
                    </div>
                    <button onClick={() => {
                        setForm({...DEF});
                        setSelected(null);
                        setModal("create");
                    }} className="btn-primary" style={S.primary}>
                        <IconPlus/> Nuevo gasto
                    </button>
                </div>

                {/* Filtro */}
                <div style={{display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center"}}>
                    <span style={{color: "#A1A1AA"}}><IconFilter/></span>
                    <div style={{width: "160px"}}>
                        <FocusSelect value={filtroTipo} onChange={e => {
                            setFiltroTipo(e.target.value);
                            setPage(1);
                        }}>
                            <option value="">Todos los tipos</option>
                            <option value="gasto">Gasto</option>
                            <option value="adelanto">Adelanto</option>
                        </FocusSelect>
                    </div>
                    {filtroTipo && (
                        <button className="btn-ghost" onClick={() => {
                            setFiltroTipo("");
                            setPage(1);
                        }} style={{...S.ghost, padding: "7px 12px", fontSize: "12px"}}>
                            <IconX/> Limpiar
                        </button>
                    )}
                </div>

                {/* Tabla */}
                <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
                    <div style={{overflowX: "auto", WebkitOverflowScrolling: "touch"}}>
                        <table style={{width: "100%", borderCollapse: "collapse"}}>
                            <thead>
                            <tr style={{borderBottom: "1px solid #E4E4E7", background: "#FAFAFA"}}>
                                {["#", "Tipo", "Monto / Descripción", "Registrado por", "Fecha", ""].map(h => <th
                                    key={h} style={S.th}>{h}</th>)}
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
                                        <p style={{fontSize: "13px", color: "#A1A1AA", marginBottom: "12px"}}>Sin gastos
                                            registrados</p>
                                        <button onClick={() => {
                                            setForm({...DEF});
                                            setSelected(null);
                                            setModal("create");
                                        }} className="btn-primary"
                                                style={{...S.primary, fontSize: "12px", padding: "7px 14px"}}>
                                            <IconPlus/> Registrar el primero
                                        </button>
                                    </td>
                                </tr>
                            ) : rows.map((g, i) => {
                                const t = TIPO_STYLE[g.tipo] ?? TIPO_STYLE.gasto;
                                const fecha = new Date(g.created_at).toLocaleDateString("es-EC", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                });
                                const isHovered = hoveredRow === g.id;
                                return (
                                    <tr key={g.id} onMouseEnter={() => setHoveredRow(g.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none",
                                            background: isHovered ? "#FAFAFA" : "#fff",
                                            transition: "background 0.12s"
                                        }}>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "11px",
                                            fontFamily: "monospace",
                                            color: "#C4C4C8"
                                        }}>#{g.id}</td>
                                        <td style={S.td}>
                      <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: "20px",
                          background: t.bg,
                          color: t.color,
                          border: `1px solid ${t.border}`
                      }}>
                        <span style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: t.dot,
                            flexShrink: 0
                        }}/>
                          {t.label}
                      </span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                color: "#10121A",
                                                fontFamily: "monospace"
                                            }}>${Number(g.monto).toFixed(2)}</span>
                                            {g.descripcion && <span style={{
                                                display: "block",
                                                fontSize: "11px",
                                                color: "#A1A1AA",
                                                marginTop: "2px"
                                            }}>{g.descripcion}</span>}
                                        </td>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "13px",
                                            color: "#3F3F46"
                                        }}>{g.registrado_por}</td>
                                        <td style={{
                                            ...S.td,
                                            fontSize: "11px",
                                            fontFamily: "monospace",
                                            color: "#A1A1AA"
                                        }}>{fecha}</td>
                                        <td style={S.td}>
                                            <div style={{
                                                display: "flex",
                                                gap: "5px",
                                                opacity: isHovered ? 1 : 0.5,
                                                transition: "opacity 0.15s"
                                            }}>
                                                <button onClick={() => openEdit(g)} className="ra-edit">
                                                    <IconEdit/> Editar
                                                </button>
                                                <button onClick={() => {
                                                    setSelected(g);
                                                    setModal("delete");
                                                }} className="ra-del"><IconTrash/> Eliminar
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
                            <div style={{display: "flex", gap: "6px"}}>
                                <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}><IconChevronLeft/> Anterior
                                </button>
                                <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}>Siguiente <IconChevronRight/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal crear/editar */}
            {(modal === "create" || modal === "edit") && (
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
                        maxWidth: "400px",
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
                            <h2 style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#10121A"
                            }}>{selected ? "Editar gasto" : "Nuevo gasto"}</h2>
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
                                <label style={S.label}>Tipo</label>
                                <FocusSelect value={form.tipo}
                                             onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
                                    <option value="gasto">Gasto</option>
                                    <option value="adelanto">Adelanto</option>
                                </FocusSelect>
                            </div>
                            <div>
                                <label style={S.label}>Monto</label>
                                <FocusInput type="number" step="0.01" value={form.monto}
                                            onChange={e => setForm(f => ({...f, monto: e.target.value}))}
                                            placeholder="0.00"/>
                            </div>
                            <div>
                                <label style={S.label}>Descripción</label>
                                <FocusTextarea value={form.descripcion}
                                               onChange={e => setForm(f => ({...f, descripcion: e.target.value}))}
                                               rows={3} placeholder="Descripción opcional..."/>
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
                            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{
                                ...S.primary,
                                opacity: saving ? 0.6 : 1
                            }}>{saving ? "Guardando..." : "Guardar"}</button>
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
                            <h2 style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#10121A"
                            }}>Eliminar {TIPO_STYLE[selected.tipo]?.label.toLowerCase()}</h2>
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
                            <div style={{flexShrink: 0, marginTop: "1px"}}><IconAlert/></div>
                            <p style={{fontSize: "13px", color: "#3F3F46", lineHeight: "1.65"}}>
                                ¿Eliminar este {TIPO_STYLE[selected.tipo]?.label.toLowerCase()} de <strong
                                style={{color: "#10121A"}}>${Number(selected.monto).toFixed(2)}</strong>? Esta acción no
                                se puede deshacer.
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
                            <button onClick={handleDelete} disabled={saving} className="btn-danger" style={{
                                ...S.danger,
                                opacity: saving ? 0.6 : 1
                            }}>{saving ? "Eliminando..." : "Eliminar"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}