import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from "lucide-react"
import { ProductosStockBajo } from "@/components/productos-stock-bajo"
import { VentasRecientes } from "@/components/ventas-recientes"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatearNumero } from "@/lib/utils"

export default async function HomePage() {
  const supabase = await createClient()

  // Obtener productos
  const { data: productos } = await supabase.from("productos").select("*")

  // Obtener ventas del día
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const { data: ventasHoy } = await supabase.from("ventas").select("*").gte("creado_en", hoy.toISOString())

  // Obtener configuración
  const { data: config } = await supabase.from("configuracion").select("*").single()

  const { data: cajaActiva } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("estado", "abierta")
    .order("fecha_apertura", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Calcular métricas
  const totalProductos = productos?.length || 0
  const productosStockBajo = productos?.filter((p) => p.stock <= p.stock_minimo).length || 0

  const inversionTotal =
    productos?.reduce((sum, p) => {
      return sum + p.stock * p.costo_unitario_usd
    }, 0) || 0

  const ventasTotalesHoy = ventasHoy?.length || 0

  const ingresosDiaUSD =
    ventasHoy?.reduce((sum, v) => {
      if (v.moneda === "USD") {
        return sum + v.total
      }
      return sum + v.total / (v.tasa_dolar_momento || config?.tasa_dolar || 36.5)
    }, 0) || 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">Control de Ventas e Inventario</h1>
          <p className="text-muted-foreground mt-2">Panel de control de tu comercio</p>
        </div>
      
      </div>

      {!cajaActiva && (
        <Card className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
              <XCircle className="h-5 w-5" />
              Caja Cerrada
            </CardTitle>
            <CardDescription>No hay una caja abierta. Debes abrir la caja antes de realizar ventas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/caja">
              <Button>Abrir Caja</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {cajaActiva && (
        <Card className="mb-8 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              Caja Abierta
            </CardTitle>
            <CardDescription>
              Caja abierta desde el{" "}
              {new Date(cajaActiva.fecha_apertura).toLocaleString("es-VE", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monto inicial:</p>
                <div className="flex gap-4">
                  <span className="font-medium">Bs. {formatearNumero(cajaActiva.monto_inicial_bs)}</span>
                  <span className="font-medium">$ {formatearNumero(cajaActiva.monto_inicial_usd)}</span>
                </div>
              </div>
              <Link href="/caja">
                <Button variant="outline">Ir a Caja</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Azul - Total Productos */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Total Productos</h3>
            <div className="rounded-full bg-white/20 p-2">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{totalProductos}</div>
          <p className="text-sm opacity-80">Productos en inventario</p>
        </div>

        {/* Card Verde - Inversión Total */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Inversión Total</h3>
            <div className="rounded-full bg-white/20 p-2">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">$ {formatearNumero(inversionTotal)}</div>
          <p className="text-sm opacity-80">Valor del inventario</p>
        </div>

        {/* Card Naranja - Ventas Hoy */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Ventas Hoy</h3>
            <div className="rounded-full bg-white/20 p-2">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{ventasTotalesHoy}</div>
          <p className="text-sm opacity-80">Transacciones realizadas</p>
        </div>

        {/* Card Morado - Ingresos Hoy */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Ingresos Hoy</h3>
            <div className="rounded-full bg-white/20 p-2">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">$ {formatearNumero(ingresosDiaUSD)}</div>
          <p className="text-sm opacity-80">Equivalente en USD</p>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {productosStockBajo > 0 && (
        <Card className="mb-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Stock Bajo
            </CardTitle>
            <CardDescription>
              Hay {productosStockBajo} producto{productosStockBajo > 1 ? "s" : ""} con stock bajo o agotado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductosStockBajo productos={productos?.filter((p) => p.stock <= p.stock_minimo) || []} />
          </CardContent>
        </Card>
      )}

      {/* Información de tasa del dólar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tasa del Dólar Actual</CardTitle>
          <CardDescription>
            Última actualización: {config ? new Date(config.actualizado_en).toLocaleString("es-VE") : "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">Bs. {formatearNumero(config?.tasa_dolar || 36.5)}</div>
              <p className="text-sm text-muted-foreground mt-1">por cada dólar</p>
            </div>
            <Link href="/configuracion">
              <Button>Actualizar Tasa</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Ventas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
          <CardDescription>Últimas 10 transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Corregido: uso de componente asíncrono */}
          {await VentasRecientes()}
        </CardContent>
      </Card>
    </div>
  )
}