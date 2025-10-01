"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Search } from "lucide-react"
import { formatearNumero, formatearPrecio } from "@/lib/utils"

interface VentaFormProps {
  productos: Producto[]
  tasaDolar: number
}

interface ItemVenta {
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export function VentaForm({ productos, tasaDolar }: VentaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("[v0] Productos recibidos en VentaForm:", productos.length)
    console.log("[v0] Tasa dólar:", tasaDolar)
  }, [productos, tasaDolar])

  const [items, setItems] = useState<ItemVenta[]>([])
  const [productoActual, setProductoActual] = useState("")
  const [cantidadActual, setCantidadActual] = useState("1")
  const [busquedaProducto, setBusquedaProducto] = useState("")

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto.trim()) return productos

    const termino = busquedaProducto.toLowerCase()
    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion?.toLowerCase().includes(termino) ||
        producto.codigo?.toLowerCase().includes(termino),
    )
  }, [productos, busquedaProducto])

  const [formData, setFormData] = useState({
    moneda: "BS" as "BS" | "USD",
    metodo_pago: "Efectivo" as "Efectivo" | "Punto" | "Pago Móvil" | "Transferencia" | "Mixto",
  })

  const [totalVenta, setTotalVenta] = useState(0)

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0)
    setTotalVenta(total)
  }, [items])

  const recalcularPrecios = (nuevaMoneda: "BS" | "USD") => {
    if (items.length === 0) return []

    return items.map((item) => {
      const producto = productos.find((p) => p.id === item.producto_id)
      if (!producto) return item

      const nuevoPrecio = nuevaMoneda === "BS" ? producto.precio_bs || 0 : producto.precio_usd || 0
      const nuevoSubtotal = nuevoPrecio * item.cantidad

      return {
        ...item,
        precio_unitario: nuevoPrecio,
        subtotal: nuevoSubtotal,
      }
    })
  }

  const agregarProducto = () => {
    if (!productoActual) {
      toast({
        title: "Error",
        description: "Selecciona un producto",
        variant: "destructive",
      })
      return
    }

    const producto = productos.find((p) => p.id === productoActual)
    if (!producto) return

    const cantidad = Number.parseInt(cantidadActual)

    if (cantidad > producto.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${producto.stock} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    const itemExistente = items.find((item) => item.producto_id === productoActual)
    if (itemExistente) {
      toast({
        title: "Producto duplicado",
        description: "Este producto ya está en la lista. Elimínalo primero si quieres cambiar la cantidad.",
        variant: "destructive",
      })
      return
    }

    const precioUSD = producto.precio_usd || 0
    const precio = formData.moneda === "BS" ? precioUSD * tasaDolar : precioUSD
    const subtotal = precio * cantidad

    setItems([
      ...items,
      {
        producto_id: productoActual,
        cantidad,
        precio_unitario: precio,
        subtotal,
      },
    ])

    setProductoActual("")
    setCantidadActual("1")
    setBusquedaProducto("") // Limpiar búsqueda después de agregar
  }

  const eliminarProducto = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const metodoPagoFinal = formData.metodo_pago === "Efectivo" ? `Efectivo ${formData.moneda}` : formData.metodo_pago

      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          total: totalVenta,
          moneda: formData.moneda,
          metodo_pago: metodoPagoFinal,
          tasa_dolar_momento: tasaDolar,
        })
        .select()
        .single()

      if (ventaError) throw ventaError

      const detalles = items.map((item) => ({
        venta_id: ventaData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      }))

      const { error: detalleError } = await supabase.from("ventas_detalle").insert(detalles)

      if (detalleError) throw detalleError

      for (const item of items) {
        const producto = productos.find((p) => p.id === item.producto_id)
        if (producto) {
          const nuevoStock = producto.stock - item.cantidad
          const { error: stockError } = await supabase
            .from("productos")
            .update({ stock: nuevoStock, actualizado_en: new Date().toISOString() })
            .eq("id", item.producto_id)

          if (stockError) throw stockError
        }
      }

      toast({
        title: "Venta registrada",
        description: `Se registraron ${items.length} productos y se actualizó el inventario`,
      })

      router.push("/ventas")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error al registrar venta:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Configuración de Venta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="moneda" className="text-blue-900">
              Moneda *
            </Label>
            <Select
              value={formData.moneda}
              onValueChange={(value: "BS" | "USD") => {
                setFormData({ ...formData, moneda: value })
                const itemsRecalculados = recalcularPrecios(value)
                setItems(itemsRecalculados)
                if (itemsRecalculados.length > 0) {
                  toast({
                    title: "Precios actualizados",
                    description: `Los precios se han convertido a ${value === "BS" ? "Bolívares" : "Dólares"}`,
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BS">Bolívares (Bs.)</SelectItem>
                <SelectItem value="USD">Dólares (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo_pago" className="text-blue-900">
              Método de Pago *
            </Label>
            <Select
              value={formData.metodo_pago}
              onValueChange={(value: "Efectivo" | "Punto" | "Pago Móvil" | "Transferencia" | "Mixto") =>
                setFormData({ ...formData, metodo_pago: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Punto">Punto de Venta</SelectItem>
                <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Mixto">Mixto (Combinado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="busqueda">Buscar Producto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="busqueda"
                type="text"
                placeholder="Buscar por nombre, descripción o código..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="pl-10"
                disabled={productos.length === 0}
              />
            </div>
            {busquedaProducto && (
              <p className="text-xs text-muted-foreground">
                {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""} encontrado
                {productosFiltrados.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="producto">Producto</Label>
            {productos.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted">
                No hay productos disponibles. Por favor, agrega productos primero desde la sección de Productos.
              </p>
            ) : productosFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted">
                No se encontraron productos con "{busquedaProducto}"
              </p>
            ) : (
              <Select value={productoActual} onValueChange={setProductoActual}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productosFiltrados.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id} disabled={producto.stock === 0}>
                      <div className="flex flex-col">
                        <span className="font-medium">{producto.nombre}</span>
                        <span className="text-xs text-muted-foreground">
                          Stock: {producto.stock} | USD {formatearNumero(producto.precio_usd || 0)} (Bs.{" "}
                          {formatearNumero((producto.precio_usd || 0) * tasaDolar)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={cantidadActual}
              onChange={(e) => setCantidadActual(e.target.value)}
              disabled={productos.length === 0}
            />
          </div>

          <Button type="button" onClick={agregarProducto} className="w-full" disabled={productos.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos en la Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => {
                const producto = productos.find((p) => p.id === item.producto_id)
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{producto?.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} x {formatearPrecio(item.precio_unitario, formData.moneda)} ={" "}
                        {formatearPrecio(item.subtotal, formData.moneda)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarProducto(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-900">Productos:</span>
                <span className="font-medium text-green-900">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-900">Unidades totales:</span>
                <span className="font-medium text-green-900">
                  {items.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              </div>
              <div className="border-t border-green-300 pt-2 flex justify-between">
                <span className="font-semibold text-green-900">Total:</span>
                <span className="text-xl font-bold text-green-900">{formatearPrecio(totalVenta, formData.moneda)}</span>
              </div>
              {formData.moneda === "BS" && (
                <div className="text-xs text-green-700 text-right">
                  Aprox. $ {formatearNumero(totalVenta / tasaDolar)} (Tasa: {formatearNumero(tasaDolar)})
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || items.length === 0} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Registrando..." : "Registrar Venta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
