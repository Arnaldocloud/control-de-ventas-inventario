import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { ClienteForm } from "@/components/cliente-form"

export default async function NuevoClientePage() {
  await requireAuth()

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Agregar Nuevo Cliente</h1>
          <p className="text-muted-foreground mt-1">Completa la información del cliente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>Todos los campos marcados con * son obligatorios</CardDescription>
        </CardHeader>
        <CardContent>
          <ClienteForm />
        </CardContent>
      </Card>
    </div>
  )
}
