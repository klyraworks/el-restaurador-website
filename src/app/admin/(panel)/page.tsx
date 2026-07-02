import {requireAdmin} from "@/lib/auth-helpers";
import {query} from "@/lib/db";
import RevenueChart from "@/components/admin/RevenueChart";

interface Stats {
    total_servicios: string;
    servicios_pendientes: string;
    total_cobrado: string;
    total_gastos: string;
    total_adelantos: string;
}

interface ServicioReciente {
    id: number;
    tricimoto_num: string;
    tricimoto_compania: string;
    descripcion: string | null;
    mecanico: string;
    estado: string;
    created_at: string;
}

const EST: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
    pagado: {bg: "#DCFCE7", color: "#166534", border: "#BBF7D0", label: "Pagado", dot: "#22C55E"},
    pendiente: {bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", label: "Pendiente", dot: "#F59E0B"},
    anulado: {bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7", label: "Anulado", dot: "#A1A1AA"},
};

const COMPANIAS: Record<string, string> = {"19 de Mayo": "19 de Mayo", "Comtrilamana": "Comtrilamana", "Quilotoa": "Quilotoa", "Patria Vuelve": "Patria Vuelve", "Taxsancar": "Taxsancar"};
const COLORES_DOT: Record<string, string> = {"19 de Mayo": "#EF4444", "Comtrilamana": "#22C55E", "Quilotoa": "#EAB308", "Patria Vuelve": "#3B82F6", "Taxsancar": "#EF4444"};

const STAT_ICONS: Record<string, React.ReactNode> = {
    "Total servicios": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
            <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
    ),
    "Pendientes de pago": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    "Total cobrado": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
    ),
    "Total gastos": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    ),
    "Adelantos": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 11 21 7 17 3"/>
            <line x1="21" y1="7" x2="9" y2="7"/>
            <polyline points="7 21 3 17 7 13"/>
            <line x1="15" y1="17" x2="3" y2="17"/>
        </svg>
    ),
};

export default async function DashboardPage() {
    await requireAdmin();

    const [stats] = await query<Stats>(`
        SELECT COUNT(*)                                                                                    AS total_servicios,
               COUNT(*)                                                                                       FILTER (WHERE estado = 'pendiente')                     AS servicios_pendientes, COALESCE(SUM(monto_total - monto_pendiente), 0) AS total_cobrado,
               COALESCE((SELECT SUM(monto) FROM gastos WHERE tipo = 'gasto' AND deleted_at IS NULL),
                        0)                                                                                 AS total_gastos,
               COALESCE((SELECT SUM(monto) FROM gastos WHERE tipo = 'adelanto' AND deleted_at IS NULL),
                        0)                                                                                 AS total_adelantos
        FROM servicios
        WHERE deleted_at IS NULL
    `);

    const recientes = await query<ServicioReciente>(`
        SELECT s.id, s.tricimoto_num, s.tricimoto_compania, s.descripcion, s.estado, s.created_at, u.nombre AS mecanico
        FROM servicios s
                 JOIN usuarios u ON u.id = s.mecanico_id
        WHERE s.deleted_at IS NULL
        ORDER BY s.created_at DESC LIMIT 8
    `);

    const netBalance = Number(stats.total_cobrado) - Number(stats.total_gastos) - Number(stats.total_adelantos);

    const statCards = [
        {label: "Total servicios", value: stats.total_servicios, prefix: "", suffix: ""},
        {label: "Pendientes de pago", value: stats.servicios_pendientes, prefix: "", suffix: ""},
        {label: "Total cobrado", value: Number(stats.total_cobrado).toFixed(2), prefix: "$", suffix: ""},
        {label: "Total gastos", value: Number(stats.total_gastos).toFixed(2), prefix: "$", suffix: ""},
        {label: "Adelantos", value: Number(stats.total_adelantos).toFixed(2), prefix: "$", suffix: ""},
    ];

    const th = {
        padding: "10px 16px",
        textAlign: "left" as const,
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.07em",
        color: "#A1A1AA"
    };
    const td = {padding: "13px 16px"};

    return (
        <div style={{padding: "32px 28px 60px"}}>

            {/* Header */}
            <div style={{
                marginBottom: "28px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between"
            }}>
                <div>
                    <h1 style={{
                        fontSize: "22px",
                        fontWeight: 800,
                        color: "#10121A",
                        letterSpacing: "-0.5px"
                    }}>Dashboard</h1>
                    <p style={{fontSize: "13px", color: "#A1A1AA", marginTop: "3px"}}>Resumen general del taller</p>
                </div>
                <div style={{textAlign: "right"}}>
                    <p style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "#A1A1AA",
                        marginBottom: "3px"
                    }}>Balance neto</p>
                    <p style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        fontFamily: "monospace",
                        letterSpacing: "-0.5px",
                        color: netBalance >= 0 ? "#166534" : "#991B1B"
                    }}>
                        {netBalance >= 0 ? "+" : ""}${netBalance.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px"}}>
                {statCards.map(({label, value, prefix}) => (
                    <div key={label} style={{
                        background: "#fff",
                        border: "1px solid #E4E4E7",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        flex: "1",
                        minWidth: "140px"
                    }}>
                        <div style={{display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px"}}>
                            <span style={{color: "#A1A1AA"}}>{STAT_ICONS[label]}</span>
                            <p style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                color: "#A1A1AA"
                            }}>{label}</p>
                        </div>
                        <p style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#10121A",
                            fontFamily: "monospace",
                            letterSpacing: "-0.5px",
                            lineHeight: 1
                        }}>
                            {prefix}{value}
                        </p>
                    </div>
                ))}
            </div>

            <RevenueChart/>

            {/* Servicios recientes */}
            <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
                <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #E4E4E7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h2 style={{fontSize: "14px", fontWeight: 700, color: "#10121A"}}>Servicios recientes</h2>
                    <a href="/admin/servicios" style={{
                        fontSize: "12px",
                        color: "#71717A",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        Ver todos
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </a>
                </div>

                <div style={{overflowX: "auto", WebkitOverflowScrolling: "touch"}}>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <thead>
                        <tr style={{borderBottom: "1px solid #E4E4E7", background: "#FAFAFA"}}>
                            {["#", "Tricimoto", "Descripción", "Mecánico", "Estado", "Fecha"].map(h => (
                                <th key={h} style={th}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {recientes.map((s, i) => {
                            const est = EST[s.estado] ?? EST.anulado;
                            const fecha = new Date(s.created_at).toLocaleDateString("es-EC", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            });
                            return (
                                <tr key={s.id}
                                    style={{borderBottom: i < recientes.length - 1 ? "1px solid #F4F4F5" : "none"}}>
                                    <td style={{
                                        ...td,
                                        fontSize: "11px",
                                        fontFamily: "monospace",
                                        color: "#C4C4C8"
                                    }}>#{s.id}</td>
                                    <td style={td}>
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
                                    <td style={{...td, maxWidth: "220px"}}>
                                        {s.descripcion
                                            ? <span style={{
                                                display: "block",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                fontSize: "13px",
                                                color: "#3F3F46"
                                            }}>{s.descripcion}</span>
                                            : <span style={{fontSize: "12px", color: "#C4C4C8", fontStyle: "italic"}}>Sin descripción</span>}
                                    </td>
                                    <td style={{...td, fontSize: "13px", color: "#3F3F46"}}>{s.mecanico}</td>
                                    <td style={td}>
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
                                        ...td,
                                        fontSize: "11px",
                                        fontFamily: "monospace",
                                        color: "#A1A1AA"
                                    }}>{fecha}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}