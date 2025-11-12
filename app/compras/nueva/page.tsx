import { requireAuth } from "@/lib/supabase/auth-helpers"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { CompraForm } from "@/components/compra-form"

export default async function NuevaCompraPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener proveedores
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("id, nombre, empresa")
    .eq("organizacion_id", usuario.organizacion_id)
    .order("nombre", { ascending: true })

  // Obtener productos
  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre, costo_unitario_usd, stock")
    .eq("organizacion_id", usuario.organizacion_id)
    .order("nombre", { ascending: true })

  // Obtener configuración para tasa del dólar
  const { data: config } = await supabase
    .from("configuracion")
    .select("tasa_dolar")
    .eq("organizacion_id", usuario.organizacion_id)
    .single()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Registrar Nueva Compra</h1>
          <p className="text-muted-foreground mt-1">Completa la información de la compra</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Compra</CardTitle>
          <CardDescription>Selecciona el proveedor y agrega los productos</CardDescription>
        </CardHeader>
        <CardContent>
          <CompraForm
            proveedores={proveedores || []}
            productos={productos || []}
            tasaDolar={config?.tasa_dolar || 36.5}
          />
        </CardContent>
      </Card>
    </div>
  )
}
