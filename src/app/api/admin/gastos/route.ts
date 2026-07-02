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
  const tipo = searchParams.get("tipo") ?? "";
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = ["g.deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;
  if (tipo) { conditions.push(`g.tipo = $${i++}`); params.push(tipo); }
  const where = conditions.join(" AND ");

  const rows = await query(`
    SELECT g.id, g.tipo, g.monto, g.descripcion, g.created_at, u.nombre AS registrado_por
    FROM gastos g
    JOIN usuarios u ON u.id = g.registrado_por
    WHERE ${where}
    ORDER BY g.created_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `, [...params, limit, offset]);

  const [{ total }] = await query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM gastos g WHERE ${where}`, params
  );

  return NextResponse.json({ rows, total: parseInt(total), page, limit });
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { tipo, monto, descripcion } = await req.json();
  if (!tipo || !monto) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const row = await queryOne<{ id: number }>(`
    INSERT INTO gastos (tipo, monto, descripcion, registrado_por)
    VALUES ($1,$2,$3,$4) RETURNING id
  `, [tipo, monto, descripcion ?? null, session.user.id]);

  await log("CREATE", "gastos", row!.id, `${tipo} de $${monto}`, session.user.id);
  return NextResponse.json({ id: row!.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, tipo, monto, descripcion } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await query(`
    UPDATE gastos SET tipo=$1, monto=$2, descripcion=$3 WHERE id=$4 AND deleted_at IS NULL
  `, [tipo, monto, descripcion ?? null, id]);

  await log("UPDATE", "gastos", id, `Gasto actualizado`, session.user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await query(`UPDATE gastos SET deleted_at=NOW(), is_active=false WHERE id=$1`, [id]);
  await log("DELETE", "gastos", id, `Gasto eliminado`, session.user.id);
  return NextResponse.json({ ok: true });
}