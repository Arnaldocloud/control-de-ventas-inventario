"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, AlertTriangle, Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/types"
import { formatearNumero, formatearPrecio } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePagination } from "@/hooks/use-pagination"
import { Pagination } from "@/components/pagination"

// Componente para mostrar el precio con conversión
type ProductoPrecioProps = {
  precio: number | null;
  moneda: 'BS' | 'USD';
  tasaDolar: number;
  tasaOriginal?: number | null;
}

const ProductoPrecio = ({ precio, moneda, tasaDolar, tasaOriginal }: ProductoPrecioProps) => {
  if (precio === null) return <span className="text-muted-foreground">No definido</span>
  
  // Si hay una tasa original y es diferente a la actual, mostramos ambos precios
  const mostrarTasaAnterior = tasaOriginal && tasaOriginal !== tasaDolar && moneda === 'USD'
  
  return (
    <div className="flex flex-col">
      {moneda === 'USD' ? (
        <>
          <span>US$ {formatearNumero(precio)}</span>
          <span className="text-xs text-muted-foreground">
            ≈ Bs. {formatearNumero(precio * tasaDolar)}
          </span>
          {mostrarTasaAnterior && (
            <span className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Precio anterior: Bs. {formatearNumero(precio * (tasaOriginal || tasaDolar))}
            </span>
          )}
        </>
      ) : (
        <span>Bs. {formatearNumero(precio)}</span>
      )}
    </div>
  )
}

interface ProductosTableProps {
  productos: Producto[]
  tasaDolar: number
}

export function ProductosTable({ productos, tasaDolar }: ProductosTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroStock, setFiltroStock] = useState<"todos" | "bajo" | "sin-stock">("todos")
  const [ordenamiento, setOrdenamiento] = useState<"nombre" | "stock" | "precio">("nombre")
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos]

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim()
      resultado = resultado.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(termino) ||
          producto.descripcion?.toLowerCase().includes(termino) ||
          producto.codigo_barras?.includes(termino)
      )
    }

    // Filtro de stock
    if (filtroStock === "bajo") {
      resultado = resultado.filter((p) => p.stock > 0 && p.stock <= p.stock_minimo)
    } else if (filtroStock === "sin-stock") {
      resultado = resultado.filter((p) => p.stock === 0)
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre)
        case "stock":
          return a.stock - b.stock
        case "precio":
          return (a.precio_usd || 0) - (b.precio_usd || 0)
        default:
          return 0
      }
    })

    return resultado
  }, [productos, busqueda, filtroStock, ordenamiento])

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    totalItems,
  } = usePagination({
    items: productosFiltrados,
    itemsPerPage,
  })

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("productos").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const calcularInversion = (producto: Producto) => {
    return formatearNumero(producto.stock * producto.costo_unitario_usd)
  }

  const calcularPrecioBs = (precioUsd: number) => {
    return precioUsd * tasaDolar
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, descripción o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroStock} onValueChange={(value: any) => setFiltroStock(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="bajo">Stock Bajo</SelectItem>
            <SelectItem value="sin-stock">Sin Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ordenamiento} onValueChange={(value: any) => setOrdenamiento(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="precio">Precio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / página</SelectItem>
            <SelectItem value="25">25 / página</SelectItem>
            <SelectItem value="50">50 / página</SelectItem>
            <SelectItem value="100">100 / página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {totalItems} producto{totalItems !== 1 ? "s" : ""}
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold mb-1">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground">No hay productos que coincidan con "{busqueda}"</p>
        </div>
      ) : (
        <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Producto</TableHead>
                <TableHead className="font-semibold">Precio USD</TableHead>
                <TableHead className="font-semibold">Precio Bs.</TableHead>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold">Inversión (USD)</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((producto) => (
                <TableRow key={producto.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {producto.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{producto.nombre}</div>
                        {producto.descripcion && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{producto.descripcion}</div>
                        )}
                      </div>
                      {producto.stock <= producto.stock_minimo && (
                        <Badge variant="destructive" className="flex items-center gap-1 ml-2">
                          <AlertTriangle className="h-3 w-3" />
                          Stock Bajo
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    <ProductoPrecio 
                      precio={producto.precio_usd} 
                      moneda="USD" 
                      tasaDolar={tasaDolar}
                      tasaOriginal={producto.tasa_dolar_momento}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {producto.precio_usd ? `Bs. ${formatearNumero(calcularPrecioBs(producto.precio_usd))}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={producto.stock <= producto.stock_minimo ? "destructive" : "secondary"}
                      className="font-medium"
                    >
                      {producto.stock} unidades
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">USD {calcularInversion(producto)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/productos/${producto.id}/editar`)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === producto.id}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el producto{" "}
                              <strong>{producto.nombre}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(producto.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  )
}
