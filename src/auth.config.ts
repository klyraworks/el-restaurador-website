import type {NextAuthConfig} from "next-auth";

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({auth, request: {nextUrl}}) {
            const {pathname} = nextUrl;
            const rol = (auth?.user as { rol?: string } | undefined)?.rol;

            const isProtected =
                (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
                pathname.startsWith("/api/admin");

            if (isProtected) {
                if (!auth) return false;
                if (pathname.startsWith("/admin") && pathname !== "/admin/login" && rol !== "admin" && rol !== "jefe") return false;
            }

            return true;
        },
        jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.rol = (user as { rol: string }).rol;
                token.nombre = (user as { nombre: string }).nombre;
            }
            return token;
        },
        session({session, token}) {
            session.user.id = token.id as string;
            (session.user as { rol: string }).rol = token.rol as string;
            (session.user as { nombre: string }).nombre = token.nombre as string;
            return session;
        },
    },
    providers: [],
    session: {strategy: "jwt"},
};