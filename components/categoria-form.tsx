"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Categoria } from "@/lib/types"

interface CategoriaFormProps {
  categoria?: Categoria
  categoriasDisponibles: Categoria[]
}

const COLORES = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "yellow", label: "Amarillo", class: "bg-yellow-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-500" },
  { value: "orange", label: "Naranja", class: "bg-orange-500" },
  { value: "gray", label: "Gris", class: "bg-gray-500" },
]

export function CategoriaForm({ categoria, categoriasDisponibles }: CategoriaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: categoria?.nombre || "",
    descripcion: categoria?.descripcion || "",
    icono: categoria?.icono || "",
    color: categoria?.color || "blue",
    parent_id: categoria?.parent_id || "none",
    orden: categoria?.orden || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        toast.error("El nombre es obligatorio")
        setLoading(false)
        return
      }

      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const { data: usuario } = await supabase.from("usuarios").select("organizacion_id").eq("id", user.id).single()

      if (!usuario) throw new Error("Usuario no encontrado")

      const categoriaData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        icono: formData.icono.trim() || null,
        color: formData.color,
        parent_id: formData.parent_id === "none" ? null : formData.parent_id,
        orden: formData.orden,
        organizacion_id: usuario.organizacion_id,
      }

      if (categoria) {
        // Actualizar
        const { error } = await supabase.from("categorias").update(categoriaData).eq("id", categoria.id)

        if (error) throw error

        toast.success("Categoría actualizada correctamente")
        router.push("/categorias")
      } else {
        // Crear
        const { error } = await supabase.from("categorias").insert(categoriaData)

        if (error) throw error

        toast.success("Categoría creada correctamente")
        router.push("/categorias")
      }

      router.refresh()
    } catch (error) {
      console.error("Error guardando categoría:", error)
      toast.error("Error al guardar la categoría")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Repuestos de Motor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripción de la categoría..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icono">Icono (Emoji)</Label>
            <Input
              id="icono"
              value={formData.icono}
              onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
              placeholder="🔧"
              maxLength={2}
            />
            <p className="text-xs text-muted-foreground">Usa un emoji para representar la categoría</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORES.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${color.class}`} />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parent_id">Categoría Padre (opcional)</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin categoría padre (principal)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría padre (principal)</SelectItem>
                {categoriasDisponibles
                  .filter((c) => c.id !== categoria?.id)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Deja vacío para crear una categoría principal, o selecciona una para crear una subcategoría
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orden">Orden</Label>
            <Input
              id="orden"
              type="number"
              min="0"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Orden de visualización (menor número = primero)</p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : categoria ? "Actualizar Categoría" : "Crear Categoría"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
