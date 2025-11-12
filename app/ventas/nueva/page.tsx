import { createClient } from "@/lib/supabase/server"
import { VentaForm } from "@/components/venta-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// IMPORTANTE: Deshabilitar caché
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function NuevaVentaPage() {
  const supabase = await createClient()

  const { data: productos, error: productosError } = await supabase
    .from("productos")
    .select("*")
    .order("nombre", { ascending: true })

  console.log("[v0] Productos cargados:", productos?.length || 0)
  console.log("[v0] Error al cargar productos:", productosError)
  if (productos && productos.length > 0) {
    console.log("[v0] Primer producto:", productos[0])
  }

  // Obtener configuración (primer registro más reciente)
  const { data: configs, error: configError } = await supabase
    .from("configuracion")
    .select("*")
    .order("actualizado_en", { ascending: false })
    .limit(1)

  const config = configs && configs.length > 0 ? configs[0] : null

  console.log("[v0] Configuración cargada:", config)
  console.log("[v0] Error al cargar configuración:", configError)

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nueva Venta</CardTitle>
          <CardDescription>Completa la información de la transacción</CardDescription>
        </CardHeader>
        <CardContent>
          <VentaForm productos={productos || []} tasaDolar={config?.tasa_dolar || 36.5} />
        </CardContent>
      </Card>
    </div>
  )
}