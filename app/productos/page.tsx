import { createClient } from "@/lib/supabase/server"
import { ProductosTable } from "@/components/productos-table"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import Link from "next/link"

// IMPORTANTE: Deshabilitar caché
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProductosPage() {
  const supabase = await createClient()

  // Obtener configuración (primer registro más reciente)
  const { data: configs } = await supabase
    .from("configuracion")
    .select("*")
    .order("actualizado_en", { ascending: false })
    .limit(1)

  const config = configs && configs.length > 0 ? configs[0] : null

  const { data: productos, error } = await supabase.from("productos").select("*").order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error al cargar productos:", error)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Inventario de Productos
            </h1>
            <p className="text-muted-foreground mt-1">Gestiona tus repuestos de motos</p>
          </div>
        </div>
        <Link href="/productos/nuevo">
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="mr-2 h-5 w-5" />
            Agregar Producto
          </Button>
        </Link>
      </div>

      <ProductosTable productos={productos || []} tasaDolar={config?.tasa_dolar || 36.5} />
    </div>
  )
}