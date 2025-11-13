import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AperturaCajaForm } from "@/components/apertura-caja-form"
import { CierreCajaForm } from "@/components/cierre-caja-form"
import { CierresTable } from "@/components/cierres-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Optimización: Revalidar cada 30 segundos
export const revalidate = 30
export const dynamic = "force-dynamic"

export default async function CajaPage() {
  const supabase = await createClient()

  // Obtener caja activa
  const { data: cajaActiva } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("estado", "abierta")
    .order("fecha_apertura", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Obtener historial de cierres
  const { data: historialCierres } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("estado", "cerrada")
    .order("fecha_cierre", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
    <h1 className="text-3xl font-bold tracking-tight text-black">Control de Caja</h1>
        <p className="text-muted-foreground">Gestiona la apertura y cierre de caja diario</p>
      </div>

      {!cajaActiva ? (
        <Card>
          <CardHeader>
            <CardTitle>Apertura de Caja</CardTitle>
            <CardDescription>Registra el monto inicial en efectivo para comenzar el turno</CardDescription>
          </CardHeader>
          <CardContent>
            <AperturaCajaForm />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Caja abierta desde el{" "}
              {new Date(cajaActiva.fecha_apertura).toLocaleString("es-VE", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Cierre de Caja</CardTitle>
              <CardDescription>Registra el efectivo contado y cierra el turno actual</CardDescription>
            </CardHeader>
            <CardContent>
              <CierreCajaForm cajaActiva={cajaActiva} />
            </CardContent>
          </Card>
        </div>
      )}

      {historialCierres && historialCierres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cierres</CardTitle>
            <CardDescription>Últimos 10 cierres de caja realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <CierresTable cierres={historialCierres} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
