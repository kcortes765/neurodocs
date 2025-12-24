import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas publicas que no requieren autenticacion (temporalmente para setup)
  const publicPaths = [
    "/login",
    "/api/auth",
    "/api/clinicas",
    "/api/documentos",
    "/api/plantillas",
    "/api/pacientes",
    "/api/seed",
    "/api/eventos-quirurgicos",
    "/api/atenciones",
    "/api/procedimientos",
    "/api/equipos-medicos",
  ]

  // Verificar si es una ruta publica
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Permitir archivos estaticos y API routes de auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    isPublicPath
  ) {
    return NextResponse.next()
  }

  // Verificar token de sesion
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "neurodoc-secret-key-change-in-production",
  })

  // Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
}
