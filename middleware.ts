import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/auth/login",
    "/auth/registro",
    "/auth/verificar-email",
    "/auth/recuperar",
    "/landing",
    "/precios",
    "/caracteristicas",
    "/contacto",
    "/terminos",
    "/privacidad",
  ]

  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado
  if (user) {
    // Verificar que el usuario existe en la tabla usuarios
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id, organizacion_id, rol, estado, organizaciones(estado)")
      .eq("id", user.id)
      .single()

    if (!usuario) {
      // Usuario no encontrado en la tabla, cerrar sesión y redirigir
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/auth/login?error=usuario-no-encontrado", request.url))
    }

    // Verificar estado del usuario
    if (usuario.estado !== "activo") {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/auth/login?error=usuario-inactivo", request.url))
    }

    // Verificar estado de la organización
    if (usuario.organizaciones && usuario.organizaciones.estado !== "activa") {
      // Organización suspendida o cancelada
      if (request.nextUrl.pathname !== "/cuenta/suspendida") {
        return NextResponse.redirect(new URL("/cuenta/suspendida", request.url))
      }
    }

    // Si va a rutas de autenticación, redirigir al dashboard
    if (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/registro")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Agregar headers con información del usuario
    response.headers.set("x-user-id", user.id)
    response.headers.set("x-user-role", usuario.rol)
    response.headers.set("x-org-id", usuario.organizacion_id)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
