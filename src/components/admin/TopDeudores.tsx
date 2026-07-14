interface Deudor {
    tricimoto_num: string;
    tricimoto_compania: string;
    pendiente: string;
    servicios_pendientes: string;
}

export default function TopDeudores({data}: { data: Deudor[] }) {
    const maxPendiente = Math.max(...data.map(d => Number(d.pendiente)), 1);

    return (
        <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
            <div style={{padding: "16px 20px", borderBottom: "1px solid #E4E4E7"}}>
                <h2 style={{fontSize: "14px", fontWeight: 700, color: "#10121A"}}>Top deudores</h2>
            </div>
            <div style={{padding: "6px 20px 16px"}}>
                {data.length === 0 && (
                    <p style={{fontSize: "12px", color: "#A1A1AA", textAlign: "center", padding: "20px 0"}}>Sin deudas pendientes</p>
                )}
                {data.map((d, i) => {
                    const pct = (Number(d.pendiente) / maxPendiente) * 100;
                    return (
                        <div key={`${d.tricimoto_num}-${d.tricimoto_compania}`} style={{padding: "10px 0", borderBottom: i < data.length - 1 ? "1px solid #F4F4F5" : "none"}}>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px"}}>
                                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                                    <span style={{
                                        width: "18px", height: "18px", borderRadius: "5px", background: "#F4F4F5", color: "#71717A",
                                        fontSize: "10px", fontWeight: 700, fontFamily: "monospace",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>{i + 1}</span>
                                    <span style={{fontSize: "13px", fontWeight: 600, color: "#10121A"}}>{d.tricimoto_num}</span>
                                    <span style={{fontSize: "11px", color: "#A1A1AA"}}>{d.tricimoto_compania}</span>
                                    <span style={{fontSize: "11px", color: "#A1A1AA"}}>· {d.servicios_pendientes} serv.</span>
                                </div>
                                <span style={{fontSize: "13px", fontWeight: 700, fontFamily: "monospace", color: "#991B1B"}}>${Number(d.pendiente).toFixed(2)}</span>
                            </div>
                            <div style={{height: "4px", borderRadius: "2px", background: "#F4F4F5", overflow: "hidden"}}>
                                <div style={{height: "100%", width: `${pct}%`, borderRadius: "2px", background: "#EF4444"}}/>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}