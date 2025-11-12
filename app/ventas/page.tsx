import { createClient } from "@/lib/supabase/server"
import { VentasTable } from "@/components/ventas-table"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import Link from "next/link"

// Optimización: Revalidar cada 30 segundos
export const revalidate = 30
export const dynamic = "force-dynamic"

export default async function VentasPage() {
  const supabase = await createClient()

  const { data: ventas, error } = await supabase
    .from("ventas")
    .select(`
      *,
      ventas_detalle (
        *,
        productos (*)
      )
    `)
    .order("creado_en", { ascending: false })

  if (error) {
    console.error("[v0] Error al cargar ventas:", error)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Registro de Ventas</h1>
          <p className="text-muted-foreground mt-1">Historial de todas las transacciones</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ventas/rapida">
            <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Venta Rápida (Escáner)
            </Button>
          </Link>
          <Link href="/ventas/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>
      </div>

      <VentasTable ventas={ventas || []} />
    </div>
  )
}
