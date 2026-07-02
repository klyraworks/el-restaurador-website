# Taller El Restaurador — Web

Portal público de consulta de historial de servicios por tricimoto. Conecta directamente a la base de datos PostgreSQL del bot de Telegram.

---

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **pg** — cliente PostgreSQL
- **Vercel** — deploy

---

## Estructura

```
taller-web/
├── src/
│   └── app/
│       ├── api/
│       │   ├── tricimoto/route.ts   # Colores y números disponibles
│       │   └── servicios/route.ts   # Servicios por tricimoto
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx                 # UI principal
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## Funcionalidad

- Selección de compañía/color de tricimoto → carga automática de números disponibles
- Selección de número → carga historial de servicios
- Cards por servicio con: descripción, mecánico, monto total, monto pendiente, estado, fecha
- Resumen estadístico: total de servicios, total cobrado, pendiente
- SVG de tricimoto que cambia de color según la selección
- Solo lectura — sin autenticación

---

## Variables de entorno

### Local (`.env.local`)
```
DATABASE_URL=postgresql://... (usar DATABASE_PUBLIC_URL de Railway)
```

### Producción (Vercel)
```
DATABASE_URL=postgresql://... (usar DATABASE_PUBLIC_URL de Railway)
```

> ⚠️ En Vercel usar la `DATABASE_PUBLIC_URL`, no la interna `railway.internal`.

---

## Desarrollo local

```bash
pnpm install
pnpm approve-builds
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Agrega variable de entorno `DATABASE_URL` con la `DATABASE_PUBLIC_URL` de Railway
4. Deploy automático en cada push a `main`

---

## Relación con el bot

Comparte la misma base de datos PostgreSQL del bot de Telegram. La web solo hace consultas de lectura (`SELECT`) — nunca escribe ni modifica datos.

| Dato | Fuente |
|---|---|
| Tricimoto compañía/color | Tabla `servicios` |
| Historial de servicios | Tabla `servicios` JOIN `usuarios` |

---

## Notas

- Los servicios con `is_active = FALSE` o `estado = 'anulado'` no se muestran
- Los datos son en tiempo real — no hay caché