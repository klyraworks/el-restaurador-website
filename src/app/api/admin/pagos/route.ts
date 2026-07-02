import { auth } from "@/auth";
import { query, queryOne } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || !["admin", "jefe"].includes(session.user.rol)) return null;
  return session;
}

async function log(accion: string, tabla: string, registro_id: number | null, detalle: string, userId: string) {
  await query(
    `INSERT INTO logs (accion, tabla, registro_id, detalle, registrado_por) VALUES ($1,$2,$3,$4,$5)`,
    [accion, tabla, registro_id, detalle, userId]
  );
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const rows = await query(`
    SELECT
      p.id, p.monto, p.created_at,
      p.servicio_id,
      s.tricimoto_num, s.tricimoto_compania,
      u.nombre AS registrado_por
    FROM pagos p
    JOIN servicios s ON s.id = p.servicio_id
    JOIN usuarios u ON u.id = p.registrado_por
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const [{ total }] = await query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM pagos WHERE deleted_at IS NULL`
  );

  return NextResponse.json({ rows, total: parseInt(total), page, limit });
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { servicio_id, monto } = await req.json();
  if (!servicio_id || !monto) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const row = await queryOne<{ id: number }>(`
    INSERT INTO pagos (servicio_id, monto, registrado_por)
    VALUES ($1,$2,$3) RETURNING id
  `, [servicio_id, monto, session.user.id]);

  await query(`
    UPDATE servicios SET
      monto_pendiente = GREATEST(0, monto_pendiente - $1),
      estado = CASE WHEN GREATEST(0, monto_pendiente - $1) = 0 THEN 'pagado' ELSE estado END
    WHERE id = $2 AND deleted_at IS NULL
  `, [monto, servicio_id]);

  await log("CREATE", "pagos", row!.id, `Pago de $${monto} para servicio #${servicio_id}`, session.user.id);
  return NextResponse.json({ id: row!.id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await query(`UPDATE pagos SET deleted_at=NOW(), is_active=false WHERE id=$1`, [id]);
  await log("DELETE", "pagos", id, `Pago eliminado`, session.user.id);
  return NextResponse.json({ ok: true });
}