import { createClient } from "@/lib/supabase/server"
import { ProductoForm } from "@/components/producto-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener el producto y la tasa actual del dólar en paralelo
  const [
    { data: producto, error },
    { data: config }
  ] = await Promise.all([
    supabase.from("productos").select("*").eq("id", id).single(),
    supabase.from("configuracion").select("tasa_dolar").single()
  ])

  if (error || !producto) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <CardDescription>Actualiza la información del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductoForm 
            producto={producto} 
            tasaDolar={config?.tasa_dolar || producto.tasa_dolar_momento || 36.5} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
