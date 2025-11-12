import { requireAuth } from "@/lib/supabase/auth-helpers"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderPlus } from "lucide-react"
import { CategoriaForm } from "@/components/categoria-form"

export default async function NuevaCategoriaPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener categorías principales para el selector de padre
  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("organizacion_id", usuario.organizacion_id)
    .is("parent_id", null)
    .order("nombre", { ascending: true })

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <FolderPlus className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Nueva Categoría</h1>
          <p className="text-muted-foreground mt-1">Crea una nueva categoría o subcategoría</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
          <CardDescription>Completa los datos de la categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriaForm categoriasDisponibles={categorias || []} />
        </CardContent>
      </Card>
    </div>
  )
}
