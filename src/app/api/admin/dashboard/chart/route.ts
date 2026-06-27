import {auth} from "@/auth";
import {query} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
        const session = await auth();
        if (!session?.user || session.user.rol !== "admin") return NextResponse.json({}, {status: 401});

        const period = parseInt(req.nextUrl.searchParams.get("period") ?? "30");

        console.log("Periodo: ", period);

        const ingresos = await query<{ fecha: string; total: string }>(`
            SELECT DATE (created_at)::text AS fecha, SUM (monto_total - monto_pendiente) AS total
            FROM servicios
            WHERE deleted_at IS NULL
              AND estado != 'anulado'
              AND created_at >= NOW() - INTERVAL '${period} days'
            GROUP BY DATE (created_at)
            ORDER BY fecha
        `);

        const egresos = await query<{ fecha: string; gastos: string; adelantos: string }>(`
            SELECT DATE (created_at)::text AS fecha, SUM (CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS gastos, SUM (CASE WHEN tipo = 'adelanto' THEN monto ELSE 0 END) AS adelantos
            FROM gastos
            WHERE deleted_at IS NULL
              AND created_at >= NOW() - INTERVAL '${period} days'
            GROUP BY DATE (created_at)
            ORDER BY fecha
        `);

        // Merge por fecha
        const map: Record<string, {
            fecha: string;
            ingresos: number;
            gastos: number;
            adelantos: number;
            neto: number
        }> = {};

        for (const r of ingresos) {
            map[r.fecha] = {fecha: r.fecha, ingresos: Number(r.total), gastos: 0, adelantos: 0, neto: 0};
        }
        for (const r of egresos) {
            if (!map[r.fecha]) map[r.fecha] = {fecha: r.fecha, ingresos: 0, gastos: 0, adelantos: 0, neto: 0};
            map[r.fecha].gastos = Number(r.gastos);
            map[r.fecha].adelantos = Number(r.adelantos);
        }
        for (const k of Object.keys(map)) {
            map[k].neto = map[k].ingresos - map[k].gastos - map[k].adelantos;
        }

        const data = Object.values(map).sort((a, b) => a.fecha.localeCompare(b.fecha));
        return NextResponse.json(data);
}