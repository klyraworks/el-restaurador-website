"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

type Row = { fecha: string; ingresos: number; gastos: number; adelantos: number; neto: number };
type Period = 7 | 30 | 90;
type ChartType = "area" | "bar";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 días",  value: 7  },
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
];

function fmt(fecha: string) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function fmtMoney(v: number) { return `$${v.toFixed(2)}`; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "160px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#71717A" }}>{p.name}</span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#10121A", fontFamily: "monospace" }}>{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart() {
  const [data, setData]       = useState<Row[]>([]);
  const [period, setPeriod]   = useState<Period>(30);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard/chart?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [period]);

  const mapped = data.map(r => ({ ...r, fecha: fmt(r.fecha) }));

  const totalIngresos = data.reduce((s, r) => s + r.ingresos, 0);
  const totalGastos   = data.reduce((s, r) => s + r.gastos + r.adelantos, 0);
  const totalNeto     = totalIngresos - totalGastos;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>

      {/* Gráfico 1: Ingresos + Neto */}
      <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#10121A" }}>Ingresos y balance neto</h2>
            <p style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "2px" }}>
              Total cobrado: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#10121A" }}>{fmtMoney(totalIngresos)}</span>
              <span style={{ margin: "0 8px", color: "#E4E4E7" }}>|</span>
              Neto: <span style={{ fontFamily: "monospace", fontWeight: 700, color: totalNeto >= 0 ? "#166534" : "#991B1B" }}>{totalNeto >= 0 ? "+" : ""}{fmtMoney(totalNeto)}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Toggle área/barra */}
            <div style={{ display: "flex", border: "1px solid #E4E4E7", borderRadius: "8px", overflow: "hidden" }}>
              {(["area", "bar"] as ChartType[]).map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{ padding: "5px 10px", border: "none", background: chartType === t ? "#10121A" : "transparent", color: chartType === t ? "#fff" : "#71717A", fontSize: "11px", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}>
                  {t === "area" ? "Curva" : "Barras"}
                </button>
              ))}
            </div>
            {/* Toggle período */}
            <div style={{ display: "flex", border: "1px solid #E4E4E7", borderRadius: "8px", overflow: "hidden" }}>
              {PERIODS.map(({ label, value }) => (
                <button key={value} onClick={() => setPeriod(value)} style={{ padding: "5px 10px", border: "none", background: period === value ? "#10121A" : "transparent", color: period === value ? "#fff" : "#71717A", fontSize: "11px", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", height: "260px", opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={mapped} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10121A" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10121A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNeto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="ingresos" name="Cobrado" stroke="#10121A" strokeWidth={2} fill="url(#gIngresos)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="neto"     name="Neto"    stroke="#22C55E" strokeWidth={2} fill="url(#gNeto)"     dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            ) : (
              <BarChart data={mapped} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="ingresos" name="Cobrado" fill="#10121A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neto"     name="Neto"    fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Gastos vs Adelantos */}
      <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#10121A" }}>Gastos y adelantos</h2>
            <p style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "2px" }}>
              Total egresos: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#991B1B" }}>{fmtMoney(totalGastos)}</span>
            </p>
          </div>
        </div>
        <div style={{ padding: "20px", height: "220px", opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mapped} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAdelantos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="gastos"    name="Gastos"    stroke="#EF4444" strokeWidth={2} fill="url(#gGastos)"    dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="adelantos" name="Adelantos" stroke="#3B82F6" strokeWidth={2} fill="url(#gAdelantos)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}