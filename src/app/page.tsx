"use client";

import { useEffect, useState, useCallback } from "react";

/* ─── constants ─── */
const TRIKE_COLORS: Record<string, { hex: string; label: string }> = {
  verde:    { hex: "#16a34a", label: "Verde" },
  roja:     { hex: "#dc2626", label: "Roja" },
  amarilla: { hex: "#ca8a04", label: "Amarilla" },
  azul:     { hex: "#2563eb", label: "Azul" },
};

/* ─── types ─── */
interface Servicio {
  id: number;
  created_at: string;
  descripcion: string | null;
  mecanico: string;
  monto_pendiente: string;
}

/* ─── icons ─── */
const IconWrench = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const IconCalendar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const IconActivity = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconHash = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="9" y2="9"/>
    <line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/>
    <line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);

const IconAlert = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

/* ─── SVG tricimoto ─── */
function TricimotoSVG({ color }: { color: string }) {
  const fill = TRIKE_COLORS[color]?.hex || "#2a2d36";
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="30" y="30" width="120" height="70" rx="12" fill={fill} style={{ transition: "fill 0.35s ease" }} />
      <rect x="40" y="18" width="100" height="20" rx="6" fill={fill} style={{ transition: "fill 0.35s ease" }} />
      <rect x="42" y="34" width="30" height="35" rx="4" fill="white" opacity="0.22" />
      <rect x="78" y="34" width="30" height="35" rx="4" fill="white" opacity="0.22" />
      <line x1="75" y1="30" x2="75" y2="100" stroke="white" strokeWidth="1.5" opacity="0.25" />
      <rect x="112" y="62" width="10" height="3" rx="1.5" fill="white" opacity="0.45" />
      <rect x="148" y="55" width="12" height="16" rx="4" fill={fill} style={{ transition: "fill 0.35s ease" }} />
      <rect x="149" y="57" width="9" height="12" rx="3" fill="white" opacity="0.35" />
      <circle cx="52" cy="105" r="18" fill="#18181b" />
      <circle cx="52" cy="105" r="10" fill="#e4e4e7" />
      <circle cx="52" cy="105" r="4" fill="#18181b" />
      <circle cx="152" cy="108" r="14" fill="#18181b" />
      <circle cx="152" cy="108" r="7" fill="#e4e4e7" />
      <circle cx="152" cy="108" r="3" fill="#18181b" />
      <rect x="30" y="95" width="120" height="8" rx="4" fill={fill} opacity="0.65" style={{ transition: "fill 0.35s ease" }} />
      <rect x="148" y="78" width="18" height="20" rx="4" fill={fill} opacity="0.8" style={{ transition: "fill 0.35s ease" }} />
    </svg>
  );
}

/* ─── color selector ─── */
function ColorSelector({
  colors, selected, onChange,
}: { colors: string[]; selected: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {colors.map(c => {
        const meta = TRIKE_COLORS[c];
        if (!meta) return null;
        const active = selected === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px 7px 10px",
              border: `1.5px solid ${active ? meta.hex : "#E4E4E7"}`,
              borderRadius: "40px",
              background: active ? `${meta.hex}14` : "#FAFAFA",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: active ? 700 : 500,
              color: active ? meta.hex : "#71717A",
              transition: "all 0.15s ease",
              outline: "none",
              letterSpacing: "-0.1px",
            }}
          >
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: meta.hex,
              flexShrink: 0,
              boxShadow: active ? `0 0 0 2px ${meta.hex}30` : "none",
              transition: "box-shadow 0.15s ease",
            }} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── number grid ─── */
function NumberGrid({
  numbers, selected, accentHex, onChange,
}: { numbers: string[]; selected: string; accentHex: string; onChange: (n: string) => void }) {
  const sorted = [...numbers].sort((a, b) => Number(a) - Number(b));
  return (
    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
      {sorted.map(n => {
        const active = selected === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: "44px",
              height: "44px",
              border: `1.5px solid ${active ? accentHex : "#E4E4E7"}`,
              borderRadius: "10px",
              background: active ? accentHex : "#FAFAFA",
              color: active ? "#fff" : "#3F3F46",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "monospace",
              transition: "all 0.15s ease",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: active ? "scale(1.06)" : "scale(1)",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/* ─── stat card ─── */
function StatCard({ label, value, warn, icon }: {
  label: string; value: React.ReactNode; warn?: boolean; icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${warn ? "#FDE68A" : "#E4E4E7"}`,
      borderRadius: "12px",
      padding: "16px 20px",
      flex: 1,
      minWidth: "110px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px", color: "#A1A1AA" }}>
        {icon}
        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: warn ? "13px" : "22px",
        fontWeight: warn ? 600 : 800,
        color: warn ? "#92400E" : "#10121A",
        fontFamily: warn ? "inherit" : "monospace",
        letterSpacing: warn ? "normal" : "-0.5px",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        {value}
      </div>
    </div>
  );
}

/* ─── service card ─── */
function ServiceCard({ s, index }: { s: Servicio; index: number }) {
  const fecha = new Date(s.created_at);
  const fechaStr = fecha.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
  const horaStr = fecha.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E4E4E7",
      borderRadius: "14px",
      padding: "20px 24px",
      animation: "fadeUp 0.3s ease both",
      animationDelay: `${index * 0.055}s`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px", flexWrap: "wrap" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "#A1A1AA",
          background: "#F4F4F5",
          padding: "2px 7px",
          borderRadius: "5px",
        }}>
          <IconHash size={10} />
          {s.id}
        </span>
      </div>

      <p style={{ fontSize: "15px", fontWeight: 600, color: "#10121A", marginBottom: "12px", lineHeight: 1.4 }}>
        {s.descripcion ?? (
          <span style={{ color: "#A1A1AA", fontStyle: "italic", fontWeight: 400 }}>Sin descripción</span>
        )}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#71717A" }}>
          <IconWrench />
          <span style={{ fontSize: "13px" }}>{s.mecanico}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#A1A1AA" }}>
          <IconCalendar />
          <span style={{ fontSize: "11px", fontFamily: "monospace" }}>{fechaStr} · {horaStr}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── skeleton card ─── */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const bar = (w: string, h: string, d = 0) => (
    <div style={{
      height: h,
      width: w,
      background: "#F4F4F5",
      borderRadius: "6px",
      animation: "pulse 1.4s infinite",
      animationDelay: `${d}s`,
    }} />
  );
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E4E4E7",
      borderRadius: "14px",
      padding: "20px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      animationDelay: `${delay}s`,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {bar("50px", "18px", 0)}
          {bar("70px", "18px", 0.05)}
        </div>
        {bar("60%", "20px", 0.1)}
        {bar("35%", "16px", 0.15)}
      </div>
    </div>
  );
}

/* ─── page ─── */
export default function Home() {
  const [colores, setColores] = useState<Record<string, string[]>>({});
  const [colorSel, setColorSel] = useState<string>("");
  const [numSel, setNumSel] = useState<string>("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    fetch("/api/tricimoto")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setColores(data); setLoadingInit(false); })
      .catch(() => setLoadingInit(false));
  }, []);

  const cargarServicios = useCallback(async (color: string, num: string) => {
    if (!color || !num) return;
    setLoading(true);
    const res = await fetch(`/api/servicios?color=${encodeURIComponent(color)}&num=${encodeURIComponent(num)}`);
    const data = await res.json();
    setServicios(data);
    setLoading(false);
  }, []);

  const handleColorChange = (color: string) => {
    setColorSel(color);
    setNumSel("");
    setServicios([]);
  };

  const handleNumChange = (num: string) => {
    setNumSel(num);
    cargarServicios(colorSel, num);
  };

  const numerosDisponibles = colorSel ? (colores[colorSel] || []) : [];
  const tienePendiente = servicios.some(s => parseFloat(s.monto_pendiente) > 0);
  const accentHex = TRIKE_COLORS[colorSel]?.hex ?? "#10121A";
  const coloresDisponibles = Object.keys(colores).sort();
  const showStats = colorSel && numSel && !loading && servicios.length > 0;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F4F4F5; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        button { font-family: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        button:active { transform: scale(0.96) !important; }
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
          gap: 36px;
          align-items: center;
        }
        .trike-bg {
          background: #F4F4F5;
          border-radius: 14px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 10/7;
        }
        .stats-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          animation: fadeUp 0.28s ease;
        }
        @media (max-width: 600px) {
          .hero-grid { grid-template-columns: 1fr; gap: 20px; }
          .trike-bg { max-width: 220px; margin: 0 auto; aspect-ratio: unset; height: 130px; }
          .page-main { padding: 20px 14px !important; }
          .page-nav { padding: 0 16px !important; }
          .page-footer { flex-direction: column; gap: 4px !important; }
          .hero-card { padding: 20px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F4F5", fontFamily: "Inter, system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>

        {/* ── Nav ── */}
        <nav className="page-nav" style={{
          background: "#fff",
          borderBottom: "1px solid #E4E4E7",
          padding: "0 32px",
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{
              width: "28px", height: "28px",
              background: "#10121A",
              borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 900, letterSpacing: "-0.5px" }}>R</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#10121A", letterSpacing: "-0.2px" }}>
              El Restaurador
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace", letterSpacing: "0.01em" }}>
            Historial de servicios
          </span>
        </nav>

        <main className="page-main" style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 20px 60px", flex: 1, width: "100%" }}>

          {/* ── Hero selector ── */}
          <div className="hero-card" style={{
            background: "#fff",
            border: "1px solid #E4E4E7",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "20px",
          }}>
            <div className="hero-grid">

              {/* Tricimoto preview */}
              <div className="trike-bg">
                <TricimotoSVG color={colorSel} />
              </div>

              {/* Selector panel */}
              <div>
                <p style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#A1A1AA",
                  marginBottom: "3px",
                }}>
                  El Restaurador
                </p>
                <h1 style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#10121A",
                  letterSpacing: "-0.6px",
                  lineHeight: 1.15,
                  marginBottom: "24px",
                }}>
                  Consulta de<br />servicios
                </h1>

                {/* Color */}
                <div style={{ marginBottom: "18px" }}>
                  <p style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#71717A",
                    marginBottom: "10px",
                  }}>
                    Color de tricimoto
                  </p>
                  {loadingInit ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[68, 58, 78, 52].map((w, i) => (
                        <div key={i} style={{
                          height: "34px",
                          width: `${w}px`,
                          background: "#F4F4F5",
                          borderRadius: "40px",
                          animation: "pulse 1.4s infinite",
                          animationDelay: `${i * 0.1}s`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <ColorSelector
                      colors={coloresDisponibles}
                      selected={colorSel}
                      onChange={handleColorChange}
                    />
                  )}
                </div>

                {/* Número */}
                {colorSel && (
                  <div style={{ animation: "fadeUp 0.2s ease" }}>
                    <p style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#71717A",
                      marginBottom: "10px",
                    }}>
                      Número
                    </p>
                    <NumberGrid
                      numbers={numerosDisponibles}
                      selected={numSel}
                      accentHex={accentHex}
                      onChange={handleNumChange}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Stats ── */}
          {showStats && (
            <div className="stats-row">
              <StatCard
                label="Servicios"
                value={String(servicios.length)}
                icon={<IconActivity />}
              />
              {tienePendiente && (
                <StatCard
                  label="Saldo pendiente"
                  warn
                  icon={<IconAlert />}
                  value={
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                      <IconAlert size={14} />
                      Tiene pagos pendientes
                    </span>
                  }
                />
              )}
              <div style={{
                background: "#fff",
                border: "1px solid #E4E4E7",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accentHex,
                  transition: "background 0.35s ease",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#10121A", fontFamily: "monospace", letterSpacing: "-0.3px" }}>
                  {numSel} {colorSel}
                </span>
              </div>
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
            <div style={{
              textAlign: "center",
              padding: "56px 24px",
              background: "#fff",
              border: "1px solid #E4E4E7",
              borderRadius: "16px",
              animation: "fadeUp 0.28s ease",
            }}>
              <div style={{
                width: "46px",
                height: "46px",
                background: "#F4F4F5",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                color: "#A1A1AA",
              }}>
                <IconWrench size={20} />
              </div>
              <p style={{ fontWeight: 700, color: "#10121A", fontSize: "15px", marginBottom: "5px" }}>
                Sin servicios registrados
              </p>
              <p style={{ color: "#A1A1AA", fontSize: "13px" }}>
                Esta tricimoto no tiene historial disponible.
              </p>
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
              <p style={{ color: "#A1A1AA", fontSize: "13px" }}>
                Selecciona una tricimoto para ver su historial
              </p>
            </div>
          )}

        </main>

        {/* ── Footer ── */}
        <footer className="page-footer" style={{
          borderTop: "1px solid #E4E4E7",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
        }}>
          <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace" }}>El Restaurador</span>
          <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace", textAlign: "center" }}>
            Desarrollado por Oscar Morán Gómez ·{" "}
            <a
              href="https://klyraworks.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#71717A", textDecoration: "none", borderBottom: "1px solid #D4D4D8" }}
            >
              Klyra Works
            </a>
          </span>
          <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "monospace" }}>Solo lectura · Datos en tiempo real</span>
        </footer>

      </div>
    </>
  );
}