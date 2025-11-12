"use client"

import { Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Phone, Mail } from "lucide-react"
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

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [busqueda, setBusqueda] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono?.includes(busqueda) ||
      cliente.documento_identidad?.includes(busqueda)
  )

  const handleEliminar = async (id: string, nombre: string) => {
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id)

      if (error) throw error

      toast.success(`Cliente "${nombre}" eliminado correctamente`)
      router.refresh()
    } catch (error) {
      console.error("Error eliminando cliente:", error)
      toast.error("Error al eliminar el cliente")
    }
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay clientes registrados aún.</p>
        <Link href="/clientes/nuevo">
          <Button className="mt-4">Agregar Primer Cliente</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre, email, teléfono o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-muted-foreground">
          {clientesFiltrados.length} de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Cliente</th>
                <th className="p-3 text-left font-medium">Contacto</th>
                <th className="p-3 text-left font-medium">Documento</th>
                <th className="p-3 text-right font-medium">Total Compras</th>
                <th className="p-3 text-center font-medium">Compras</th>
                <th className="p-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{cliente.nombre}</p>
                      {cliente.ciudad && (
                        <p className="text-sm text-muted-foreground">
                          {cliente.ciudad}
                          {cliente.estado && `, ${cliente.estado}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{cliente.email}</span>
                        </div>
                      )}
                      {cliente.telefono && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{cliente.telefono}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {cliente.documento_identidad && (
                      <div className="text-sm">
                        <span className="font-mono">{cliente.documento_identidad}</span>
                        {cliente.tipo_documento && (
                          <span className="text-muted-foreground ml-1">({cliente.tipo_documento})</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-medium">$ {formatearNumero(cliente.total_compras)}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-muted-foreground">{cliente.cantidad_compras}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/clientes/${cliente.id}`}>
                        <Button variant="ghost" size="icon" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/clientes/${cliente.id}/editar`}>
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
                              Esta acción eliminará permanentemente al cliente "{cliente.nombre}". Esta acción no se
                              puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEliminar(cliente.id, cliente.nombre)}
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

      {clientesFiltrados.length === 0 && busqueda && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron clientes que coincidan con "{busqueda}"</p>
        </div>
      )}
    </div>
  )
}
