import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await query(`
    SELECT DISTINCT tricimoto_color, tricimoto_num
    FROM servicios
    WHERE is_active = TRUE AND estado != 'anulado'
    ORDER BY tricimoto_color, tricimoto_num
  `);

  const colores: Record<string, string[]> = {};
  for (const row of rows as { tricimoto_color: string; tricimoto_num: string }[]) {
    if (!colores[row.tricimoto_color]) colores[row.tricimoto_color] = [];
    colores[row.tricimoto_color].push(row.tricimoto_num);
  }

  return NextResponse.json(colores);
}