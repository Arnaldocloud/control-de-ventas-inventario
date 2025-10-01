import { createClient } from "@/lib/supabase/server"
import { ConfiguracionForm } from "@/components/configuracion-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const { data: config } = await supabase.from("configuracion").select("*").single()

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
          <CardDescription>Actualiza la tasa del dólar y otros parámetros</CardDescription>
        </CardHeader>
        <CardContent>
          <ConfiguracionForm config={config} />
        </CardContent>
      </Card>
    </div>
  )
}
