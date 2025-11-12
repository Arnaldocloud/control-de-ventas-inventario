"use client"

import React from "react"
import { Categoria } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Folder, FolderOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CategoriasTableProps {
  categorias: Categoria[]
  productosCount: Record<string, number>
}

export function CategoriasTable({ categorias, productosCount }: CategoriasTableProps) {
  const router = useRouter()
  const supabase = createClient()

  // Organizar categorías en jerarquía
  const categoriasPrincipales = categorias.filter((c) => !c.parent_id)
  const subcategorias = categorias.filter((c) => c.parent_id)

  const getSubcategorias = (parentId: string) => {
    return subcategorias.filter((c) => c.parent_id === parentId)
  }

  const handleEliminar = async (id: string, nombre: string) => {
    try {
      // Verificar si tiene subcategorías
      const subs = getSubcategorias(id)
      if (subs.length > 0) {
        toast.error("No puedes eliminar una categoría que tiene subcategorías")
        return
      }

      // Verificar si tiene productos
      const count = productosCount[id] || 0
      if (count > 0) {
        toast.error(`No puedes eliminar una categoría que tiene ${count} producto(s) asignado(s)`)
        return
      }

      const { error } = await supabase.from("categorias").delete().eq("id", id)

      if (error) throw error

      toast.success(`Categoría "${nombre}" eliminada correctamente`)
      router.refresh()
    } catch (error) {
      console.error("Error eliminando categoría:", error)
      toast.error("Error al eliminar la categoría")
    }
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay categorías registradas aún.</p>
        <Link href="/categorias/nueva">
          <Button className="mt-4">Crear Primera Categoría</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Categoría</th>
                <th className="p-3 text-left font-medium">Descripción</th>
                <th className="p-3 text-center font-medium">Productos</th>
                <th className="p-3 text-center font-medium">Orden</th>
                <th className="p-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasPrincipales.map((categoria) => {
                const subs = getSubcategorias(categoria.id)
                const count = productosCount[categoria.id] || 0

                return (
                  <React.Fragment key={categoria.id}>
                    {/* Categoría Principal */}
                    <tr className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{categoria.nombre}</p>
                            {categoria.icono && <span className="text-xl">{categoria.icono}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-muted-foreground">{categoria.descripcion || "-"}</p>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">{categoria.orden}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/categorias/${categoria.id}/editar`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Eliminar">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la categoría "{categoria.nombre}". Esta acción
                                  no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>

                    {/* Subcategorías */}
                    {subs.map((sub) => {
                      const subCount = productosCount[sub.id] || 0
                      return (
                        <tr key={sub.id} className="border-b hover:bg-muted/50 transition-colors bg-muted/20">
                          <td className="p-3 pl-12">
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">{sub.nombre}</p>
                              {sub.icono && <span className="text-lg">{sub.icono}</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-sm text-muted-foreground">{sub.descripcion || "-"}</p>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={subCount > 0 ? "default" : "secondary"} className="text-xs">
                              {subCount}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">{sub.orden}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/categorias/${sub.id}/editar`}>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Eliminar">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción eliminará permanentemente la subcategoría "{sub.nombre}". Esta acción
                                      no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleEliminar(sub.id, sub.nombre)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
