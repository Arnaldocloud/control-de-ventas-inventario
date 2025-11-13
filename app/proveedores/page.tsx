import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"
import Link from "next/link"
import { ProveedoresTable } from "@/components/proveedores-table"

export default async function ProveedoresPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener proveedores de la organización
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("*")
    .eq("organizacion_id", usuario.organizacion_id)
    .order("nombre", { ascending: true })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-black">Gestión de Proveedores</h1>
            <p className="text-muted-foreground mt-2">Administra tus proveedores y distribuidores</p>
          </div>
        </div>
        <Link href="/proveedores/nuevo">
          <Button>
            <Truck className="mr-2 h-4 w-4" />
            Agregar Proveedor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
          <CardDescription>
            {proveedores?.length || 0} proveedor{proveedores?.length !== 1 ? "es" : ""} registrado
            {proveedores?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProveedoresTable proveedores={proveedores || []} />
        </CardContent>
      </Card>
    </div>
  )
}
