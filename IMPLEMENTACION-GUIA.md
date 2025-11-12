# Guía de Implementación - Sistema SaaS Multi-Tenant

## ✅ Lo que ya está listo

### 1. Base de Datos (SQL)
- ✅ `scripts/100_multi_tenant_schema.sql` - Schema completo multi-tenant
- ✅ `scripts/101_rls_policies.sql` - Políticas de seguridad RLS

### 2. TypeScript Types
- ✅ `lib/types.ts` - Todos los tipos e interfaces
- ✅ Sistema de permisos por rol incluido

### 3. Documentación
- ✅ `PLAN-PRODUCCION.md` - Plan completo del proyecto
- ✅ `IMPLEMENTACION-GUIA.md` - Esta guía

## 📋 Próximos Pasos (En orden de prioridad)

### FASE 1: Configurar Supabase (CRÍTICO)

#### Paso 1.1: Ejecutar Scripts SQL
```bash
# En el dashboard de Supabase > SQL Editor:
1. Ejecutar scripts/100_multi_tenant_schema.sql
2. Ejecutar scripts/101_rls_policies.sql
3. Verificar que todas las tablas se crearon correctamente
```

#### Paso 1.2: Configurar Auth
```bash
# En Supabase Dashboard > Authentication > Providers:
1. Habilitar Email Provider
2. Configurar Email Templates (welcome, confirm email, etc.)
3. Opcional: Habilitar Google/GitHub OAuth
```

#### Paso 1.3: Variables de Entorno
Crear `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (opcional por ahora)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### FASE 2: Actualizar Helpers de Supabase

#### Crear `lib/supabase/auth-helpers.ts`
```typescript
import { createClient } from "@/lib/supabase/server"
import { Usuario, Permisos, obtenerPermisos } from "@/lib/types"
import { cache } from "react"

// Obtener usuario actual con su organización
export const obtenerUsuarioActual = cache(async (): Promise<Usuario | null> => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single()

  return usuario
})

// Obtener permisos del usuario actual
export const obtenerPermisosUsuario = cache(async (): Promise<Permisos | null> => {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) return null

  return obtenerPermisos(usuario.rol)
})

// Verificar si el usuario tiene un permiso específico
export async function verificarPermiso(permiso: keyof Permisos): Promise<boolean> {
  const permisos = await obtenerPermisosUsuario()
  if (!permisos) return false

  return permisos[permiso]
}

// Middleware helper para proteger rutas
export async function requireAuth() {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) {
    throw new Error("No autenticado")
  }
  return usuario
}

// Middleware helper para verificar rol
export async function requireRole(...roles: string[]) {
  const usuario = await requireAuth()
  if (!roles.includes(usuario.rol)) {
    throw new Error("No autorizado")
  }
  return usuario
}
```

### FASE 3: Crear Páginas de Autenticación

#### `app/auth/login/page.tsx`
```typescript
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  )
}
```

#### `app/auth/registro/page.tsx`
```typescript
import { RegistroForm } from "@/components/auth/registro-form"

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <RegistroForm />
    </div>
  )
}
```

#### `components/auth/login-form.tsx`
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  )
}
```

### FASE 4: Actualizar Middleware

#### `middleware.ts`
```typescript
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

  // Rutas públicas
  const publicRoutes = ["/", "/auth/login", "/auth/registro", "/landing"]
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Si está autenticado y va a login/registro, redirigir a dashboard
  if (user && (request.nextUrl.pathname === "/auth/login" ||
               request.nextUrl.pathname === "/auth/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

### FASE 5: Actualizar Páginas Existentes

Todas las páginas actuales (`app/page.tsx`, `app/productos/page.tsx`, etc.) necesitan:

1. **Obtener el usuario actual:**
```typescript
import { requireAuth } from "@/lib/supabase/auth-helpers"

export default async function ProductosPage() {
  const usuario = await requireAuth()
  // ... resto del código
}
```

2. **Filtrar por organizacion_id:**
```typescript
const { data: productos } = await supabase
  .from("productos")
  .select("*")
  .eq("organizacion_id", usuario.organizacion_id)
```

3. **Agregar organizacion_id al crear registros:**
```typescript
await supabase.from("productos").insert({
  ...productoData,
  organizacion_id: usuario.organizacion_id,
  usuario_creador_id: usuario.id
})
```

### FASE 6: Crear Módulos Nuevos

#### Módulo de Clientes
1. Crear `app/clientes/page.tsx`
2. Crear `components/clientes/clientes-table.tsx`
3. Crear `components/clientes/cliente-form.tsx`
4. Crear `app/clientes/[id]/page.tsx` (detalle del cliente)

#### Módulo de Categorías
1. Crear `app/categorias/page.tsx`
2. Crear `components/categorias/categorias-tree.tsx`
3. Crear `components/categorias/categoria-form.tsx`

#### Módulo de Proveedores
1. Crear `app/proveedores/page.tsx`
2. Crear `components/proveedores/proveedores-table.tsx`
3. Crear `components/proveedores/proveedor-form.tsx`

#### Módulo de Compras
1. Crear `app/compras/page.tsx`
2. Crear `app/compras/nueva/page.tsx`
3. Crear `components/compras/compra-form.tsx`

### FASE 7: Dashboard Mejorado con Analytics

#### Instalar dependencias para gráficos:
```bash
npm install recharts date-fns
```

#### Actualizar `app/dashboard/page.tsx` con gráficos avanzados
- Gráfico de ventas por día (últimos 30 días)
- Gráfico de productos más vendidos
- Gráfico de ventas por método de pago
- Tabla de clientes top

### FASE 8: Sistema de Reportes

#### Instalar dependencias para exportar:
```bash
npm install jspdf xlsx react-to-print
```

#### Crear rutas de reportes:
1. `app/reportes/page.tsx` - Lista de reportes disponibles
2. `app/reportes/ventas/page.tsx` - Reporte de ventas
3. `app/reportes/inventario/page.tsx` - Reporte de inventario
4. `app/reportes/caja/page.tsx` - Reporte de caja

### FASE 9: Landing Page y Planes

#### Crear landing page:
1. `app/(marketing)/page.tsx` - Página de inicio pública
2. `app/(marketing)/precios/page.tsx` - Planes y precios
3. `app/(marketing)/caracteristicas/page.tsx` - Características
4. `app/(marketing)/contacto/page.tsx` - Contacto

#### Integrar Stripe:
```bash
npm install stripe @stripe/stripe-js
```

1. Configurar webhooks de Stripe
2. Crear checkout de suscripción
3. Portal del cliente para gestionar suscripción

### FASE 10: PWA y Optimizaciones

#### Configurar PWA:
```bash
npm install next-pwa
```

#### Agregar en `next.config.mjs`:
```javascript
import withPWA from "next-pwa"

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})({
  // tu configuración actual
})
```

### FASE 11: Tests y CI/CD

#### Instalar herramientas de testing:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright
```

#### Configurar GitHub Actions:
Crear `.github/workflows/test.yml`

## 🔒 Checklist de Seguridad

Antes de lanzar a producción:

- [ ] RLS habilitado en todas las tablas
- [ ] Todas las políticas probadas
- [ ] Validación con Zod en todos los formularios
- [ ] Rate limiting implementado
- [ ] Secrets en variables de entorno
- [ ] HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Monitoring (Sentry) configurado
- [ ] Logs de auditoría funcionando

## 📚 Recursos Útiles

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🆘 Necesitas Ayuda?

Si encuentras problemas durante la implementación:

1. Revisa los logs de Supabase Dashboard
2. Verifica las políticas RLS
3. Asegúrate de que el usuario tenga organizacion_id
4. Revisa la documentación oficial

---

**Nota**: Este es un proyecto grande. Tómate el tiempo necesario para implementar cada fase correctamente antes de pasar a la siguiente. La base (Fases 1-5) es crítica y debe estar sólida antes de agregar módulos nuevos.
