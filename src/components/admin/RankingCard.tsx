interface RankingItem {
    rank: number;
    label: string;
    sublabel?: string;
    value: string;
    dotColor?: string;
    percent: number; // 0-100, relativo al máximo del set
}

export default function RankingCard({title, icon, items, barColor = "#10121A"}: {
    title: string;
    icon: React.ReactNode;
    items: RankingItem[];
    barColor?: string;
}) {
    return (
        <div style={{background: "#fff", border: "1px solid #E4E4E7", borderRadius: "14px", overflow: "clip"}}>
            <div style={{padding: "16px 20px", borderBottom: "1px solid #E4E4E7", display: "flex", alignItems: "center", gap: "7px"}}>
                <span style={{color: "#A1A1AA"}}>{icon}</span>
                <h2 style={{fontSize: "14px", fontWeight: 700, color: "#10121A"}}>{title}</h2>
            </div>
            <div style={{padding: "6px 20px 16px"}}>
                {items.length === 0 && (
                    <p style={{fontSize: "12px", color: "#A1A1AA", textAlign: "center", padding: "20px 0"}}>Sin datos</p>
                )}
                {items.map((it, i) => (
                    <div key={`${it.label}-${it.rank}`} style={{padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #F4F4F5" : "none"}}>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px"}}>
                            <div style={{display: "flex", alignItems: "center", gap: "8px", minWidth: 0}}>
                                <span style={{
                                    width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                                    background: "#F4F4F5", color: "#71717A",
                                    fontSize: "10px", fontWeight: 700, fontFamily: "monospace",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>{it.rank}</span>
                                {it.dotColor && (
                                    <span style={{width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: it.dotColor}}/>
                                )}
                                <span style={{fontSize: "13px", fontWeight: 600, color: "#10121A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                    {it.label}
                                </span>
                                {it.sublabel && (
                                    <span style={{fontSize: "11px", color: "#A1A1AA", flexShrink: 0}}>{it.sublabel}</span>
                                )}
                            </div>
                            <span style={{fontSize: "13px", fontWeight: 700, fontFamily: "monospace", color: "#10121A", flexShrink: 0, marginLeft: "8px"}}>
                                {it.value}
                            </span>
                        </div>
                        <div style={{height: "4px", borderRadius: "2px", background: "#F4F4F5", overflow: "hidden"}}>
                            <div style={{height: "100%", width: `${it.percent}%`, borderRadius: "2px", background: barColor}}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}