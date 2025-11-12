"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Configuracion } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, RefreshCw } from "lucide-react"

interface ConfiguracionFormProps {
  config: Configuracion | null
}

export function ConfiguracionForm({ config }: ConfiguracionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tasaDolar, setTasaDolar] = useState(config?.tasa_dolar.toString() || "36.50")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const nuevaTasa = Number.parseFloat(tasaDolar)

      if (nuevaTasa <= 0) {
        toast({
          title: "Error",
          description: "La tasa del dólar debe ser mayor a 0",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Si hay un config, actualizarlo. Si no, insertar uno nuevo
      let error = null
      
      if (config?.id) {
        const result = await supabase
          .from("configuracion")
          .update({
            tasa_dolar: nuevaTasa,
            actualizado_en: new Date().toISOString(),
          })
          .eq("id", config.id)
        error = result.error
      } else {
        // No hay configuración, crear una nueva
        const result = await supabase
          .from("configuracion")
          .insert({
            tasa_dolar: nuevaTasa,
            actualizado_en: new Date().toISOString(),
          })
        error = result.error
      }

      if (error) throw error

      toast({
        title: "✅ Tasa actualizada exitosamente",
        description: `Nueva tasa: Bs. ${nuevaTasa.toFixed(2)} por dólar. Todos los precios se actualizarán automáticamente.`,
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error al actualizar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calcularEjemplo = () => {
    const tasa = Number.parseFloat(tasaDolar)
    if (isNaN(tasa) || tasa <= 0) return null
    return {
      usd10: (10 * tasa).toFixed(2),
      usd50: (50 * tasa).toFixed(2),
      usd100: (100 * tasa).toFixed(2),
    }
  }

  const ejemplo = calcularEjemplo()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>¿Cómo funciona?</AlertTitle>
        <AlertDescription>
          Los precios de todos los productos se calculan automáticamente en Bolívares usando esta tasa.
          No necesitas actualizar los productos manualmente.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="tasa_dolar">Tasa del Dólar (Bs. por cada USD) *</Label>
        <Input
          id="tasa_dolar"
          type="number"
          step="0.01"
          value={tasaDolar}
          onChange={(e) => setTasaDolar(e.target.value)}
          required
          min="0.01"
          placeholder="36.50"
          className="text-lg font-semibold"
        />
        
        {ejemplo && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Ejemplos de conversión:</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p>$ 10.00 USD = <span className="font-bold">Bs. {ejemplo.usd10}</span></p>
              <p>$ 50.00 USD = <span className="font-bold">Bs. {ejemplo.usd50}</span></p>
              <p>$ 100.00 USD = <span className="font-bold">Bs. {ejemplo.usd100}</span></p>
            </div>
          </div>
        )}
      </div>

      {config && (
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>
              Última actualización: {new Date(config.actualizado_en).toLocaleString("es-VE", {
                dateStyle: "full",
                timeStyle: "short"
              })}
            </span>
          </div>
          <div className="mt-2">
            Tasa actual: <span className="font-bold">Bs. {config.tasa_dolar.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            "Actualizar Tasa del Dólar"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>

      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Importante:</strong> Al cambiar la tasa, todos los precios en Bolívares se recalcularán 
          automáticamente en tiempo real. No afecta los precios en USD ni el historial de ventas.
        </AlertDescription>
      </Alert>
    </form>
  )
}