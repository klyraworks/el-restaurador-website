"use client";
import {useEffect, useState, useCallback} from "react";

interface Servicio {
    id: number;
    tricimoto_num: string;
    tricimoto_compania: string;
    descripcion: string | null;
    monto_total: string;
    monto_pendiente: string;
    estado: string;
    created_at: string;
    mecanico: string;
    mecanico_id: number;
}

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

const ESTADOS = ["pendiente", "pagado", "anulado"];
const COMPANIAS: Record<string, string> = {"19 de Mayo": "19 de Mayo", "Comtrilamana": "Comtrilamana", "Quilotoa": "Quilotoa", "Patria Vuelve": "Patria Vuelve", "Taxsancar": "Taxsancar", "Transtrival":"Transtrival"};
const COLORES_DOT: Record<string, string> = {"19 de Mayo": "#EF4444", "Comtrilamana": "#22C55E", "Quilotoa": "#EAB308", "Patria Vuelve": "#3B82F6", "Taxsancar": "#EF4444", "Transtrival": "#EF4444"};


const EST: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
    pagado: {bg: "#DCFCE7", color: "#166534", border: "#BBF7D0", label: "Pagado", dot: "#22C55E"},
    pendiente: {bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", label: "Pendiente", dot: "#F59E0B"},
    anulado: {bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7", label: "Anulado", dot: "#A1A1AA"},
};

// const COLORES_DOT: Record<string, string> = {
//     roja: "#EF4444", azul: "#3B82F6", verde: "#22C55E", amarilla: "#EAB308",
// };

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
        fontWeight: 600,
        transition: "opacity 0.15s"
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
        fontFamily: "inherit",
        transition: "background 0.15s, border-color 0.15s"
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
        fontWeight: 600,
        transition: "opacity 0.15s"
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

const DEF = {
    tricimoto_num: "",
    tricimoto_compania: "19 de Mayo",
    descripcion: "",
    monto_total: "",
    monto_pendiente: "",
    mecanico_id: "",
    estado: "pendiente"
};

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);
const IconEdit = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
const IconFilter = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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
const IconAlertTriangle = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

// ── Componente Select custom (wrapper con focus ring) ──────────────────────────
function Select({value, onChange, children, style, disabled}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    style?: React.CSSProperties
    disabled?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{position: "relative"}}>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    ...S.input,
                    appearance: "none",
                    paddingRight: "32px",
                    borderColor: focused ? "#10121A" : "#E4E4E7",
                    boxShadow: focused ? "0 0 0 3px rgba(16,18,26,0.08)" : "none",
                    cursor: "pointer",
                    ...style,
                }}
            >
                {children}
            </select>
            <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none"
                }}
            >
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </div>
    );
}

// ── Input con focus ring ───────────────────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
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
                boxShadow: focused ? "0 0 0 3px rgba(16,18,26,0.08)" : "none",
                ...props.style,
            }}
        />
    );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            {...props}
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
                resize: "vertical",
                borderColor: focused ? "#10121A" : "#E4E4E7",
                boxShadow: focused ? "0 0 0 3px rgba(16,18,26,0.08)" : "none",
                ...props.style,
            }}
        />
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ServiciosPage() {
    const [rows, setRows] = useState<Servicio[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroColor, setFiltroColor] = useState("");
    const [filtroNumero, setFiltroNumero] = useState("");
    const [unidades, setUnidades] = useState<string[]>([]);
    const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
    const [selected, setSelected] = useState<Servicio | null>(null);
    const [mecanicos, setMecanicos] = useState<Usuario[]>([]);
    const [form, setForm] = useState({...DEF});
    const [saving, setSaving] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [filtroFecha, setFiltroFecha] = useState("");
    const [filtroDesde, setFiltroDesde] = useState("");
    const [filtroHasta, setFiltroHasta] = useState("");

    const limit = 20;
    const totalPages = Math.ceil(total / limit);

    const fetchRows = useCallback(async () => {
        setLoading(true);
        const p = new URLSearchParams({page: String(page)});
        if (filtroEstado) p.set("estado", filtroEstado);
        if (filtroColor) p.set("color", filtroColor);
        if (filtroNumero) p.set("numero", filtroNumero);
        if (filtroFecha) {
            p.set("fecha", filtroFecha);
        } else {
            if (filtroDesde) p.set("desde", filtroDesde);
            if (filtroHasta) p.set("hasta", filtroHasta);
        }
        const res = await fetch(`/api/admin/servicios?${p}`);
        const data = await res.json();
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
    }, [page, filtroEstado, filtroColor, filtroNumero, filtroFecha, filtroDesde, filtroHasta]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    useEffect(() => {
        if (modal === "create" || modal === "edit") {
            fetch("/api/admin/usuarios").then(r => r.json()).then(d => setMecanicos(d.rows ?? []));
        }
    }, [modal]);

    useEffect(() => {
        if (!filtroColor) {
            setUnidades([]);
            setFiltroNumero("");
            return;
        }
        fetch(`/api/admin/unidades?compania=${encodeURIComponent(filtroColor)}`)
            .then(r => r.json())
            .then(d => setUnidades(d.rows ?? []));
        setFiltroNumero("");
    }, [filtroColor]);

    function openCreate() {
        setForm({...DEF});
        setSelected(null);
        setModal("create");
    }

    function openEdit(s: Servicio) {
        setSelected(s);
        setForm({
            tricimoto_num: s.tricimoto_num,
            tricimoto_compania: s.tricimoto_compania,
            descripcion: s.descripcion ?? "",
            monto_total: s.monto_total,
            monto_pendiente: s.monto_pendiente,
            mecanico_id: String(s.mecanico_id),
            estado: s.estado
        });
        setModal("edit");
    }

    async function handleSave() {
        setSaving(true);
        const monto_total = parseFloat(form.monto_total);
        const monto_pendiente = parseFloat(form.monto_pendiente || "0");
        const mecanico_id = parseInt(form.mecanico_id);

        if (!form.tricimoto_num || !form.tricimoto_compania || isNaN(monto_total) || !mecanico_id) {
            alert("Completa los campos requeridos.");
            setSaving(false);
            return;
        }

        const body = {
            ...form,
            monto_total,
            monto_pendiente: isNaN(monto_pendiente) ? 0 : monto_pendiente,
            mecanico_id,
            ...(selected ? {id: selected.id} : {}),
        };

        const res = await fetch("/api/admin/servicios", {
            method: selected ? "PATCH" : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.error ?? "Error al guardar");
            setSaving(false);
            return;
        }

        setSaving(false);
        setModal(null);
        fetchRows();
    }

    async function handleDelete() {
        setSaving(true);
        await fetch("/api/admin/servicios", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: selected!.id})
        });
        setSaving(false);
        setModal(null);
        fetchRows();
    }

    function field(key: keyof typeof form) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                setForm(prev => ({...prev, [key]: e.target.value})),
        };
    }

    return (
        <>
            <style>{`
        .row-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 6px; font-size: 11px;
          font-family: inherit; cursor: pointer; font-weight: 500;
          transition: background 0.12s, border-color 0.12s, color 0.12s;
        }
        .row-action-edit {
          border: 1px solid #E4E4E7; background: transparent; color: #71717A;
        }
        .row-action-edit:hover { background: #F4F4F5; border-color: #D4D4D8; color: #10121A; }
        .row-action-delete {
          border: 1px solid #FECDD3; background: transparent; color: #EF4444;
        }
        .row-action-delete:hover { background: #FEF2F2; border-color: #FCA5A5; }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-ghost:hover { background: #F4F4F5; border-color: #D4D4D8; color: #3F3F46; }
        .btn-danger:hover:not(:disabled) { opacity: 0.85; }
        .filter-select-wrap { position: relative; }
        .pagination-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 10px; border: 1px solid #E4E4E7; border-radius: 7px;
          background: transparent; font-size: 12px; color: #3F3F46;
          cursor: pointer; font-family: inherit; transition: background 0.12s;
        }
        .pagination-btn:hover:not(:disabled) { background: #F4F4F5; }
        .pagination-btn:disabled { opacity: 0.35; cursor: not-allowed; }
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
                        }}>Servicios</h1>
                        <p style={{fontSize: "13px", color: "#A1A1AA", marginTop: "3px"}}>
                            {total > 0 ? `${total} órdenes registradas` : "Gestión de órdenes de servicio"}
                        </p>
                    </div>
                    <button onClick={openCreate} className="btn-primary" style={S.primary}>
                        <IconPlus/> Nuevo servicio
                    </button>
                </div>

                {/* Filtros */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
                    <Select value={filtroEstado} onChange={e => {
                        setFiltroEstado(e.target.value);
                        setPage(1);
                    }} style={{width: "160px"}}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e} value={e}>{EST[e]?.label ?? e}</option>)}
                    </Select>
                    <Select value={filtroColor} onChange={e => {
                        setFiltroColor(e.target.value);
                        setPage(1);
                    }} style={{width: "160px"}}>
                        <option value="">Todas las compañias</option>
                        {Object.entries(COMPANIAS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Select>
                    <Select value={filtroNumero} onChange={e => {
                        setFiltroNumero(e.target.value);
                        setPage(1);
                    }}
                            style={{width: "160px"}} disabled={!filtroColor}>
                        <option value="">Todas las unidades</option>
                        {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                    </Select>
                    <Input
                        type="date"
                        value={filtroFecha}
                        onChange={e => {
                            setFiltroFecha(e.target.value);
                            setFiltroDesde("");
                            setFiltroHasta("");
                            setPage(1);
                        }}
                        style={{width: "150px"}}
                    />
                    <span style={{fontSize: "12px", color: "#A1A1AA"}}>o rango:</span>
                    <Input
                        type="date"
                        value={filtroDesde}
                        disabled={!!filtroFecha}
                        onChange={e => {
                            setFiltroDesde(e.target.value);
                            setFiltroFecha("");
                            setPage(1);
                        }}
                        style={{width: "150px"}}
                    />
                    <Input
                        type="date"
                        value={filtroHasta}
                        disabled={!!filtroFecha}
                        onChange={e => {
                            setFiltroHasta(e.target.value);
                            setFiltroFecha("");
                            setPage(1);
                        }}
                        style={{width: "150px"}}
                    />
                    {(filtroEstado || filtroColor || filtroNumero || filtroFecha || filtroDesde || filtroHasta) && (
                        <button className="btn-ghost" onClick={() => {
                            setFiltroEstado("");
                            setFiltroColor("");
                            setFiltroNumero("");
                            setFiltroFecha("");
                            setFiltroDesde("");
                            setFiltroHasta("");
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
                            {["#", "Tricimoto", "Descripción", "Montos", "Estado", "Fecha", ""].map(h => (
                                <th key={h} style={S.th}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{padding: "48px", textAlign: "center"}}>
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
                                <td colSpan={7} style={{padding: "56px", textAlign: "center"}}>
                                    <p style={{fontSize: "13px", color: "#A1A1AA", marginBottom: "12px"}}>No hay
                                        servicios registrados</p>
                                    <button onClick={openCreate}
                                            style={{...S.primary, fontSize: "12px", padding: "7px 14px"}}
                                            className="btn-primary">
                                        <IconPlus/> Crear el primero
                                    </button>
                                </td>
                            </tr>
                        ) : rows.map((s, i) => {
                            const est = EST[s.estado] ?? EST.anulado;
                            const fecha = new Date(s.created_at).toLocaleDateString("es-EC", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            });
                            const isHovered = hoveredRow === s.id;
                            return (
                                <tr
                                    key={s.id}
                                    onMouseEnter={() => setHoveredRow(s.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{
                                        borderBottom: i < rows.length - 1 ? "1px solid #F4F4F5" : "none",
                                        background: isHovered ? "#FAFAFA" : "#fff",
                                        transition: "background 0.12s",
                                    }}
                                >
                                    <td style={{
                                        ...S.td,
                                        fontSize: "11px",
                                        fontFamily: "monospace",
                                        color: "#C4C4C8"
                                    }}>#{s.id}</td>
                                    <td style={S.td}>
                                        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <span style={{
                            width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                            background: COLORES_DOT[s.tricimoto_compania] ?? "#A1A1AA",
                            boxShadow: `0 0 0 2px ${(COLORES_DOT[s.tricimoto_compania] ?? "#A1A1AA")}30`,
                        }}/>
                                            <div>
                                                <span style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#10121A"
                                                }}>{s.tricimoto_num}</span>
                                                <span style={{
                                                    fontSize: "11px",
                                                    color: "#A1A1AA",
                                                    marginLeft: "5px"
                                                }}>{COMPANIAS[s.tricimoto_compania] ?? s.tricimoto_compania}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{...S.td, fontSize: "13px", color: "#3F3F46", maxWidth: "250px"}}>{s.descripcion?.toUpperCase()}</td>
                                    <td style={S.td}>
                                        <span style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#10121A",
                                            fontFamily: "monospace"
                                        }}>${Number(s.monto_total).toFixed(2)}</span>
                                        {Number(s.monto_pendiente) > 0 && (
                                            <span style={{
                                                display: "block",
                                                fontSize: "11px",
                                                color: "#92400E",
                                                fontFamily: "monospace"
                                            }}>
                          Pend. ${Number(s.monto_pendiente).toFixed(2)}
                        </span>
                                        )}
                                    </td>
                                    <td style={S.td}>
                      <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          fontSize: "11px", fontWeight: 600, padding: "3px 9px",
                          borderRadius: "20px", background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                      }}>
                        <span style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: est.dot,
                            flexShrink: 0
                        }}/>
                          {est.label}
                      </span>
                                    </td>
                                    <td style={{
                                        ...S.td,
                                        fontSize: "11px",
                                        fontFamily: "monospace",
                                        color: "#A1A1AA"
                                    }}>{fecha}</td>
                                    <td style={{...S.td}}>
                                        <div style={{
                                            display: "flex",
                                            gap: "5px",
                                            opacity: isHovered ? 1 : 0.5,
                                            transition: "opacity 0.15s"
                                        }}>
                                            <button onClick={() => openEdit(s)}
                                                    className="row-action-btn row-action-edit">
                                                <IconEdit/> Editar
                                            </button>
                                            <button onClick={() => {
                                                setSelected(s);
                                                setModal("delete");
                                            }} className="row-action-btn row-action-delete">
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
                                        disabled={page === 1}>
                                    <IconChevronLeft/> Anterior
                                </button>
                                <button className="pagination-btn"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}>
                                    Siguiente <IconChevronRight/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal crear/editar ── */}
            {(modal === "create" || modal === "edit") && (
                <div
                    style={{
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
                    }}
                >
                    <div style={{
                        background: "#fff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "480px",
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
                            }}>{selected ? "Editar servicio" : "Nuevo servicio"}</h2>
                            <button onClick={() => setModal(null)} style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#A1A1AA",
                                display: "flex",
                                padding: "2px"
                            }}>
                                <IconX/>
                            </button>
                        </div>
                        <div style={{padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                                <div>
                                    <label style={S.label}>Número</label>
                                    <Input {...field("tricimoto_num")} placeholder="001"/>
                                </div>
                                <div>
                                    <label style={S.label}>Compañía</label>
                                    <Select {...field("tricimoto_compania")}
                                            onChange={e => setForm(p => ({...p, tricimoto_compania: e.target.value}))}>
                                        {Object.entries(COMPANIAS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Mecánico</label>
                                <Select value={form.mecanico_id}
                                        onChange={e => setForm(p => ({...p, mecanico_id: e.target.value}))}>
                                    <option value="">Seleccionar mecánico</option>
                                    {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                </Select>
                            </div>
                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                                <div>
                                    <label style={S.label}>Monto total</label>
                                    <Input {...field("monto_total")} type="number" step="0.01" placeholder="0.00"/>
                                </div>
                                <div>
                                    <label style={S.label}>Monto pendiente</label>
                                    <Input {...field("monto_pendiente")} type="number" step="0.01" placeholder="0.00"/>
                                </div>
                            </div>
                            {selected && (
                                <div>
                                    <label style={S.label}>Estado</label>
                                    <Select value={form.estado}
                                            onChange={e => setForm(p => ({...p, estado: e.target.value}))}>
                                        {ESTADOS.map(e => <option key={e} value={e}>{EST[e]?.label ?? e}</option>)}
                                    </Select>
                                </div>
                            )}
                            <div>
                                <label style={S.label}>Descripción</label>
                                <Textarea {...field("descripcion")} rows={3} placeholder="Descripción del servicio..."
                                          onChange={e => setForm(p => ({...p, descripcion: e.target.value}))}/>
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
                            <button onClick={handleSave} disabled={saving} className="btn-primary"
                                    style={{...S.primary, opacity: saving ? 0.6 : 1}}>
                                {saving ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal eliminar ── */}
            {modal === "delete" && selected && (
                <div
                    style={{
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
                    }}
                >
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
                            <h2 style={{fontSize: "15px", fontWeight: 700, color: "#10121A"}}>Eliminar servicio</h2>
                            <button onClick={() => setModal(null)} style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#A1A1AA",
                                display: "flex",
                                padding: "2px"
                            }}>
                                <IconX/>
                            </button>
                        </div>
                        <div style={{padding: "20px 24px", display: "flex", gap: "14px", alignItems: "flex-start"}}>
                            <div style={{flexShrink: 0, marginTop: "1px"}}><IconAlertTriangle/></div>
                            <p style={{fontSize: "13px", color: "#3F3F46", lineHeight: "1.65"}}>
                                ¿Eliminar el servicio de la tricimoto <strong
                                style={{color: "#10121A"}}>{selected.tricimoto_num} · {COMPANIAS[selected.tricimoto_compania] ?? selected.tricimoto_compania}</strong>?
                                Esta acción no se puede deshacer.
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

            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
}