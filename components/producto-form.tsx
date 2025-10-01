"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/types"

interface ProductoFormProps {
  producto?: Producto
}

export function ProductoForm({ producto }: ProductoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precio_usd: producto?.precio_usd?.toString() || "",
    stock: producto?.stock?.toString() || "0",
    stock_minimo: producto?.stock_minimo?.toString() || "5",
    costo_unitario_usd: producto?.costo_unitario_usd?.toString() || "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const data = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      precio_bs: null,
      precio_usd: formData.precio_usd ? Number.parseFloat(formData.precio_usd) : null,
      stock: Number.parseInt(formData.stock),
      stock_minimo: Number.parseInt(formData.stock_minimo),
      costo_unitario_usd: Number.parseFloat(formData.costo_unitario_usd),
      actualizado_en: new Date().toISOString(),
    }

    try {
      if (producto) {
        const { error } = await supabase.from("productos").update(data).eq("id", producto.id)

        if (error) throw error

        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        })
      } else {
        const { error } = await supabase.from("productos").insert(data)

        if (error) throw error

        toast({
          title: "Producto creado",
          description: "El producto se agregó correctamente",
        })
      }

      router.push("/productos")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Producto *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
          placeholder="Ej: Filtro de aceite"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Detalles adicionales del producto"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precio_usd">Precio en Dólares (USD) *</Label>
        <Input
          id="precio_usd"
          type="number"
          step="0.01"
          value={formData.precio_usd}
          onChange={(e) => setFormData({ ...formData, precio_usd: e.target.value })}
          placeholder="0.00"
          required
          min="0"
        />
        <p className="text-xs text-muted-foreground">
          El precio en bolívares se calculará automáticamente según la tasa de cambio configurada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Actual *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
          <Input
            id="stock_minimo"
            type="number"
            value={formData.stock_minimo}
            onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costo_unitario_usd">Costo Unitario (USD) *</Label>
          <Input
            id="costo_unitario_usd"
            type="number"
            step="0.01"
            value={formData.costo_unitario_usd}
            onChange={(e) => setFormData({ ...formData, costo_unitario_usd: e.target.value })}
            required
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : producto ? "Actualizar Producto" : "Crear Producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
