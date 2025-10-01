import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Producto } from "@/lib/types"
import { Package } from "lucide-react"
import Link from "next/link"

interface ProductosStockBajoProps {
  productos: Producto[]
}

export function ProductosStockBajo({ productos }: ProductosStockBajoProps) {
  if (productos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay productos con stock bajo</p>
  }

  return (
    <div className="space-y-3">
      {productos.map((producto) => (
        <div key={producto.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{producto.nombre}</div>
              <div className="text-sm text-muted-foreground">
                Stock: {producto.stock} / Mínimo: {producto.stock_minimo}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={producto.stock === 0 ? "destructive" : "secondary"}>
              {producto.stock === 0 ? "Agotado" : "Stock Bajo"}
            </Badge>
            <Link href={`/productos/${producto.id}/editar`}>
              <Button size="sm" variant="outline">
                Actualizar
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
