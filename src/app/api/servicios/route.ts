import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const color = searchParams.get("color");
  const num   = searchParams.get("num");

  if (!color || !num) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  const rows = await query(`
    SELECT s.id, s.created_at, s.descripcion, s.estado, s.monto_pendiente,
           u.nombre AS mecanico
    FROM servicios s
    JOIN usuarios u ON s.mecanico_id = u.id
    WHERE s.tricimoto_compania = $1
      AND s.tricimoto_num   = $2
      AND s.is_active = TRUE
      AND s.estado != 'anulado'
    ORDER BY s.created_at DESC
  `, [color, num]);

  return NextResponse.json(rows);
}