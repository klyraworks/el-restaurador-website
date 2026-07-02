import {auth} from "@/auth";
import {query, queryOne} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || !["admin", "jefe"].includes(session.user.rol)) return null;
    return session;
}

async function log(accion: string, tabla: string, registro_id: number | null, detalle: string, userId: string) {
    await query(
        `INSERT INTO logs (accion, tabla, registro_id, detalle, registrado_por)
         VALUES ($1, $2, $3, $4, $5)`,
        [accion, tabla, registro_id, detalle, userId]
    );
}

export async function GET(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const {searchParams} = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;
    const offset = (page - 1) * limit;
    const estado = searchParams.get("estado") ?? "";
    const color = searchParams.get("color") ?? "";

    const conditions = ["s.deleted_at IS NULL"];
    const params: unknown[] = [];
    let i = 1;
    if (estado) {
        conditions.push(`s.estado = $${i++}`);
        params.push(estado);
    }
    if (color) {
        conditions.push(`s.tricimoto_compania = $${i++}`);
        params.push(color);
    }

    const where = conditions.join(" AND ");

    const rows = await query(`
        SELECT s.id,
               s.tricimoto_num,
               s.tricimoto_compania,
               s.descripcion,
               s.monto_total,
               s.monto_pendiente,
               s.estado,
               s.created_at,
               u.nombre AS mecanico,
               u.id     AS mecanico_id,
               r.nombre AS registrado_por
        FROM servicios s
                 JOIN usuarios u ON u.id = s.mecanico_id
                 JOIN usuarios r ON r.id = s.registrado_por
        WHERE ${where}
        ORDER BY s.created_at DESC LIMIT $${i++}
        OFFSET $${i++}
    `, [...params, limit, offset]);

    const [{total}] = await query<{ total: string }>(
        `SELECT COUNT(*) AS total
         FROM servicios s
         WHERE ${where}`, params
    );

    return NextResponse.json({rows, total: parseInt(total), page, limit});
}

export async function POST(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const body = await req.json();
    const {tricimoto_num, tricimoto_compania, monto_total, monto_pendiente, descripcion, mecanico_id, estado} = body;

    const estadoFinal = (!monto_pendiente || monto_pendiente === 0) ? "pagado" : "pendiente";

    if (
        !tricimoto_num ||
        !tricimoto_compania ||
        monto_total === undefined || monto_total === null ||
        !mecanico_id
    ) {
        return NextResponse.json({error: "Faltan campos requeridos"}, {status: 400});
    }

    const row = await queryOne<{ id: number }>(`
        INSERT INTO servicios (tricimoto_num, tricimoto_compania, monto_total, monto_pendiente, descripcion, mecanico_id,
                               registrado_por, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `, [tricimoto_num, tricimoto_compania, monto_total, monto_pendiente, descripcion ?? null, mecanico_id, session.user.id, estadoFinal]);

    await log("CREATE", "servicios", row!.id, `Servicio creado: ${tricimoto_compania} #${tricimoto_num}`, session.user.id);
    return NextResponse.json({id: row!.id}, {status: 201});
}

export async function PATCH(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const body = await req.json();
    const {id, tricimoto_num, tricimoto_compania, monto_total, monto_pendiente, descripcion, mecanico_id, estado} = body;

    const estadoFinal = (!monto_pendiente || monto_pendiente === 0) ? "pagado" : (estado ?? "pendiente");

    if (!id) return NextResponse.json({error: "ID requerido"}, {status: 400});

    await query(`
        UPDATE servicios
        SET tricimoto_num=$1,
            tricimoto_compania=$2,
            monto_total=$3,
            monto_pendiente=$4,
            descripcion=$5,
            mecanico_id=$6,
            estado=$7
        WHERE id = $8
          AND deleted_at IS NULL
    `, [tricimoto_num, tricimoto_compania, monto_total, monto_pendiente, descripcion ?? null, mecanico_id, estado, id]);

    await log("UPDATE", "servicios", id, `Servicio actualizado`, session.user.id);
    return NextResponse.json({ok: true});
}

export async function DELETE(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const {id} = await req.json();
    if (!id) return NextResponse.json({error: "ID requerido"}, {status: 400});

    await query(`UPDATE servicios
                 SET deleted_at=NOW(),
                     is_active= false
                 WHERE id = $1`, [id]);
    await log("DELETE", "servicios", id, `Servicio eliminado`, session.user.id);
    return NextResponse.json({ok: true});
}