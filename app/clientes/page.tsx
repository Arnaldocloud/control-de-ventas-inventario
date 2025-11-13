import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"
import { ClientesTable } from "@/components/clientes-table"

export default async function ClientesPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener clientes de la organización
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("organizacion_id", usuario.organizacion_id)
    .order("nombre", { ascending: true })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-black">Gestión de Clientes</h1>
            <p className="text-muted-foreground mt-2">Administra tu base de datos de clientes</p>
          </div>
        </div>
        <Link href="/clientes/nuevo">
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {clientes?.length || 0} cliente{clientes?.length !== 1 ? "s" : ""} registrado
            {clientes?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientesTable clientes={clientes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
