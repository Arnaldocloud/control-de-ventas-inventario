import { ProductoForm } from "@/components/producto-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NuevoProductoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nuevo Producto</CardTitle>
          <CardDescription>Completa la información del repuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductoForm />
        </CardContent>
      </Card>
    </div>
  )
}
