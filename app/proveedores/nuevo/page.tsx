import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TruckIcon } from "lucide-react"
import { ProveedorForm } from "@/components/proveedor-form"

export default async function NuevoProveedorPage() {
  await requireAuth()

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <TruckIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Agregar Nuevo Proveedor</h1>
          <p className="text-muted-foreground mt-1">Completa la información del proveedor</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proveedor</CardTitle>
          <CardDescription>Todos los campos marcados con * son obligatorios</CardDescription>
        </CardHeader>
        <CardContent>
          <ProveedorForm />
        </CardContent>
      </Card>
    </div>
  )
}
