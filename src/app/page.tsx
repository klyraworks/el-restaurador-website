"use client";

import { useEffect, useState, useCallback } from "react";

/* ─── constants ─── */
const TRIKE_COLORS: Record<string, { hex: string; label: string }> = {
  "Comtrilamana":  { hex: "#16a34a", label: "Comtrilamana" },
  "19 de Mayo":    { hex: "#dc2626", label: "19 de Mayo" },
  "Quilotoa":      { hex: "#ca8a04", label: "Quilotoa" },
  "Patria Vuelve": { hex: "#2563eb", label: "Patria Vuelve" },
  "Taxsancar":     { hex: "#dc2626", label: "Taxsancar" },
};

const TARIFAS: {
  nombre: string;
  precio: number;
  nota?: string;
  detalle?: { label: string; valor: number; adicional?: boolean }[];
}[] = [
  // ── Aceites
  { nombre: "Cambio de aceite de motor", precio: 1 },
  {
    nombre: "Cambio de aceite completo",
    precio: 2,
    detalle: [
      { label: "Aceite de motor",  valor: 1   },
      { label: "Filtro de aceite", valor: 0.5 },
      { label: "Aceite de caja",   valor: 0.5 },
    ],
  },
  // ── Motor y carburador
  { nombre: "Limpieza de carburador",          precio: 5  },
  { nombre: "Limpieza de magneto",             precio: 5  },
  { nombre: "Engrasado de motor de arranque",  precio: 10 },
  { nombre: "Calibración de válvulas",         precio: 3 },
  // ── Frenos
  { nombre: "Regulación de freno",         precio: 1, nota: "Por cada rueda." },
  { nombre: "Cambio de zapatas",           precio: 3, nota: "Por cada rueda." },
  { nombre: "Cambio de cilindro de freno", precio: 3, nota: "Por cada rueda." },
  { nombre: "Cambio de cañería",           precio: 3 },
  // ── Transmisión y embrague
  {
    nombre: "Cambio de cables de marcha",
    precio: 2,
    nota: "Cada cable de marcha y el cable de embrague tiene un precio de $2.",
  },
  { nombre: "Reparación de embrague", precio: 20 },
  // ── Suspensión
  {
    nombre: "Cambio de pin",
    precio: 20,
    nota: "Incluye engrasado y cambio de pistas superiores e inferiores si es necesario.",
  },
  { nombre: "Cambio de bocines", precio: 10 },
  // ── Mantenimiento general
  {
    nombre: "Mantenimiento completo",
    precio: 40,
    nota: "Los siguientes trabajos son adicionales:",
    detalle: [
      { label: "Cambio de pin",                      valor: 5, adicional: true },
      { label: "Engrasado del motor de arranque",    valor: 5, adicional: true },
      { label: "Cambio de bocines de trinche",       valor: 5, adicional: true },
    ],
  },
];

/* ─── types ─── */
interface Servicio {
  id: number;
  created_at: string;
  descripcion: string | null;
  mecanico: string;
  estado: string;
}

/* ─── icons ─── */
const IconWrench = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconCalendar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);
const IconActivity = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconCheck = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClock = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconChevronRight = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconChevronDown = ({ size = 12, rotated = false }: { size?: number; rotated?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: rotated ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconList = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconX = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ─── tricimoto image ─── */
function TricimotoImage({ color }: { color: string }) {
  const [loaded, setLoaded] = useState(false);
  const [prev, setPrev]     = useState(color);

  useEffect(() => {
    if (color !== prev) { setLoaded(false); setPrev(color); }
  }, [color, prev]);

  // console.log(TRIKE_COLORS[color]?.label.toLowerCase().replace(/\s+/g, "-"))

  const src = color ? `/tricimoto_${TRIKE_COLORS[color]?.label.toLowerCase().replace(/\s+/g, "-")}.png` : "/tricimoto_default.png";

  return (
    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "20px", overflow: "hidden", position: "relative", background: "#F4F4F5" }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "20px", animation: "pulse 1.4s infinite", background: "linear-gradient(90deg,#F4F4F5 25%,#EDEDEE 50%,#F4F4F5 75%)", backgroundSize: "200% 100%" }} />
      )}
      <img
        key={src}
        src={src}
        alt="Tricimoto"
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", opacity: loaded ? 1 : 0, transition: "opacity 0.35s ease" }}
      />
    </div>
  );
}

/* ─── color selector ─── */
function ColorSelector({ colors, selected, onChange }: { colors: string[]; selected: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {colors.map(c => {
        const meta   = TRIKE_COLORS[c];
        if (!meta) return null;
        const active = selected === c;
        return (
          <button key={c} onClick={() => onChange(c)} style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "7px 14px 7px 10px",
            border: `1.5px solid ${active ? meta.hex : "#E4E4E7"}`,
            borderRadius: "40px",
            background: active ? `${meta.hex}14` : "#fff",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: "13px", fontWeight: active ? 700 : 500,
            color: active ? meta.hex : "#71717A",
            transition: "all 0.15s ease", outline: "none",
            boxShadow: active ? `0 0 0 3px ${meta.hex}18` : "none",
          }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: meta.hex, flexShrink: 0, boxShadow: active ? `0 0 0 2px ${meta.hex}30` : "none", transition: "box-shadow 0.15s" }} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── number grid ─── */
function NumberGrid({ numbers, selected, accentHex, onChange }: { numbers: string[]; selected: string; accentHex: string; onChange: (n: string) => void }) {
  const sorted = [...numbers].sort((a, b) => Number(a) - Number(b));
  return (
    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
      {sorted.map(n => {
        const active = selected === n;
        return (
          <button key={n} onClick={() => onChange(n)} style={{
            width: "44px", height: "44px",
            border: `1.5px solid ${active ? accentHex : "#E4E4E7"}`,
            borderRadius: "10px",
            background: active ? accentHex : "#fff",
            color: active ? "#fff" : "#3F3F46",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
            fontFamily: "monospace", transition: "all 0.15s ease", outline: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: active ? "scale(1.06)" : "scale(1)",
            boxShadow: active ? `0 2px 8px ${accentHex}40` : "none",
          }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

/* ─── stat card ─── */
function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "12px", padding: "16px 20px", flex: 1, minWidth: "110px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px", color: accent ?? "#A1A1AA" }}>
        {icon}
        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A1A1AA" }}>{label}</span>
      </div>
      <p style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", fontFamily: "monospace", letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

/* ─── estado badge ─── */
function EstadoBadge({ pendiente }: { pendiente: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
      background: pendiente ? "#FEF3C7" : "#DCFCE7",
      color:      pendiente ? "#92400E" : "#166534",
      border:     `1px solid ${pendiente ? "#FDE68A" : "#BBF7D0"}`,
      flexShrink: 0,
    }}>
      {pendiente ? <IconClock size={10} /> : <IconCheck size={10} />}
      {pendiente ? "Pendiente" : "Pagado"}
    </span>
  );
}

/* ─── service card ─── */
function ServiceCard({ s, index }: { s: Servicio; index: number }) {
  const fecha     = new Date(s.created_at);
  const fechaStr  = fecha.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
  const horaStr   = fecha.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  const pendiente = s.estado === "pendiente";

  return (
    <div style={{
      background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px",
      padding: "18px 22px", animation: "fadeUp 0.3s ease both",
      animationDelay: `${index * 0.05}s`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#A1A1AA" }}>
          <IconCalendar size={12} />
          <span style={{ fontSize: "11px", fontFamily: "monospace" }}>{fechaStr}</span>
          <span style={{ fontSize: "11px", color: "#D4D4D8", fontFamily: "monospace" }}>·</span>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#C4C4C8" }}>{horaStr}</span>
        </div>
        <EstadoBadge pendiente={pendiente} />
      </div>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#10121A", lineHeight: 1.5, marginBottom: "12px" }}>
        {s.descripcion ?? <span style={{ color: "#C4C4C8", fontStyle: "italic", fontWeight: 400 }}>Sin descripción</span>}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#71717A" }}>
          <IconWrench size={12} />
          <span style={{ fontSize: "12px" }}>{s.mecanico}</span>
        </div>
        <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#D4D4D8" }}>#{s.id}</span>
      </div>
    </div>
  );
}

/* ─── skeleton ─── */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const bar = (w: string, h: string, d = 0) => (
    <div style={{ height: h, width: w, background: "#F4F4F5", borderRadius: "6px", animation: "pulse 1.4s infinite", animationDelay: `${d}s` }} />
  );
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px", animationDelay: `${delay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>{bar("130px", "14px", 0)}{bar("72px", "22px", 0.05)}</div>
      {bar("70%", "16px", 0.1)}
      {bar("28%", "13px", 0.15)}
    </div>
  );
}

/* ─── section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#A1A1AA", marginBottom: "10px" }}>
      {children}
    </p>
  );
}

/* ─── tariff item (accordion) ─── */
function TariffItem({
  tarifa, index, expanded, onToggle,
}: {
  tarifa: typeof TARIFAS[0];
  index: number;
  expanded: boolean;
  onToggle: (i: number) => void;
}) {
  const hasDetail = !!(tarifa.detalle?.length || tarifa.nota);

  return (
    <div style={{ marginBottom: "3px" }}>
      <button
        onClick={() => hasDetail && onToggle(index)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 12px",
          background: expanded ? "#F4F4F5" : "transparent",
          border: "none",
          borderRadius: expanded && hasDetail ? "10px 10px 0 0" : "10px",
          cursor: hasDetail ? "pointer" : "default",
          textAlign: "left",
          transition: "background 0.15s",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#10121A", flex: 1, lineHeight: 1.4 }}>
          {tarifa.nombre}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "13px", color: "#10121A" }}>
            ${tarifa.precio}
          </span>
          {hasDetail && <IconChevronDown rotated={expanded} />}
        </div>
      </button>

      {expanded && hasDetail && (
        <div style={{
          background: "#F9F9FA",
          borderRadius: "0 0 10px 10px",
          borderTop: "1px solid #F0F0F0",
          padding: "10px 12px 12px",
        }}>
          {tarifa.nota && (
            <p style={{ fontSize: "11px", color: "#A1A1AA", marginBottom: tarifa.detalle?.length ? "8px" : 0, lineHeight: 1.5 }}>
              {tarifa.nota}
            </p>
          )}
          {tarifa.detalle?.map((d, j) => (
            <div key={j} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 0",
              borderBottom: j < (tarifa.detalle?.length ?? 0) - 1 ? "1px solid #F0F0F0" : "none",
            }}>
              <span style={{ fontSize: "12px", color: "#71717A" }}>{d.label}</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color: "#10121A" }}>
                {d.adicional ? "+" : ""}${d.valor}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── page ─── */
export default function Home() {
  const [colores, setColores]         = useState<Record<string, string[]>>({});
  const [colorSel, setColorSel]       = useState<string>("");
  const [numSel, setNumSel]           = useState<string>("");
  const [servicios, setServicios]     = useState<Servicio[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const [tariffOpen, setTariffOpen]   = useState(false);
  const [expanded, setExpanded]       = useState<Set<number>>(new Set());
  const [search, setSearch]           = useState("");
  const [listVisible, setListVisible] = useState(true);
  const [filteredTarifas, setFilteredTarifas] = useState(
    TARIFAS.map((t, i) => ({ ...t, originalIndex: i }))
  );

  const toggleExpanded = (i: number) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(i) ? n.delete(i) : n.add(i);
    return n;
  });

  useEffect(() => {
    setListVisible(false);
    const timer = setTimeout(() => {
      const q = search.toLowerCase().trim();
      setFilteredTarifas(
        TARIFAS
          .map((t, i) => ({ ...t, originalIndex: i }))
          .filter(t =>
            !q ||
            t.nombre.toLowerCase().includes(q) ||
            t.detalle?.some(d => d.label.toLowerCase().includes(q))
          )
      );
      setListVisible(true);
    }, 140);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetch("/api/tricimoto")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setColores(data); setLoadingInit(false); })
      .catch(() => setLoadingInit(false));
  }, []);

  const cargarServicios = useCallback(async (color: string, num: string) => {
    if (!color || !num) return;
    setLoading(true);
    const res  = await fetch(`/api/servicios?color=${encodeURIComponent(color)}&num=${encodeURIComponent(num)}`);
    const data = await res.json();
    setServicios(data);
    setLoading(false);
  }, []);

  const handleColorChange = (color: string) => { setColorSel(color); setNumSel(""); setServicios([]); };
  const handleNumChange   = (num: string)   => { setNumSel(num); cargarServicios(colorSel, num); };

  const numerosDisponibles = colorSel ? (colores[colorSel] || []) : [];
  const accentHex          = TRIKE_COLORS[colorSel]?.hex ?? "#10121A";
  const coloresDisponibles = Object.keys(colores).sort();
  const showStats          = colorSel && numSel && !loading && servicios.length > 0;

  const ultimoServicio = servicios.length > 0
    ? new Date(Math.max(...servicios.map(s => new Date(s.created_at).getTime())))
    : null;
  const ultimoStr = ultimoServicio
    ? ultimoServicio.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F4F4F5; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        button { font-family: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        button:active { opacity: 0.75 !important; }
        a { color: inherit; }
        .hero-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          align-items: start;
        }
        .stats-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          animation: fadeUp 0.28s ease;
        }
        .klyra-link:hover { color: #10121A !important; }
        .tariff-close-btn:hover { background: #F4F4F5 !important; color: #10121A !important; }
        @media (max-width: 680px) {
          .hero-grid { grid-template-columns: 1fr; gap: 20px; }
          .trike-wrap { max-width: 240px !important; margin: 0 auto; }
          .page-main  { padding: 16px 14px 60px !important; }
          .page-nav   { padding: 0 16px !important; }
          .page-footer { flex-direction: column; align-items: flex-start !important; gap: 6px !important; }
          .hero-card  { padding: 20px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F4F5", fontFamily: "Inter, system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>

        {/* ── Nav ── */}
        <nav className="page-nav" style={{
          background: "#fff", borderBottom: "1px solid #E4E4E7",
          padding: "0 32px", height: "54px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ width: "28px", height: "28px", background: "#10121A", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
              <IconWrench size={13} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#10121A", letterSpacing: "-0.2px" }}>El Restaurador</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 2px #22C55E30" }} />
            <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace" }}>Datos en tiempo real</span>
          </div>
        </nav>

        <main className="page-main" style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 60px", flex: 1, width: "100%" }}>

          {/* ── Hero card ── */}
          <div className="hero-card" style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: "18px", padding: "28px", marginBottom: "16px" }}>
            <div className="hero-grid">

              {/* Imagen */}
              <div className="trike-wrap">
                <TricimotoImage color={colorSel} />
                {colorSel && (
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", animation: "fadeUp 0.2s ease" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentHex, boxShadow: `0 0 0 2px ${accentHex}30` }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: accentHex }}>{TRIKE_COLORS[colorSel]?.label}</span>
                    {numSel && (
                      <>
                        <span style={{ color: "#E4E4E7", fontSize: "12px" }}>·</span>
                        <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color: "#10121A" }}>#{numSel}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Panel selector */}
              <div style={{ paddingTop: "4px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "4px" }}>
                  Historial de servicios
                </p>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#10121A", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: "32px" }}>
                  Consulta tu<br />tricimoto
                </h1>

                {/* Step 1 */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "6px", background: colorSel ? accentHex : "#10121A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                      <span style={{ color: "#fff", fontSize: "9px", fontWeight: 800 }}>1</span>
                    </div>
                    <SectionLabel>Selecciona la compañía</SectionLabel>
                  </div>
                  {loadingInit ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[68, 58, 78, 52].map((w, i) => (
                        <div key={i} style={{ height: "34px", width: `${w}px`, background: "#F4F4F5", borderRadius: "40px", animation: "pulse 1.4s infinite", animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : (
                    <ColorSelector colors={coloresDisponibles} selected={colorSel} onChange={handleColorChange} />
                  )}
                </div>

                {/* Step 2 */}
                <div style={{ opacity: colorSel ? 1 : 0.35, transition: "opacity 0.2s", pointerEvents: colorSel ? "auto" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "6px", background: numSel ? accentHex : colorSel ? "#10121A" : "#D4D4D8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                      <span style={{ color: "#fff", fontSize: "9px", fontWeight: 800 }}>2</span>
                    </div>
                    <SectionLabel>Selecciona el número</SectionLabel>
                  </div>
                  {colorSel ? (
                    <NumberGrid numbers={numerosDisponibles} selected={numSel} accentHex={accentHex} onChange={handleNumChange} />
                  ) : (
                    <div style={{ display: "flex", gap: "7px" }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F4F4F5" }} />)}
                    </div>
                  )}
                </div>

                {colorSel && numSel && !loading && (
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "5px", color: "#A1A1AA", animation: "fadeUp 0.2s ease" }}>
                    <IconChevronRight size={12} />
                    <span style={{ fontSize: "12px" }}>
                      {servicios.length > 0 ? `${servicios.length} servicio${servicios.length !== 1 ? "s" : ""} encontrado${servicios.length !== 1 ? "s" : ""}` : "Sin servicios registrados"}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Stats ── */}
          {showStats && (
            <div className="stats-row">
              <StatCard label="Total servicios" value={String(servicios.length)} icon={<IconActivity />} accent={accentHex} />
              <StatCard label="Último servicio" value={ultimoStr} icon={<IconCalendar size={14} />} />
            </div>
          )}

          {/* ── Skeletons ── */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} delay={i * 0.08} />)}
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && numSel && servicios.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 24px", background: "#fff", border: "1px solid #E4E4E7", borderRadius: "16px", animation: "fadeUp 0.28s ease" }}>
              <div style={{ width: "46px", height: "46px", background: "#F4F4F5", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#A1A1AA" }}>
                <IconWrench size={20} />
              </div>
              <p style={{ fontWeight: 700, color: "#10121A", fontSize: "15px", marginBottom: "5px" }}>Sin servicios registrados</p>
              <p style={{ color: "#A1A1AA", fontSize: "13px" }}>Esta tricimoto no tiene historial disponible.</p>
            </div>
          )}

          {/* ── Service cards ── */}
          {!loading && servicios.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {servicios.map((s, i) => <ServiceCard key={s.id} s={s} index={i} />)}
            </div>
          )}

          {/* ── Placeholder ── */}
          {!colorSel && !loadingInit && (
            <div style={{ textAlign: "center", padding: "44px 0" }}>
              <p style={{ color: "#C4C4C8", fontSize: "13px" }}>Selecciona el color de tu tricimoto para comenzar</p>
            </div>
          )}

        </main>

        {/* ── Footer ── */}
        <footer className="page-footer" style={{ borderTop: "1px solid #E4E4E7", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "20px", height: "20px", background: "#10121A", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IconWrench size={10} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#3F3F46" }}>El Restaurador</span>
          </div>
          <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace", textAlign: "center" }}>
            Desarrollado por Oscar Morán ·{" "}
            <a href="https://klyraworks.com" target="_blank" rel="noopener noreferrer" className="klyra-link"
              style={{ color: "#71717A", textDecoration: "none", borderBottom: "1px solid #D4D4D8", transition: "color 0.15s" }}>
              Klyra Works
            </a>
          </span>
          <span style={{ fontSize: "11px", color: "#C4C4C8", fontFamily: "monospace" }}>Solo lectura</span>
        </footer>

        {/* ── Tarifas: botón tab derecho ── */}
        <button
          onClick={() => setTariffOpen(true)}
          aria-label="Ver tarifas"
          style={{
            position: "fixed",
            top: "50%",
            right: 0,
            transform: `translateY(-50%) translateX(${tariffOpen ? "48px" : "0"})`,
            opacity: tariffOpen ? 0 : 1,
            pointerEvents: tariffOpen ? "none" : "auto",
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease",
            zIndex: 21,
            background: "#10121A",
            border: "none",
            borderRadius: "8px 0 0 8px",
            width: "32px",
            height: "56px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "-2px 0 14px rgba(0,0,0,0.18)",
            padding: 0,
          }}
        >
          <IconList size={13} />
        </button>

        {/* ── Tarifas: panel ── */}
        <div style={{
          position: "fixed",
          top: 0, right: 0,
          width: "min(280px, 92vw)",
          height: "100vh",
          transform: tariffOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 20,
          background: "#fff",
          borderLeft: "1px solid #E4E4E7",
          display: "flex",
          flexDirection: "column",
          boxShadow: tariffOpen ? "-4px 0 24px rgba(0,0,0,0.08)" : "none",
        }}>

          {/* Header */}
          <div style={{
            padding: "16px",
            borderBottom: "1px solid #E4E4E7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "30px", height: "30px", background: "#10121A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <IconList size={13} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#10121A", lineHeight: 1.2 }}>Tarifas</p>
                <p style={{ fontSize: "10px", color: "#A1A1AA", marginTop: "1px" }}>Lista de servicios</p>
              </div>
            </div>
            <button
              className="tariff-close-btn"
              onClick={() => setTariffOpen(false)}
              aria-label="Cerrar"
              style={{
                width: "28px", height: "28px",
                border: "1px solid #E4E4E7",
                borderRadius: "7px",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#A1A1AA",
                padding: 0,
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
            >
              <IconX size={12} />
            </button>
          </div>

          {/* Buscador */}
          <div style={{ padding: "10px 8px 4px", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#A1A1AA", pointerEvents: "none", display: "flex" }}>
                <IconSearch size={13} />
              </span>
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={e  => (e.target.style.borderColor = "#10121A")}
                onBlur={e   => (e.target.style.borderColor = "#E4E4E7")}
                style={{
                  width: "100%",
                  padding: "8px 32px 8px 32px",
                  border: "1px solid #E4E4E7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  color: "#10121A",
                  background: "#F9F9FA",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", padding: "2px", cursor: "pointer",
                    color: "#A1A1AA", display: "flex", alignItems: "center",
                  }}
                >
                  <IconX size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px 10px", opacity: listVisible ? 1 : 0, transition: "opacity 0.15s ease" }}>
            {filteredTarifas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#A1A1AA" }}>Sin resultados</p>
                <p style={{ fontSize: "11px", color: "#C4C4C8", marginTop: "4px" }}>Intenta con otro término</p>
              </div>
            ) : (
              filteredTarifas.map(tarifa => (
                <TariffItem
                  key={tarifa.originalIndex}
                  tarifa={tarifa}
                  index={tarifa.originalIndex}
                  expanded={expanded.has(tarifa.originalIndex)}
                  onToggle={toggleExpanded}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #E4E4E7", flexShrink: 0 }}>
            <p style={{ fontSize: "11px", color: "#C4C4C8", fontFamily: "monospace", textAlign: "center" }}>
              Precios sujetos a cambios
            </p>
          </div>

        </div>

      </div>
    </>
  );
}