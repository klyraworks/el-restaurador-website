import {auth} from "@/auth";
import {query, queryOne} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || session.user.rol !== "admin") return null;
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

    const rows = await query(`
        SELECT id, telegram_id, username, nombre, rol, is_active, created_at
        FROM usuarios
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `);

    return NextResponse.json({rows});
}

export async function POST(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const {telegram_id, username, nombre, rol, password} = await req.json();
    if (!telegram_id || !nombre || !rol || !password) {
        return NextResponse.json({error: "Faltan campos requeridos"}, {status: 400});
    }

    const ROLES_VALIDOS = ["admin", "jefe", "mecanico"] as const;
    if (!ROLES_VALIDOS.includes(rol)) {
        return NextResponse.json({error: "Rol inválido"}, {status: 400});
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const row = await queryOne<{ id: number }>(`
        INSERT INTO usuarios (telegram_id, username, nombre, rol, password_hash)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [telegram_id, username ?? null, nombre, rol, password_hash]);

    await log("CREATE", "usuarios", row!.id, `Usuario creado: ${nombre} (${rol})`, session.user.id);
    return NextResponse.json({id: row!.id}, {status: 201});
}

export async function PATCH(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const {id, nombre, rol, username, is_active, password} = await req.json();
    if (!id) return NextResponse.json({error: "ID requerido"}, {status: 400});

    const ROLES_VALIDOS = ["admin", "jefe", "mecanico"] as const;
    if (!ROLES_VALIDOS.includes(rol)) {
        return NextResponse.json({error: "Rol inválido"}, {status: 400});
    }

    if (password) {
        const password_hash = await bcrypt.hash(password, 12);
        await query(
            `UPDATE usuarios
             SET nombre=$1,
                 rol=$2,
                 username=$3,
                 is_active=$4,
                 password_hash=$5
             WHERE id = $6
               AND deleted_at IS NULL`,
            [nombre, rol, username ?? null, is_active, password_hash, id]
        );
    } else {
        await query(
            `UPDATE usuarios
             SET nombre=$1,
                 rol=$2,
                 username=$3,
                 is_active=$4
             WHERE id = $5
               AND deleted_at IS NULL`,
            [nombre, rol, username ?? null, is_active, id]
        );
    }

    await log("UPDATE", "usuarios", id, `Usuario actualizado: ${nombre}`, session.user.id);
    return NextResponse.json({ok: true});
}

export async function DELETE(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({error: "No autorizado"}, {status: 401});

    const {id} = await req.json();
    if (!id) return NextResponse.json({error: "ID requerido"}, {status: 400});

    if (String(id) === session.user.id) {
        return NextResponse.json({error: "No puedes eliminar tu propio usuario"}, {status: 400});
    }

    await query(`UPDATE usuarios
                 SET deleted_at=NOW(),
                     is_active= false
                 WHERE id = $1`, [id]);
    await log("DELETE", "usuarios", id, `Usuario eliminado`, session.user.id);
    return NextResponse.json({ok: true});
}