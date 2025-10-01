import { createClient } from "@/lib/supabase/server"
import { ProductoForm } from "@/components/producto-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto, error } = await supabase.from("productos").select("*").eq("id", id).single()

  if (error || !producto) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <CardDescription>Actualiza la información del repuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductoForm producto={producto} />
        </CardContent>
      </Card>
    </div>
  )
}
