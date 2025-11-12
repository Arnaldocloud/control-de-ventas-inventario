"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scan, Trash2, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import { Producto } from "@/lib/types"
import { formatearNumero } from "@/lib/utils"

interface ProductoVenta {
  producto: Producto
  cantidad: number
  subtotal: number
}

export function VentaRapidaBarcode() {
  const [barcode, setBarcode] = useState("")
  const [productos, setProductos] = useState<ProductoVenta[]>([])
  const [buscando, setBuscando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Auto-focus en el input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [productos])

  const buscarProductoPorBarcode = async (codigo: string) => {
    setBuscando(true)
    try {
      const { data: producto, error } = await supabase
        .from("productos")
        .select("*")
        .eq("codigo_barras", codigo)
        .single()

      if (error || !producto) {
        toast.error("Producto no encontrado")
        return
      }

      // Verificar si ya está en la lista
      const existente = productos.find((p) => p.producto.id === producto.id)
      
      if (existente) {
        // Incrementar cantidad
        actualizarCantidad(producto.id, existente.cantidad + 1)
        toast.success(`Cantidad actualizada: ${producto.nombre}`)
      } else {
        // Agregar nuevo producto
        const precioUnitario = producto.precio_usd || 0
        setProductos([
          ...productos,
          {
            producto,
            cantidad: 1,
            subtotal: precioUnitario,
          },
        ])
        toast.success(`Producto agregado: ${producto.nombre}`)
      }

      setBarcode("")
    } catch (error) {
      console.error("Error buscando producto:", error)
      toast.error("Error al buscar el producto")
    } finally {
      setBuscando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcode.trim()) {
      buscarProductoPorBarcode(barcode.trim())
    }
  }

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId)
      return
    }

    setProductos(
      productos.map((item) => {
        if (item.producto.id === productoId) {
          const precioUnitario = item.producto.precio_usd || 0
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: precioUnitario * nuevaCantidad,
          }
        }
        return item
      })
    )
  }

  const eliminarProducto = (productoId: string) => {
    setProductos(productos.filter((item) => item.producto.id !== productoId))
    toast.success("Producto eliminado")
  }

  const calcularTotal = () => {
    return productos.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const limpiarVenta = () => {
    setProductos([])
    setBarcode("")
    toast.success("Venta limpiada")
  }

  return (
    <div className="space-y-6">
      {/* Escáner de Código de Barras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Escáner de Código de Barras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Código de Barras</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escanea el código de barras..."
                  disabled={buscando}
                  className="pr-10"
                />
                <Scan className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                type="button"
                onClick={() => buscarProductoPorBarcode(barcode.trim())}
                disabled={!barcode.trim() || buscando}
              >
                {buscando ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Escanea el código de barras con un lector o ingrésalo manualmente y presiona Enter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      {productos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Productos en la Venta</CardTitle>
              <Button variant="outline" size="sm" onClick={limpiarVenta}>
                Limpiar Todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productos.map((item) => (
                <div key={item.producto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.producto.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      ${formatearNumero(item.producto.precio_usd || 0)} c/u
                    </p>
                    {item.producto.codigo_barras && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.producto.codigo_barras}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="font-semibold text-lg">${formatearNumero(item.subtotal)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarProducto(item.producto.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold">${formatearNumero(calcularTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {productos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Escanea un producto para comenzar la venta</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
