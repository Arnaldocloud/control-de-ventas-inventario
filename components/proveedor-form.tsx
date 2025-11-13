"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Proveedor } from "@/lib/types"

interface ProveedorFormProps {
  proveedor?: Proveedor
}

export function ProveedorForm({ proveedor }: ProveedorFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: proveedor?.nombre || "",
    empresa: proveedor?.empresa || "",
    email: proveedor?.email || "",
    telefono: proveedor?.telefono || "",
    documento_identidad: proveedor?.documento_identidad || "",
    direccion: proveedor?.direccion || "",
    ciudad: proveedor?.ciudad || "",
    estado: proveedor?.estado || "",
    codigo_postal: proveedor?.codigo_postal || "",
    notas: proveedor?.notas || "",
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

      const proveedorData = {
        ...formData,
        organizacion_id: usuario.organizacion_id,
        empresa: formData.empresa || null,
        email: formData.email || null,
        telefono: formData.telefono || null,
        documento_identidad: formData.documento_identidad || null,
        direccion: formData.direccion || null,
        ciudad: formData.ciudad || null,
        estado: formData.estado || null,
        codigo_postal: formData.codigo_postal || null,
        notas: formData.notas || null,
      }

      if (proveedor) {
        // Actualizar
        const { error } = await supabase.from("proveedores").update(proveedorData).eq("id", proveedor.id)

        if (error) throw error

        toast.success("Proveedor actualizado correctamente")
        router.push("/proveedores")
      } else {
        // Crear
        const { error } = await supabase.from("proveedores").insert(proveedorData)

        if (error) throw error

        toast.success("Proveedor creado correctamente")
        router.push("/proveedores")
      }

      router.refresh()
    } catch (error) {
      console.error("Error guardando proveedor:", error)
      toast.error("Error al guardar el proveedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
  <h3 className="text-lg font-semibold text-primary">Información Básica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Contacto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Ej: Proveedor XYZ C.A."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="0414-1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento_identidad">RIF / Documento</Label>
            <Input
              id="documento_identidad"
              value={formData.documento_identidad}
              onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
              placeholder="J-12345678-9"
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-4">
  <h3 className="text-lg font-semibold text-primary">Dirección</h3>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Calle, avenida, número..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              placeholder="Caracas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              placeholder="Miranda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_postal">Código Postal</Label>
            <Input
              id="codigo_postal"
              value={formData.codigo_postal}
              onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
              placeholder="1010"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-4">
  <h3 className="text-lg font-semibold text-primary">Notas Adicionales</h3>

        <div className="space-y-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Información adicional sobre el proveedor..."
            rows={3}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : proveedor ? "Actualizar Proveedor" : "Crear Proveedor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
