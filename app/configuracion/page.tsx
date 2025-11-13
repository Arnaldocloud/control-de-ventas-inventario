import { createClient } from "@/lib/supabase/server"
import { ConfiguracionForm } from "@/components/configuracion-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  // Obtener el primer registro de configuración (el más reciente)
  const { data: configs, error } = await supabase
    .from("configuracion")
    .select("*")
    .order("actualizado_en", { ascending: false })
    .limit(1)

  const config = configs && configs.length > 0 ? configs[0] : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
          <CardDescription>Actualiza la tasa del dólar y otros parámetros</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar la configuración: {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          {!config && !error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay configuración guardada. Se creará una nueva al guardar.
              </AlertDescription>
            </Alert>
          )}
          
          <ConfiguracionForm config={config} />
        </CardContent>
      </Card>
    </div>
  )
}