"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { VentaCompleta } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { exportarVentasPDF, exportarVentasExcel } from "@/lib/exportar-reportes"
import { toast } from "sonner"

interface ReportesVentasProps {
  ventas: VentaCompleta[]
}

export function ReportesVentas({ ventas }: ReportesVentasProps) {
  // Agrupar ventas por día
  const ventasPorDia = ventas.reduce(
    (acc, venta) => {
      const fecha = new Date(venta.creado_en).toLocaleDateString("es-VE", {
        month: "short",
        day: "numeric",
      })
      if (!acc[fecha]) {
        acc[fecha] = 0
      }
      acc[fecha] += venta.total
      return acc
    },
    {} as Record<string, number>
  )

  const datosGrafico = Object.entries(ventasPorDia).map(([fecha, total]) => ({
    fecha,
    ventas: total,
  }))

  const handleExportarPDF = () => {
    try {
      exportarVentasPDF(ventas)
      toast.success("Reporte PDF generado correctamente")
    } catch (error) {
      console.error("Error exportando PDF:", error)
      toast.error("Error al generar el PDF")
    }
  }

  const handleExportarExcel = () => {
    try {
      exportarVentasExcel(ventas)
      toast.success("Reporte Excel generado correctamente")
    } catch (error) {
      console.error("Error exportando Excel:", error)
      toast.error("Error al generar el Excel")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gráfico de Ventas</CardTitle>
            <CardDescription>Ventas diarias del mes actual</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportarPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportarExcel}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {datosGrafico.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Ventas"]}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No hay datos de ventas para mostrar en el gráfico
          </div>
        )}
      </CardContent>
    </Card>
  )
}
