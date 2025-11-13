import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderTree } from "lucide-react"
import Link from "next/link"
import { CategoriasTable } from "@/components/categorias-table"

export default async function CategoriasPage() {
  const usuario = await requireAuth()
  const supabase = await createClient()

  // Obtener categorías de la organización
  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("organizacion_id", usuario.organizacion_id)
    .order("orden", { ascending: true })

  // Contar productos por categoría
  const { data: productos } = await supabase
    .from("productos")
    .select("id, categoria_id")
    .eq("organizacion_id", usuario.organizacion_id)

  // Crear mapa de conteo de productos por categoría
  const productosCount = productos?.reduce(
    (acc, p) => {
      if (p.categoria_id) {
        acc[p.categoria_id] = (acc[p.categoria_id] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <FolderTree className="h-8 w-8 text-primary" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-black">Categorías de Productos</h1>
            <p className="text-muted-foreground mt-2">Organiza tus productos en categorías y subcategorías</p>
          </div>
        </div>
        <Link href="/categorias/nueva">
          <Button>
            <FolderTree className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            {categorias?.length || 0} categoría{categorias?.length !== 1 ? "s" : ""} registrada
            {categorias?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriasTable categorias={categorias || []} productosCount={productosCount || {}} />
        </CardContent>
      </Card>
    </div>
  )
}
