"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { CierreCaja } from "@/lib/types"
import { formatearPrecio } from "@/lib/utils"

interface CierreCajaFormProps {
  cajaActiva: CierreCaja
}

export function CierreCajaForm({ cajaActiva }: CierreCajaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [calculando, setCalculando] = useState(true)
  const [totales, setTotales] = useState({
    efectivo_bs: 0,
    efectivo_usd: 0,
    punto: 0,
    pago_movil: 0,
    transferencia: 0,
    mixto: 0,
    cantidad_ventas: 0,
  })
  const [formData, setFormData] = useState({
    monto_contado_bs: "",
    monto_contado_usd: "",
    notas: "",
  })

  useEffect(() => {
    calcularTotales()
  }, [])

  const calcularTotales = async () => {
    try {
      const supabase = createClient()

      // Obtener todas las ventas desde la apertura de caja
      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("total, moneda, metodo_pago")
        .gte("creado_en", cajaActiva.fecha_apertura)

      if (error) throw error

      let efectivo_bs = 0
      let efectivo_usd = 0
      let punto = 0
      let pago_movil = 0
      let transferencia = 0
      let mixto = 0

      ventas?.forEach((venta) => {
        const total = venta.total || 0

        if (venta.metodo_pago === "Efectivo") {
          if (venta.moneda === "BS") {
            efectivo_bs += total
          } else {
            efectivo_usd += total
          }
        } else if (venta.metodo_pago === "Punto") {
          punto += total
        } else if (venta.metodo_pago === "Pago Móvil") {
          pago_movil += total
        } else if (venta.metodo_pago === "Transferencia") {
          transferencia += total
        } else if (venta.metodo_pago === "Mixto") {
          mixto += total
        }
      })

      setTotales({
        efectivo_bs,
        efectivo_usd,
        punto,
        pago_movil,
        transferencia,
        mixto,
        cantidad_ventas: ventas?.length || 0,
      })
    } catch (error) {
      console.error("Error al calcular totales:", error)
      toast.error("Error al calcular los totales de ventas")
    } finally {
      setCalculando(false)
    }
  }

  const calcularMontoFinal = (moneda: "bs" | "usd") => {
    if (moneda === "bs") {
      return cajaActiva.monto_inicial_bs + totales.efectivo_bs
    } else {
      return cajaActiva.monto_inicial_usd + totales.efectivo_usd
    }
  }

  const calcularDiferencia = (moneda: "bs" | "usd") => {
    const contado =
      moneda === "bs"
        ? Number.parseFloat(formData.monto_contado_bs) || 0
        : Number.parseFloat(formData.monto_contado_usd) || 0
    const esperado = calcularMontoFinal(moneda)
    return contado - esperado
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const monto_final_bs = calcularMontoFinal("bs")
      const monto_final_usd = calcularMontoFinal("usd")
      const monto_contado_bs = Number.parseFloat(formData.monto_contado_bs) || 0
      const monto_contado_usd = Number.parseFloat(formData.monto_contado_usd) || 0
      const diferencia_bs = calcularDiferencia("bs")
      const diferencia_usd = calcularDiferencia("usd")

      // Actualizar el cierre de caja
      const { error } = await supabase
        .from("cierres_caja")
        .update({
          fecha_cierre: new Date().toISOString(),
          monto_final_bs,
          monto_final_usd,
          monto_contado_bs,
          monto_contado_usd,
          diferencia_bs,
          diferencia_usd,
          total_ventas_efectivo_bs: totales.efectivo_bs,
          total_ventas_efectivo_usd: totales.efectivo_usd,
          total_ventas_punto: totales.punto,
          total_ventas_pago_movil: totales.pago_movil,
          total_ventas_transferencia: totales.transferencia,
          total_ventas_mixto: totales.mixto,
          cantidad_ventas: totales.cantidad_ventas,
          estado: "cerrada",
          notas: formData.notas || null,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", cajaActiva.id)

      if (error) throw error

      toast.success("Caja cerrada exitosamente")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar caja:", error)
      toast.error("Error al cerrar la caja")
    } finally {
      setLoading(false)
    }
  }

  if (calculando) {
    return <div className="text-center py-8">Calculando totales...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total de ventas:</span>
              <span className="font-medium">{totales.cantidad_ventas}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Efectivo Bs.:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.efectivo_bs)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Efectivo USD:</span>
              <span className="font-medium">USD {formatearPrecio(totales.efectivo_usd)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Punto de Venta:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.punto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pago Móvil:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.pago_movil)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transferencia:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.transferencia)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mixto:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.mixto)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Efectivo Esperado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Inicial Bs.:</span>
              <span className="font-medium">Bs. {formatearPrecio(cajaActiva.monto_inicial_bs)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ventas Bs.:</span>
              <span className="font-medium">Bs. {formatearPrecio(totales.efectivo_bs)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Esperado Bs.:</span>
              <span>Bs. {formatearPrecio(calcularMontoFinal("bs"))}</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Inicial USD:</span>
              <span className="font-medium">USD {formatearPrecio(cajaActiva.monto_inicial_usd)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ventas USD:</span>
              <span className="font-medium">USD {formatearPrecio(totales.efectivo_usd)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Esperado USD:</span>
              <span>USD {formatearPrecio(calcularMontoFinal("usd"))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="monto_contado_bs">Efectivo Contado en Bolívares</Label>
          <Input
            id="monto_contado_bs"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.monto_contado_bs}
            onChange={(e) => setFormData({ ...formData, monto_contado_bs: e.target.value })}
            required
          />
          {formData.monto_contado_bs && (
            <p className={`text-sm ${calcularDiferencia("bs") >= 0 ? "text-green-600" : "text-red-600"}`}>
              Diferencia: Bs. {formatearPrecio(Math.abs(calcularDiferencia("bs")))}{" "}
              {calcularDiferencia("bs") >= 0 ? "(Sobrante)" : "(Faltante)"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monto_contado_usd">Efectivo Contado en Dólares</Label>
          <Input
            id="monto_contado_usd"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.monto_contado_usd}
            onChange={(e) => setFormData({ ...formData, monto_contado_usd: e.target.value })}
            required
          />
          {formData.monto_contado_usd && (
            <p className={`text-sm ${calcularDiferencia("usd") >= 0 ? "text-green-600" : "text-red-600"}`}>
              Diferencia: USD {formatearPrecio(Math.abs(calcularDiferencia("usd")))}{" "}
              {calcularDiferencia("usd") >= 0 ? "(Sobrante)" : "(Faltante)"}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas de Cierre (opcional)</Label>
        <Textarea
          id="notas"
          placeholder="Observaciones sobre el cierre..."
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Cerrando caja..." : "Cerrar Caja"}
      </Button>
    </form>
  )
}
