"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Loader2, Building2 } from "lucide-react"

export function RegistroForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const nombreCompleto = formData.get("nombre_completo") as string
    const nombreOrganizacion = formData.get("nombre_organizacion") as string

    try {
      const supabase = createClient()

      // 1. Registrar usuario en Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError("Error al crear usuario")
        setLoading(false)
        return
      }

      // 2. Crear organización
      const slug = nombreOrganizacion
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { data: organizacion, error: orgError } = await supabase
        .from("organizaciones")
        .insert({
          nombre: nombreOrganizacion,
          slug: `${slug}-${Date.now().toString().slice(-6)}`,
          plan: plan,
          max_usuarios: plan === "free" ? 1 : plan === "pro" ? 5 : 999,
          max_productos: plan === "free" ? 50 : plan === "pro" ? 999999 : 999999,
          max_ventas_mes: plan === "free" ? 100 : plan === "pro" ? 999999 : 999999,
        })
        .select()
        .single()

      if (orgError || !organizacion) {
        setError("Error al crear organización: " + orgError?.message)
        setLoading(false)
        return
      }

      // 3. Crear usuario en tabla usuarios
      const { error: usuarioError } = await supabase.from("usuarios").insert({
        id: authData.user.id,
        organizacion_id: organizacion.id,
        email: email,
        nombre_completo: nombreCompleto,
        rol: "admin", // El primer usuario es admin
        estado: "activo",
      })

      if (usuarioError) {
        setError("Error al crear perfil de usuario: " + usuarioError.message)
        setLoading(false)
        return
      }

      // 4. Crear configuración inicial
      await supabase.from("configuracion").insert({
        organizacion_id: organizacion.id,
        tasa_dolar: 36.5,
      })

      // Éxito - redirigir
      router.push("/auth/verificar-email")
      router.refresh()
    } catch (err) {
      console.error("Error en registro:", err)
      setError("Error al registrar. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-primary p-3">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">Regístrate para empezar a usar el sistema</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              placeholder="Juan Pérez"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_organizacion">
              <Building2 className="inline h-4 w-4 mr-1" />
              Nombre de tu Negocio
            </Label>
            <Input
              id="nombre_organizacion"
              name="nombre_organizacion"
              type="text"
              placeholder="Mi Tienda"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={plan} onValueChange={(value: any) => setPlan(value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <div>
                    <div className="font-medium">Free - Gratis</div>
                    <div className="text-xs text-muted-foreground">1 usuario, 50 productos, 100 ventas/mes</div>
                  </div>
                </SelectItem>
                <SelectItem value="pro">
                  <div>
                    <div className="font-medium">Pro - $29/mes</div>
                    <div className="text-xs text-muted-foreground">5 usuarios, ilimitado</div>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div>
                    <div className="font-medium">Enterprise - $99/mes</div>
                    <div className="text-xs text-muted-foreground">Usuarios ilimitados, todo incluido</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terminos" className="underline hover:text-primary">
              términos y condiciones
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="underline hover:text-primary">
              política de privacidad
            </Link>
            .
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Cuenta
              </>
            )}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
