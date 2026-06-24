import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const color = searchParams.get("color");
  const num = searchParams.get("num");

  if (!color || !num) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        s.id,
        s.created_at,
        s.monto_total,
        s.monto_pendiente,
        s.descripcion,
        s.estado,
        u.nombre AS mecanico
      FROM servicios s
      JOIN usuarios u ON s.mecanico_id = u.id
      WHERE s.tricimoto_color = $1
        AND s.tricimoto_num = $2
        AND s.is_active = TRUE
        AND s.estado != 'anulado'
      ORDER BY s.created_at DESC
    `, [color, num]);

    return NextResponse.json(rows);
  } finally {
    client.release();
  }
}
