import { requireAdmin } from "@/lib/auth-helpers";
import { query } from "@/lib/db";

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
  tricimoto_color: string;
  descripcion: string | null;
  mecanico: string;
  estado: string;
  created_at: string;
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pagado:  { bg: "#DCFCE7", color: "#166534", border: "#BBF7D0", label: "Pagado"  },
  pendiente:  { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", label: "Pendiente" },
  anulado: { bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7", label: "Anulado" },
};

export default async function DashboardPage() {
  await requireAdmin();

  const [stats] = await query<Stats>(`
    SELECT
      COUNT(*)                                                        AS total_servicios,
      COUNT(*) FILTER (WHERE estado = 'pendiente')                      AS servicios_pendientes,
      COALESCE(SUM(monto_total - monto_pendiente), 0)                AS total_cobrado,
      COALESCE((SELECT SUM(monto) FROM gastos WHERE tipo = 'gasto'   AND deleted_at IS NULL), 0) AS total_gastos,
      COALESCE((SELECT SUM(monto) FROM gastos WHERE tipo = 'adelanto' AND deleted_at IS NULL), 0) AS total_adelantos
    FROM servicios
    WHERE deleted_at IS NULL
  `);

  const recientes = await query<ServicioReciente>(`
    SELECT
      s.id,
      s.tricimoto_num,
      s.tricimoto_color,
      s.descripcion,
      s.estado,
      s.created_at,
      u.nombre AS mecanico
    FROM servicios s
    JOIN usuarios u ON u.id = s.mecanico_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.created_at DESC
    LIMIT 8
  `);

  const statCards = [
    { label: "Total servicios",   value: stats.total_servicios,      mono: true  },
    { label: "Pendientes de pago", value: stats.servicios_pendientes, mono: true  },
    { label: "Total cobrado",     value: `$${Number(stats.total_cobrado).toFixed(2)}`,   mono: true },
    { label: "Total gastos",      value: `$${Number(stats.total_gastos).toFixed(2)}`,    mono: true },
    { label: "Total adelantos",   value: `$${Number(stats.total_adelantos).toFixed(2)}`, mono: true },
  ];

  return (
    <div style={{ padding: "32px 28px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", letterSpacing: "-0.5px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#A1A1AA", marginTop: "3px" }}>
          Resumen general del taller
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
        {statCards.map(({ label, value }) => (
          <div key={label} style={{
            background: "#fff",
            border: "1px solid #E4E4E7",
            borderRadius: "12px",
            padding: "16px 20px",
            flex: "1",
            minWidth: "140px",
          }}>
            <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A1A1AA", marginBottom: "8px" }}>
              {label}
            </p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", fontFamily: "monospace", letterSpacing: "-0.5px", lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Servicios recientes */}
      <div style={{
        background: "#fff",
        border: "1px solid #E4E4E7",
        borderRadius: "14px",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E4E7" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#10121A" }}>Servicios recientes</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #E4E4E7", background: "#FAFAFA" }}>
              {["#", "Tricimoto", "Descripción", "Mecánico", "Estado", "Fecha"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#A1A1AA",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recientes.map((s, i) => {
              const est = ESTADO_STYLE[s.estado] ?? ESTADO_STYLE.anulado;
              const fecha = new Date(s.created_at).toLocaleDateString("es-EC", {
                day: "2-digit", month: "short", year: "numeric",
              });
              return (
                <tr key={s.id} style={{ borderBottom: i < recientes.length - 1 ? "1px solid #F4F4F5" : "none" }}>
                  <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "monospace", color: "#A1A1AA" }}>
                    #{s.id}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#10121A" }}>
                      {s.tricimoto_num}
                    </span>
                    <span style={{ fontSize: "11px", color: "#A1A1AA", marginLeft: "5px" }}>
                      {s.tricimoto_color}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#3F3F46", maxWidth: "220px" }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.descripcion ?? <span style={{ color: "#A1A1AA", fontStyle: "italic" }}>Sin descripción</span>}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#3F3F46" }}>{s.mecanico}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: "20px",
                      background: est.bg,
                      color: est.color,
                      border: `1px solid ${est.border}`,
                    }}>
                      {est.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "monospace", color: "#A1A1AA" }}>
                    {fecha}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}