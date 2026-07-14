const COLORES_DOT: Record<string, string> = {"19 de Mayo": "#EF4444", "Comtrilamana": "#22C55E", "Quilotoa": "#EAB308", "Patria Vuelve": "#3B82F6", "Taxsancar": "#EF4444"};

interface CompaniaStat {
    compania: string;
    total_servicios: string;
    cobrado: string;
    pendiente: string;
}

export default function CompanyBreakdown({data}: { data: CompaniaStat[] }) {
    const maxCobrado = Math.max(...data.map(c => Number(c.cobrado)), 1);

    return (
        <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
            <div style={{padding: "16px 20px", borderBottom: "1px solid #E4E4E7"}}>
                <h2 style={{fontSize: "14px", fontWeight: 700, color: "#10121A"}}>Desglose por compañía</h2>
            </div>
            <div style={{padding: "6px 20px 16px"}}>
                {data.map((c, i) => {
                    const pct = (Number(c.cobrado) / maxCobrado) * 100;
                    return (
                        <div key={c.compania} style={{padding: "10px 0", borderBottom: i < data.length - 1 ? "1px solid #F4F4F5" : "none"}}>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px"}}>
                                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                                    <span style={{width: "8px", height: "8px", borderRadius: "50%", background: COLORES_DOT[c.compania] ?? "#A1A1AA"}}/>
                                    <span style={{fontSize: "13px", fontWeight: 600, color: "#10121A"}}>{c.compania}</span>
                                    <span style={{fontSize: "11px", color: "#A1A1AA"}}>{c.total_servicios} serv.</span>
                                </div>
                                <div style={{display: "flex", gap: "10px", fontSize: "12px", fontFamily: "monospace"}}>
                                    <span style={{color: "#166534", fontWeight: 700}}>${Number(c.cobrado).toFixed(2)}</span>
                                    {Number(c.pendiente) > 0 && (
                                        <span style={{color: "#991B1B"}}>${Number(c.pendiente).toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{height: "4px", borderRadius: "2px", background: "#F4F4F5", overflow: "hidden"}}>
                                <div style={{height: "100%", width: `${pct}%`, borderRadius: "2px", background: COLORES_DOT[c.compania] ?? "#A1A1AA"}}/>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}