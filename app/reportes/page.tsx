import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, TrendingUp, Package, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReportesVentas } from "@/components/reportes-ventas"
import { ReportesInventario } from "@/components/reportes-inventario"

export default async function ReportesPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener datos para reportes
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)

  // Ventas del mes
  const { data: ventasMes } = await supabase
    .from("ventas")
    .select("*, ventas_detalle(*)")
    .eq("organizacion_id", usuario.organizacion_id)
    .gte("creado_en", inicioMes.toISOString())
    .lte("creado_en", finMes.toISOString())

  // Productos con stock bajo
  const { data: productosStockBajo } = await supabase
    .from("productos")
    .select("*")
    .eq("organizacion_id", usuario.organizacion_id)
    .lte("stock", supabase.rpc("stock_minimo"))

  // Top productos vendidos
  const { data: topProductos } = await supabase
    .from("ventas_detalle")
    .select("producto_id, cantidad, productos(nombre)")
    .eq("organizacion_id", usuario.organizacion_id)
    .gte("creado_en", inicioMes.toISOString())

  // Estadísticas generales
  const totalVentasMes = ventasMes?.reduce((sum, v) => sum + v.total, 0) || 0
  const cantidadVentas = ventasMes?.length || 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-black">Reportes y Análisis</h1>
            <p className="text-muted-foreground mt-2">Visualiza y exporta reportes de tu negocio</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentasMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cantidadVentas} ventas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosStockBajo?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Productos requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProductos?.reduce((sum, p) => sum + p.cantidad, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Unidades vendidas este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cantidadVentas > 0 ? (totalVentasMes / cantidadVentas).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Ticket promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Reportes de Ventas */}
      <div className="mb-8">
        <ReportesVentas ventas={ventasMes || []} />
      </div>

      {/* Reportes de Inventario */}
      <div className="mb-8">
        <ReportesInventario productos={productosStockBajo || []} />
      </div>

      {/* Enlaces rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Ventas</CardTitle>
            <CardDescription>Exporta el detalle completo de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reportes/ventas">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Ver Reporte
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporte de Inventario</CardTitle>
            <CardDescription>Analiza el estado de tu inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reportes/inventario">
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Ver Reporte
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análisis de Rentabilidad</CardTitle>
            <CardDescription>Calcula márgenes y ganancias</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reportes/rentabilidad">
              <Button className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Análisis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
