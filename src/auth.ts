import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { authConfig } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: "admin" | "jefe" | "mecanico";
      nombre: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
  interface User {
    rol: "admin" | "jefe" | "mecanico";
    nombre: string;
  }
}

interface UsuarioDB {
  id: number;
  nombre: string;
  rol: "admin" | "jefe" | "mecanico";
  password_hash: string | null;
  is_active: boolean;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {

        if (!credentials?.username || !credentials?.password) return null;
        const username = String(credentials.username);
        const password = String(credentials.password);

        const user = await queryOne<UsuarioDB>(
            `SELECT id, nombre, rol, password_hash, is_active
             FROM usuarios
             WHERE username = $1
               AND deleted_at IS NULL`,
            [username]
        );

        if (!user || !user.is_active || !user.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.nombre,
          nombre: user.nombre,
          rol: user.rol,
        };
      },
    }),
  ],
});