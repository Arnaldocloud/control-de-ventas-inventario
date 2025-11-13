import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { ComprasTable } from "@/components/compras-table"

export default async function ComprasPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener compras de la organización con relaciones
  const { data: compras } = await supabase
    .from("compras")
    .select(
      `
      *,
      proveedores(nombre, empresa),
      usuarios(nombre_completo),
      compras_detalle(
        id,
        cantidad,
        costo_unitario,
        subtotal,
        productos(nombre)
      )
    `
    )
    .eq("organizacion_id", usuario.organizacion_id)
    .order("fecha_compra", { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-black">Gestión de Compras</h1>
            <p className="text-muted-foreground mt-2">Registra las compras a proveedores</p>
          </div>
        </div>
        <Link href="/compras/nueva">
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Nueva Compra
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>
            {compras?.length || 0} compra{compras?.length !== 1 ? "s" : ""} registrada
            {compras?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComprasTable compras={compras || []} />
        </CardContent>
      </Card>
    </div>
  )
}
