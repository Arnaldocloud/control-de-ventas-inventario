import { createClient } from "@/lib/supabase/server"
import { ProductoForm } from "@/components/producto-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  
  // Obtener la tasa actual del dólar
  const { data: config } = await supabase
    .from('configuracion')
    .select('tasa_dolar')
    .single()

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nuevo Producto</CardTitle>
          <CardDescription>Completa la información del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductoForm tasaDolar={config?.tasa_dolar} />
        </CardContent>
      </Card>
    </div>
  )
}
