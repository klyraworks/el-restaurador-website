import {auth} from "@/auth";
import {query} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || !["admin", "jefe"].includes(session.user.rol)) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const compania = req.nextUrl.searchParams.get("compania") ?? "";
    if (!compania) return NextResponse.json({rows: []});

    const rows = await query<{ tricimoto_num: string }>(`
        SELECT DISTINCT tricimoto_num
        FROM servicios
        WHERE tricimoto_compania = $1 AND deleted_at IS NULL
        ORDER BY tricimoto_num
    `, [compania]);

    return NextResponse.json({rows: rows.map(r => r.tricimoto_num)});
}