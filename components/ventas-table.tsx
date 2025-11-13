"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { VentaCompleta } from "@/lib/types"
import { ShoppingCart, ChevronDown, ChevronRight } from "lucide-react"
import { useState, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { formatearPrecio } from "@/lib/utils"

interface VentasTableProps {
  ventas: VentaCompleta[]
}

export function VentasTable({ ventas }: VentasTableProps) {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set())

  const toggleExpansion = (ventaId: string) => {
    const nuevasExpandidas = new Set(expandidas)
    if (nuevasExpandidas.has(ventaId)) {
      nuevasExpandidas.delete(ventaId)
    } else {
      nuevasExpandidas.add(ventaId)
    }
    setExpandidas(nuevasExpandidas)
  }

  const getMetodoPagoColor = (metodo: string) => {
    if (metodo.startsWith("Efectivo")) {
      return "default"
    }
    switch (metodo) {
      case "Punto":
        return "secondary"
      case "Pago Móvil":
        return "outline"
      case "Transferencia":
        return "outline"
      case "Mixto":
        return "default"
      default:
        return "default"
    }
  }

  if (ventas.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <ShoppingCart className="h-8 w-8 text-emerald-600" />
        </div>
  <p className="text-lg font-semibold mb-1 text-primary">No hay ventas registradas</p>
        <p className="text-sm text-muted-foreground">Comienza registrando tu primera venta</p>
      </div>
    )
  }

  return (
    <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold">Productos</TableHead>
            <TableHead className="font-semibold">Total</TableHead>
            <TableHead className="font-semibold">Método de Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((venta) => {
            const estaExpandida = expandidas.has(venta.id)
            const cantidadProductos = venta.ventas_detalle?.length || 0
            const totalUnidades = venta.ventas_detalle?.reduce((sum, detalle) => sum + detalle.cantidad, 0) || 0

            return (
              <Fragment key={venta.id}>
                <TableRow className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpansion(venta.id)}>
                      {estaExpandida ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(venta.creado_en).toLocaleString("es-VE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {cantidadProductos} producto{cantidadProductos > 1 ? "s" : ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalUnidades} unidad{totalUnidades > 1 ? "es" : ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-lg">{formatearPrecio(venta.total, venta.moneda)}</TableCell>
                  <TableCell>
                    <Badge variant={getMetodoPagoColor(venta.metodo_pago)}>{venta.metodo_pago}</Badge>
                  </TableCell>
                </TableRow>
                {estaExpandida && venta.ventas_detalle && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-gradient-to-r from-muted/50 to-muted/30">
                      <div className="py-3 px-4">
                        <p className="text-sm font-semibold mb-3 text-primary">Detalle de productos:</p>
                        <div className="space-y-2">
                          {venta.ventas_detalle.map((detalle) => (
                            <div
                              key={detalle.id}
                              className="flex items-center justify-between text-sm border-l-4 border-primary pl-4 py-2 bg-card rounded-r-lg"
                            >
                              <div>
                                <span className="font-medium">{detalle.productos.nombre}</span>
                                <span className="text-muted-foreground ml-2">x{detalle.cantidad}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-muted-foreground text-xs">
                                  {formatearPrecio(detalle.precio_unitario, venta.moneda)} c/u
                                </div>
                                <div className="font-medium">{formatearPrecio(detalle.subtotal, venta.moneda)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
