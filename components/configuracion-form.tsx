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
      const { error } = await supabase
        .from("configuracion")
        .update({
          tasa_dolar: Number.parseFloat(tasaDolar),
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", config?.id || "")

      if (error) throw error

      toast({
        title: "Configuración actualizada",
        description: "La tasa del dólar se actualizó correctamente",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tasa_dolar">Tasa del Dólar (Bs.) *</Label>
        <Input
          id="tasa_dolar"
          type="number"
          step="0.01"
          value={tasaDolar}
          onChange={(e) => setTasaDolar(e.target.value)}
          required
          min="0"
          placeholder="36.50"
        />
        <p className="text-sm text-muted-foreground">
          Esta tasa se usará para calcular equivalencias en las ventas en bolívares
        </p>
      </div>

      {config && (
        <div className="text-sm text-muted-foreground">
          Última actualización: {new Date(config.actualizado_en).toLocaleString("es-VE")}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Actualizar Tasa"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
