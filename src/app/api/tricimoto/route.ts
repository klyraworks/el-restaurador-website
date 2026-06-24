import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT DISTINCT tricimoto_color, tricimoto_num
      FROM servicios
      WHERE is_active = TRUE AND estado != 'anulado'
      ORDER BY tricimoto_color, tricimoto_num
    `);

    const colores: Record<string, string[]> = {};
    for (const row of rows) {
      if (!colores[row.tricimoto_color]) colores[row.tricimoto_color] = [];
      colores[row.tricimoto_color].push(row.tricimoto_num);
    }

    return NextResponse.json(colores);
  } finally {
    client.release();
  }
}
