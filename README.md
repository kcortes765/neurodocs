# NeuroDoc Automator

Aplicacion Next.js para registro de pacientes, atenciones y eventos quirurgicos con generacion de PDFs.

## Requisitos

- Node.js 18+ (recomendado 20)
- npm

## Arranque rapido (desde cero)

1. npm install
2. npm run setup
3. npm run dev
4. abrir http://localhost:3000

## Debug rapido

- npm run doctor (verifica Node, DB y plantillas)
- npm run dev:doctor (doctor + servidor dev)

## Bootstrap (todo en uno)

npm run bootstrap

## Base de datos

- SQLite via Prisma
- DATABASE_URL en .env (si no existe, copiar .env.example)
- Para inicializar: npm run db:push

## Deploy en Vercel

SQLite en archivo no es persistente en Vercel. Usa una DB externa (Turso/LibSQL) y configura estas variables:

- DATABASE_URL="libsql://<tu-db>.turso.io"
- DATABASE_AUTH_TOKEN="..."
- NEXTAUTH_URL="https://<tu-proyecto>.vercel.app"
- NEXTAUTH_SECRET="..."
- AUTH_USER="admin"
- AUTH_PASSWORD="..."

Luego corre `npx prisma db push` apuntando a esa URL para crear el schema.

## Datos de prueba

- En la pantalla principal: "Generar datos de prueba"
- O via API: POST /api/seed con {"pacientes": 20, "atencionesPorPaciente": 2}

## Automatizacion de deteccion y correccion

- npm run check (lint + typecheck + prisma validate)
- npm run fix (eslint --fix + prisma format)

## Otros comandos

- npm run lint
- npm run typecheck
- npm run build
- npm run start

## CI

GitHub Actions ejecuta npm run check en cada push y PR.
