"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Proveedor, Producto, Moneda, MetodoPagoCompra } from "@/lib/types"
import { formatearNumero } from "@/lib/utils"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CompraFormProps {
  proveedores: Pick<Proveedor, "id" | "nombre" | "empresa">[]
  productos: Pick<Producto, "id" | "nombre" | "costo_unitario_usd" | "stock">[]
  tasaDolar: number
}

interface ProductoCompra {
  producto_id: string
  cantidad: number
  costo_unitario: number
  subtotal: number
}

export function CompraForm({ proveedores, productos, tasaDolar }: CompraFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    proveedor_id: "",
    numero_factura: "",
    fecha_compra: new Date().toISOString().split("T")[0],
    moneda: "USD" as Moneda,
    metodo_pago: "Efectivo" as MetodoPagoCompra,
    estado: "completada" as "pendiente" | "completada" | "cancelada",
    notas: "",
  })

  const [productosCompra, setProductosCompra] = useState<ProductoCompra[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [cantidad, setCantidad] = useState(1)

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      toast.error("Selecciona un producto")
      return
    }

    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0")
      return
    }

    const producto = productos.find((p) => p.id === productoSeleccionado)
    if (!producto) return

    // Verificar si el producto ya está agregado
    const existe = productosCompra.find((p) => p.producto_id === productoSeleccionado)
    if (existe) {
      toast.error("Este producto ya está agregado")
      return
    }

    const costoUnitario = producto.costo_unitario_usd
    const subtotal = cantidad * costoUnitario

    setProductosCompra([
      ...productosCompra,
      {
        producto_id: productoSeleccionado,
        cantidad,
        costo_unitario: costoUnitario,
        subtotal,
      },
    ])

    setProductoSeleccionado("")
    setCantidad(1)
    toast.success("Producto agregado")
  }

  const eliminarProducto = (index: number) => {
    setProductosCompra(productosCompra.filter((_, i) => i !== index))
    toast.success("Producto eliminado")
  }

  const calcularTotal = () => {
    return productosCompra.reduce((sum, p) => sum + p.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.proveedor_id) {
        toast.error("Selecciona un proveedor")
        setLoading(false)
        return
      }

      if (productosCompra.length === 0) {
        toast.error("Agrega al menos un producto")
        setLoading(false)
        return
      }

      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const { data: usuario } = await supabase.from("usuarios").select("organizacion_id").eq("id", user.id).single()

      if (!usuario) throw new Error("Usuario no encontrado")

      const total = calcularTotal()

      // Crear la compra
      const compraData = {
        organizacion_id: usuario.organizacion_id,
        proveedor_id: formData.proveedor_id,
        usuario_id: user.id,
        numero_factura: formData.numero_factura || null,
        fecha_compra: formData.fecha_compra,
        total,
        moneda: formData.moneda,
        metodo_pago: formData.metodo_pago,
        tasa_dolar_momento: formData.moneda === "BS" ? tasaDolar : null,
        estado: formData.estado,
        notas: formData.notas || null,
      }

      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert(compraData)
        .select()
        .single()

      if (compraError) throw compraError

      // Crear los detalles de la compra
      const detalles = productosCompra.map((p) => ({
        organizacion_id: usuario.organizacion_id,
        compra_id: compra.id,
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        costo_unitario: p.costo_unitario,
        subtotal: p.subtotal,
      }))

      const { error: detallesError } = await supabase.from("compras_detalle").insert(detalles)

      if (detallesError) throw detallesError

      // Actualizar stock de productos si la compra está completada
      if (formData.estado === "completada") {
        for (const detalle of productosCompra) {
          const producto = productos.find((p) => p.id === detalle.producto_id)
          if (producto) {
            const { error: updateError } = await supabase
              .from("productos")
              .update({
                stock: producto.stock + detalle.cantidad,
                costo_unitario_usd: detalle.costo_unitario,
              })
              .eq("id", detalle.producto_id)

            if (updateError) console.error("Error actualizando stock:", updateError)
          }
        }
      }

      // Actualizar estadísticas del proveedor
      const { data: proveedor } = await supabase
        .from("proveedores")
        .select("total_compras, cantidad_compras")
        .eq("id", formData.proveedor_id)
        .single()

      if (proveedor) {
        await supabase
          .from("proveedores")
          .update({
            total_compras: proveedor.total_compras + total,
            cantidad_compras: proveedor.cantidad_compras + 1,
            ultima_compra: new Date().toISOString(),
          })
          .eq("id", formData.proveedor_id)
      }

      toast.success("Compra registrada correctamente")
      router.push("/compras")
      router.refresh()
    } catch (error) {
      console.error("Error guardando compra:", error)
      toast.error("Error al guardar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la Compra */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información de la Compra</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proveedor_id">
              Proveedor <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.proveedor_id} onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre} {proveedor.empresa && `- ${proveedor.empresa}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_factura">Número de Factura</Label>
            <Input
              id="numero_factura"
              value={formData.numero_factura}
              onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
              placeholder="Ej: 001-0001234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_compra">
              Fecha de Compra <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha_compra"
              type="date"
              value={formData.fecha_compra}
              onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda</Label>
            <Select value={formData.moneda} onValueChange={(value) => setFormData({ ...formData, moneda: value as Moneda })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">Dólares (USD)</SelectItem>
                <SelectItem value="BS">Bolívares (Bs.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo_pago">Método de Pago</Label>
            <Select
              value={formData.metodo_pago}
              onValueChange={(value) => setFormData({ ...formData, metodo_pago: value as MetodoPagoCompra })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Crédito">Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value as "pendiente" | "completada" | "cancelada" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agregar Productos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Productos</h3>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="producto">Producto</Label>
                <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.nombre} - ${formatearNumero(producto.costo_unitario_usd)} (Stock: {producto.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <div className="flex gap-2">
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                  <Button type="button" onClick={agregarProducto}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Productos */}
        {productosCompra.length > 0 && (
          <div className="space-y-2">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Producto</th>
                    <th className="p-3 text-right font-medium">Cantidad</th>
                    <th className="p-3 text-right font-medium">Costo Unit.</th>
                    <th className="p-3 text-right font-medium">Subtotal</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosCompra.map((item, index) => {
                    const producto = productos.find((p) => p.id === item.producto_id)
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-3">{producto?.nombre}</td>
                        <td className="p-3 text-right">{item.cantidad}</td>
                        <td className="p-3 text-right">${formatearNumero(item.costo_unitario)}</td>
                        <td className="p-3 text-right font-semibold">${formatearNumero(item.subtotal)}</td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarProducto(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-muted/50 font-semibold">
                    <td colSpan={3} className="p-3 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-right text-lg">${formatearNumero(calcularTotal())}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading || productosCompra.length === 0}>
          {loading ? "Guardando..." : "Registrar Compra"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
