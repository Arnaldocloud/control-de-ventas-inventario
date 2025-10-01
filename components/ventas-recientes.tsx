import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatearPrecio } from "@/lib/utils"

export async function VentasRecientes() {
  const supabase = await createClient()

  const { data: ventas } = await supabase
    .from("ventas")
    .select(`
      *,
      ventas_detalle (
        *,
        productos (*)
      )
    `)
    .order("creado_en", { ascending: false })
    .limit(10)

  if (!ventas || ventas.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay ventas registradas</p>
  }

  return (
    <div className="space-y-3">
      {ventas.map((venta) => {
        const cantidadProductos = venta.ventas_detalle?.length || 0
        const totalUnidades =
          venta.ventas_detalle?.reduce((sum: number, detalle: any) => sum + detalle.cantidad, 0) || 0

        return (
          <div key={venta.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">
                {cantidadProductos} producto{cantidadProductos > 1 ? "s" : ""}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(venta.creado_en), "dd/MM/yyyy HH:mm", { locale: es })} - {totalUnidades} unidad
                {totalUnidades > 1 ? "es" : ""}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{venta.metodo_pago}</Badge>
              <div className="text-right">
                <div className="font-semibold">{formatearPrecio(venta.total, venta.moneda)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
