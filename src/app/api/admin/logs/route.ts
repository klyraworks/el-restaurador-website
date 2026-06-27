import { auth } from "@/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const tabla = searchParams.get("tabla") ?? "";
  const limit = 30;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (tabla) { conditions.push(`l.tabla = $${i++}`); params.push(tabla); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await query(`
    SELECT l.id, l.accion, l.tabla, l.registro_id, l.detalle, l.created_at,
           u.nombre AS usuario
    FROM logs l
    LEFT JOIN usuarios u ON u.id = l.registrado_por
    ${where}
    ORDER BY l.created_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `, [...params, limit, offset]);

  const [{ total }] = await query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM logs l ${where}`, params
  );

  return NextResponse.json({ rows, total: parseInt(total), page, limit });
}