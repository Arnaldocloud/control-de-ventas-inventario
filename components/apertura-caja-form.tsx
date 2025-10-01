"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function AperturaCajaForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    monto_inicial_bs: "",
    monto_inicial_usd: "",
    notas: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar que no haya una caja abierta
      const { data: cajaAbierta } = await supabase.from("cierres_caja").select("id").eq("estado", "abierta").single()

      if (cajaAbierta) {
        toast.error("Ya existe una caja abierta")
        setLoading(false)
        return
      }

      // Crear apertura de caja
      const { error } = await supabase.from("cierres_caja").insert({
        monto_inicial_bs: Number.parseFloat(formData.monto_inicial_bs) || 0,
        monto_inicial_usd: Number.parseFloat(formData.monto_inicial_usd) || 0,
        notas: formData.notas || null,
        estado: "abierta",
      })

      if (error) throw error

      toast.success("Caja abierta exitosamente")
      router.refresh()
    } catch (error) {
      console.error("Error al abrir caja:", error)
      toast.error("Error al abrir la caja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="monto_inicial_bs">Monto Inicial en Bolívares</Label>
          <Input
            id="monto_inicial_bs"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.monto_inicial_bs}
            onChange={(e) => setFormData({ ...formData, monto_inicial_bs: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monto_inicial_usd">Monto Inicial en Dólares</Label>
          <Input
            id="monto_inicial_usd"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.monto_inicial_usd}
            onChange={(e) => setFormData({ ...formData, monto_inicial_usd: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Textarea
          id="notas"
          placeholder="Observaciones sobre la apertura..."
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Abriendo caja..." : "Abrir Caja"}
      </Button>
    </form>
  )
}
