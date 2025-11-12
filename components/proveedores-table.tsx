"use client"

import { Proveedor } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Phone, Mail, Building2 } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { formatearNumero } from "@/lib/utils"
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

interface ProveedoresTableProps {
  proveedores: Proveedor[]
}

export function ProveedoresTable({ proveedores }: ProveedoresTableProps) {
  const [busqueda, setBusqueda] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.telefono?.includes(busqueda) ||
      proveedor.documento_identidad?.includes(busqueda)
  )

  const handleEliminar = async (id: string, nombre: string) => {
    try {
      const { error } = await supabase.from("proveedores").delete().eq("id", id)

      if (error) throw error

      toast.success(`Proveedor "${nombre}" eliminado correctamente`)
      router.refresh()
    } catch (error) {
      console.error("Error eliminando proveedor:", error)
      toast.error("Error al eliminar el proveedor")
    }
  }

  if (proveedores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay proveedores registrados aún.</p>
        <Link href="/proveedores/nuevo">
          <Button className="mt-4">Agregar Primer Proveedor</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre, empresa, email, teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-muted-foreground">
          {proveedoresFiltrados.length} de {proveedores.length} proveedor{proveedores.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Proveedor</th>
                <th className="p-3 text-left font-medium">Contacto</th>
                <th className="p-3 text-left font-medium">Documento</th>
                <th className="p-3 text-right font-medium">Total Compras</th>
                <th className="p-3 text-center font-medium">Compras</th>
                <th className="p-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{proveedor.nombre}</p>
                      {proveedor.empresa && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          <span>{proveedor.empresa}</span>
                        </div>
                      )}
                      {proveedor.ciudad && (
                        <p className="text-sm text-muted-foreground">
                          {proveedor.ciudad}
                          {proveedor.estado && `, ${proveedor.estado}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {proveedor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{proveedor.email}</span>
                        </div>
                      )}
                      {proveedor.telefono && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{proveedor.telefono}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {proveedor.documento_identidad && (
                      <div className="text-sm">
                        <span className="font-mono">{proveedor.documento_identidad}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-medium">$ {formatearNumero(proveedor.total_compras)}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-muted-foreground">{proveedor.cantidad_compras}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/proveedores/${proveedor.id}`}>
                        <Button variant="ghost" size="icon" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/proveedores/${proveedor.id}/editar`}>
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
                              Esta acción eliminará permanentemente al proveedor "{proveedor.nombre}". Esta acción no
                              se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEliminar(proveedor.id, proveedor.nombre)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {proveedoresFiltrados.length === 0 && busqueda && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron proveedores que coincidan con "{busqueda}"</p>
        </div>
      )}
    </div>
  )
}
