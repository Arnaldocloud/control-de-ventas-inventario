import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { obtenerOrganizacionActual } from "@/lib/supabase/auth-helpers"
import { redirect } from "next/navigation"

export default async function CuentaSuspendidaPage() {
  const organizacion = await obtenerOrganizacionActual()

  // Si no hay organización o está activa, redirigir al dashboard
  if (!organizacion || organizacion.estado === "activa") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-16 px-4 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Cuenta Suspendida</CardTitle>
          <CardDescription>
            {organizacion.estado === "suspendida"
              ? "Tu cuenta ha sido suspendida temporalmente"
              : "Tu cuenta ha sido cancelada"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {organizacion.estado === "suspendida" ? (
              <>
                <p className="mb-4">
                  Tu cuenta ha sido suspendida. Esto puede deberse a un problema con tu suscripción o pago pendiente.
                </p>
                <p className="mb-4">
                  Para reactivar tu cuenta, por favor contacta con nuestro equipo de soporte o actualiza tu método de
                  pago.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4">Tu cuenta ha sido cancelada y ya no tienes acceso al sistema.</p>
                <p className="mb-4">
                  Si deseas reactivar tu cuenta, por favor contacta con nuestro equipo de soporte.
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="mailto:soporte@arrodev.com">Contactar Soporte</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Cerrar Sesión</Link>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Organización: {organizacion.nombre}</p>
            <p>Plan: {organizacion.plan}</p>
            <p>Estado: {organizacion.estado}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
