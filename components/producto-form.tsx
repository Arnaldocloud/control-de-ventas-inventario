"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"

interface ProductoFormProps {
  producto?: Producto
}

export function ProductoForm({ producto }: ProductoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tasaDolar, setTasaDolar] = useState(36.5)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precio_usd: producto?.precio_usd?.toString() || "",
    stock: producto?.stock?.toString() || "0",
    stock_minimo: producto?.stock_minimo?.toString() || "5",
    costo_unitario_usd: producto?.costo_unitario_usd?.toString() || "0",
  })

  // Obtener tasa actual
  useEffect(() => {
    const obtenerTasa = async () => {
      try {
        const supabase = createClient()
        
        // Intentar obtener el primer registro (más reciente)
        const { data: configs, error } = await supabase
          .from("configuracion")
          .select("tasa_dolar")
          .order("actualizado_en", { ascending: false })
          .limit(1)
        
        if (error) {
          console.error("[v0] Error al obtener configuración:", error)
          setErrorCarga(`Error al cargar configuración: ${error.message}`)
          setTasaDolar(36.5)
        } else if (configs && configs.length > 0) {
          setTasaDolar(configs[0].tasa_dolar)
          setErrorCarga(null)
        } else {
          console.warn("[v0] No hay configuración, usando tasa por defecto")
          setErrorCarga("No hay configuración en la base de datos")
          setTasaDolar(36.5)
        }
      } catch (err) {
        console.error("[v0] Error inesperado:", err)
        setErrorCarga("Error inesperado al cargar la configuración")
        setTasaDolar(36.5)
      }
    }
    obtenerTasa()
  }, [])

  const calcularPrecioBs = () => {
    const precioUsd = Number.parseFloat(formData.precio_usd)
    if (isNaN(precioUsd) || precioUsd <= 0) return null
    return (precioUsd * tasaDolar).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // Validar datos antes de enviar
    const precioUsd = Number.parseFloat(formData.precio_usd)
    const stock = Number.parseInt(formData.stock)
    const stockMinimo = Number.parseInt(formData.stock_minimo)
    const costoUnitario = Number.parseFloat(formData.costo_unitario_usd)

    if (isNaN(precioUsd) || precioUsd <= 0) {
      toast({
        title: "Error de validación",
        description: "El precio en USD debe ser mayor a 0",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Error de validación",
        description: "El stock debe ser un número válido mayor o igual a 0",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const data = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || null,
      precio_bs: null, // Siempre null, se calcula dinámicamente
      precio_usd: precioUsd,
      stock: stock,
      stock_minimo: stockMinimo,
      costo_unitario_usd: costoUnitario,
      actualizado_en: new Date().toISOString(),
    }

    try {
      if (producto) {
        const { error } = await supabase
          .from("productos")
          .update(data)
          .eq("id", producto.id)

        if (error) {
          console.error("[v0] Error al actualizar:", error)
          throw new Error(`Error al actualizar: ${error.message}`)
        }

        toast({
          title: "✅ Producto actualizado",
          description: `${data.nombre} se actualizó correctamente`,
        })
      } else {
        const { error } = await supabase
          .from("productos")
          .insert(data)

        if (error) {
          console.error("[v0] Error al insertar:", error)
          throw new Error(`Error al crear: ${error.message}`)
        }

        toast({
          title: "✅ Producto creado",
          description: `${data.nombre} se agregó al inventario`,
        })
      }

      router.push("/productos")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error al guardar producto:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      
      toast({
        title: "Error al guardar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const precioBs = calcularPrecioBs()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorCarga && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorCarga}. Se usará la tasa por defecto (Bs. {tasaDolar.toFixed(2)})
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Solo ingresa el precio en USD. El precio en Bolívares se calculará automáticamente 
          usando la tasa actual (Bs. {tasaDolar.toFixed(2)}).
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Producto *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
          placeholder="Ej: Filtro de aceite"
          maxLength={255}
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
          min="0.01"
        />
        {precioBs && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Precio en Bolívares:</span> Bs. {precioBs}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Se calcula automáticamente con la tasa actual
            </p>
          </div>
        )}
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