import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Rol = "admin" | "jefe" | "mecanico";

/** Obtiene la sesión y redirige a login si no existe o el rol no está permitido */
export async function requireRol(...roles: Rol[]) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!roles.includes(session.user.rol)) redirect("/admin/login");
  return session;
}

/** Shorthand para rutas solo-admin */
export const requireAdmin = () => requireRol("admin", "jefe");