"use client"

import { CompraCompleta } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Package } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { formatearNumero } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ComprasTableProps {
  compras: CompraCompleta[]
}

export function ComprasTable({ compras }: ComprasTableProps) {
  const [busqueda, setBusqueda] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const comprasFiltradas = compras.filter(
    (compra) =>
      compra.proveedores?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.numero_factura?.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.proveedores?.empresa?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleEliminar = async (id: string, numeroFactura: string) => {
    try {
      const { error } = await supabase.from("compras").delete().eq("id", id)

      if (error) throw error

      toast.success(`Compra ${numeroFactura ? `"${numeroFactura}"` : ""} eliminada correctamente`)
      router.refresh()
    } catch (error) {
      console.error("Error eliminando compra:", error)
      toast.error("Error al eliminar la compra")
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completada":
        return <Badge className="bg-green-500">Completada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  if (compras.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay compras registradas aún.</p>
        <Link href="/compras/nueva">
          <Button className="mt-4">Registrar Primera Compra</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por proveedor o número de factura..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-muted-foreground">
          {comprasFiltradas.length} de {compras.length} compra{compras.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Fecha</th>
                <th className="p-3 text-left font-medium">Proveedor</th>
                <th className="p-3 text-left font-medium">Factura</th>
                <th className="p-3 text-center font-medium">Productos</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 text-center font-medium">Método</th>
                <th className="p-3 text-center font-medium">Estado</th>
                <th className="p-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((compra) => (
                <tr key={compra.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="text-sm">
                      {new Date(compra.fecha_compra).toLocaleDateString("es-VE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{compra.proveedores?.nombre}</p>
                      {compra.proveedores?.empresa && (
                        <p className="text-sm text-muted-foreground">{compra.proveedores.empresa}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-mono">{compra.numero_factura || "-"}</span>
                  </td>
                  <td className="p-3 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Package className="h-4 w-4 mr-1" />
                          {compra.compras_detalle?.length || 0}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Productos de la Compra</DialogTitle>
                          <DialogDescription>
                            Factura: {compra.numero_factura || "Sin número"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          {compra.compras_detalle?.map((detalle) => (
                            <div key={detalle.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <p className="font-medium">{detalle.productos?.nombre}</p>
                                <p className="text-sm text-muted-foreground">
                                  {detalle.cantidad} x ${formatearNumero(detalle.costo_unitario)}
                                </p>
                              </div>
                              <p className="font-semibold">${formatearNumero(detalle.subtotal)}</p>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="p-3 text-right">
                    <div>
                      <p className="font-semibold">
                        {compra.moneda === "USD" ? "$" : "Bs. "}
                        {formatearNumero(compra.total)}
                      </p>
                      {compra.moneda === "BS" && compra.tasa_dolar_momento && (
                        <p className="text-xs text-muted-foreground">
                          Tasa: {formatearNumero(compra.tasa_dolar_momento)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className="text-xs">
                      {compra.metodo_pago}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">{getEstadoBadge(compra.estado)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/compras/${compra.id}`}>
                        <Button variant="ghost" size="icon" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Eliminar">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la compra
                              {compra.numero_factura && ` "${compra.numero_factura}"`}. Esta acción no se puede
                              deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEliminar(compra.id, compra.numero_factura || "")}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {comprasFiltradas.length === 0 && busqueda && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron compras que coincidan con "{busqueda}"</p>
        </div>
      )}
    </div>
  )
}
