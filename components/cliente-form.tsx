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
import { Cliente, TipoDocumento } from "@/lib/types"

interface ClienteFormProps {
  cliente?: Cliente
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || "",
    email: cliente?.email || "",
    telefono: cliente?.telefono || "",
    documento_identidad: cliente?.documento_identidad || "",
    tipo_documento: cliente?.tipo_documento || ("CI" as TipoDocumento),
    direccion: cliente?.direccion || "",
    ciudad: cliente?.ciudad || "",
    estado: cliente?.estado || "",
    codigo_postal: cliente?.codigo_postal || "",
    notas: cliente?.notas || "",
    limite_credito: cliente?.limite_credito || 0,
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

      const clienteData = {
        ...formData,
        organizacion_id: usuario.organizacion_id,
        email: formData.email || null,
        telefono: formData.telefono || null,
        documento_identidad: formData.documento_identidad || null,
        tipo_documento: formData.tipo_documento || null,
        direccion: formData.direccion || null,
        ciudad: formData.ciudad || null,
        estado: formData.estado || null,
        codigo_postal: formData.codigo_postal || null,
        notas: formData.notas || null,
      }

      if (cliente) {
        // Actualizar
        const { error } = await supabase.from("clientes").update(clienteData).eq("id", cliente.id)

        if (error) throw error

        toast.success("Cliente actualizado correctamente")
        router.push("/clientes")
      } else {
        // Crear
        const { error } = await supabase.from("clientes").insert(clienteData)

        if (error) throw error

        toast.success("Cliente creado correctamente")
        router.push("/clientes")
      }

      router.refresh()
    } catch (error) {
      console.error("Error guardando cliente:", error)
      toast.error("Error al guardar el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información Básica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre Completo <span className="text-destructive">*</span>
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
            <Label htmlFor="limite_credito">Límite de Crédito (USD)</Label>
            <Input
              id="limite_credito"
              type="number"
              step="0.01"
              min="0"
              value={formData.limite_credito}
              onChange={(e) => setFormData({ ...formData, limite_credito: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Documento de Identidad */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documento de Identidad</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo_documento">Tipo de Documento</Label>
            <Select
              value={formData.tipo_documento}
              onValueChange={(value) => setFormData({ ...formData, tipo_documento: value as TipoDocumento })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CI">Cédula de Identidad (CI)</SelectItem>
                <SelectItem value="RIF">RIF</SelectItem>
                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento_identidad">Número de Documento</Label>
            <Input
              id="documento_identidad"
              value={formData.documento_identidad}
              onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
              placeholder="V-12345678"
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dirección</h3>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Calle, avenida, número de casa..."
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
        <h3 className="text-lg font-semibold">Notas Adicionales</h3>

        <div className="space-y-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Información adicional sobre el cliente..."
            rows={3}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : cliente ? "Actualizar Cliente" : "Crear Cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
