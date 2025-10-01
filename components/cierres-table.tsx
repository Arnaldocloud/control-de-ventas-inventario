"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { CierreCaja } from "@/lib/types"
import { formatearPrecio } from "@/lib/utils"

interface CierresTableProps {
  cierres: CierreCaja[]
}

export function CierresTable({ cierres }: CierresTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha Cierre</TableHead>
            <TableHead>Ventas</TableHead>
            <TableHead className="text-right">Efectivo Bs.</TableHead>
            <TableHead className="text-right">Efectivo USD</TableHead>
            <TableHead className="text-right">Diferencia Bs.</TableHead>
            <TableHead className="text-right">Diferencia USD</TableHead>
            <TableHead className="text-right">Total Otros</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cierres.map((cierre) => {
            const totalOtros =
              (cierre.total_ventas_punto || 0) +
              (cierre.total_ventas_pago_movil || 0) +
              (cierre.total_ventas_transferencia || 0) +
              (cierre.total_ventas_mixto || 0)

            return (
              <TableRow key={cierre.id}>
                <TableCell>
                  {cierre.fecha_cierre
                    ? new Date(cierre.fecha_cierre).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{cierre.cantidad_ventas}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  Bs. {formatearPrecio(cierre.total_ventas_efectivo_bs || 0)}
                </TableCell>
                <TableCell className="text-right">
                  USD {formatearPrecio(cierre.total_ventas_efectivo_usd || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={(cierre.diferencia_bs || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                    Bs. {formatearPrecio(Math.abs(cierre.diferencia_bs || 0))}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={(cierre.diferencia_usd || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                    USD {formatearPrecio(Math.abs(cierre.diferencia_usd || 0))}
                  </span>
                </TableCell>
                <TableCell className="text-right">Bs. {formatearPrecio(totalOtros)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
