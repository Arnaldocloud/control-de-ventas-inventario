"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertTriangle } from "lucide-react"
import { Producto } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { exportarInventarioPDF, exportarInventarioExcel } from "@/lib/exportar-reportes"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ReportesInventarioProps {
  productos: Producto[]
}

export function ReportesInventario({ productos }: ReportesInventarioProps) {
  const datosGrafico = productos.slice(0, 10).map((producto) => ({
    nombre: producto.nombre.substring(0, 20),
    stock: producto.stock,
    minimo: producto.stock_minimo,
  }))

  const handleExportarPDF = () => {
    try {
      exportarInventarioPDF(productos)
      toast.success("Reporte PDF generado correctamente")
    } catch (error) {
      console.error("Error exportando PDF:", error)
      toast.error("Error al generar el PDF")
    }
  }

  const handleExportarExcel = () => {
    try {
      exportarInventarioExcel(productos)
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Productos con Stock Bajo
            </CardTitle>
            <CardDescription>Top 10 productos que requieren reposición</CardDescription>
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
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#ef4444" name="Stock Actual" />
                <Bar dataKey="minimo" fill="#f59e0b" name="Stock Mínimo" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Detalle de Productos</h4>
              <div className="space-y-2">
                {productos.slice(0, 5).map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {producto.stock} / Mínimo: {producto.stock_minimo}
                      </p>
                    </div>
                    <Badge variant={producto.stock === 0 ? "destructive" : "secondary"}>
                      {producto.stock === 0 ? "Sin Stock" : "Stock Bajo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            ¡Excelente! No hay productos con stock bajo
          </div>
        )}
      </CardContent>
    </Card>
  )
}
