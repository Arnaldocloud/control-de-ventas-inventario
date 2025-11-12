import { createClient } from "@/lib/supabase/server"
import { Usuario, Organizacion, Permisos, obtenerPermisos, Rol } from "@/lib/types"
import { cache } from "react"
import { redirect } from "next/navigation"

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

export const obtenerUsuarioActual = cache(async (): Promise<Usuario | null> => {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

    return usuario
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error)
    return null
  }
})

// ============================================
// OBTENER ORGANIZACIÓN DEL USUARIO
// ============================================

export const obtenerOrganizacionActual = cache(async (): Promise<Organizacion | null> => {
  try {
    const usuario = await obtenerUsuarioActual()
    if (!usuario) return null

    const supabase = await createClient()
    const { data: organizacion } = await supabase
      .from("organizaciones")
      .select("*")
      .eq("id", usuario.organizacion_id)
      .single()

    return organizacion
  } catch (error) {
    console.error("Error obteniendo organización:", error)
    return null
  }
})

// ============================================
// OBTENER PERMISOS DEL USUARIO
// ============================================

export const obtenerPermisosUsuario = cache(async (): Promise<Permisos | null> => {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) return null

  return obtenerPermisos(usuario.rol)
})

// ============================================
// VERIFICAR PERMISO ESPECÍFICO
// ============================================

export async function verificarPermiso(permiso: keyof Permisos): Promise<boolean> {
  const permisos = await obtenerPermisosUsuario()
  if (!permisos) return false

  return permisos[permiso]
}

// ============================================
// REQUIRE AUTH - MIDDLEWARE PARA RUTAS
// ============================================

export async function requireAuth(): Promise<Usuario> {
  const usuario = await obtenerUsuarioActual()

  if (!usuario) {
    redirect("/auth/login")
  }

  return usuario
}

// ============================================
// REQUIRE ROLE - VERIFICAR ROL ESPECÍFICO
// ============================================

export async function requireRole(...rolesPermitidos: Rol[]): Promise<Usuario> {
  const usuario = await requireAuth()

  if (!rolesPermitidos.includes(usuario.rol)) {
    redirect("/dashboard?error=no-autorizado")
  }

  return usuario
}

// ============================================
// REQUIRE PERMISSION - VERIFICAR PERMISO
// ============================================

export async function requirePermission(permiso: keyof Permisos): Promise<Usuario> {
  const usuario = await requireAuth()
  const tienePermiso = await verificarPermiso(permiso)

  if (!tienePermiso) {
    redirect("/dashboard?error=sin-permiso")
  }

  return usuario
}

// ============================================
// VERIFICAR LÍMITES DEL PLAN
// ============================================

export async function verificarLimitePlan(tipo: "usuarios" | "productos" | "ventas_mes"): Promise<boolean> {
  try {
    const organizacion = await obtenerOrganizacionActual()
    if (!organizacion) return false

    const supabase = await createClient()

    switch (tipo) {
      case "usuarios": {
        const { count } = await supabase
          .from("usuarios")
          .select("*", { count: "exact", head: true })
          .eq("organizacion_id", organizacion.id)

        return (count || 0) < organizacion.max_usuarios
      }

      case "productos": {
        const { count } = await supabase
          .from("productos")
          .select("*", { count: "exact", head: true })
          .eq("organizacion_id", organizacion.id)

        return (count || 0) < organizacion.max_productos
      }

      case "ventas_mes": {
        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)

        const { count } = await supabase
          .from("ventas")
          .select("*", { count: "exact", head: true })
          .eq("organizacion_id", organizacion.id)
          .gte("creado_en", inicioMes.toISOString())

        return (count || 0) < organizacion.max_ventas_mes
      }

      default:
        return false
    }
  } catch (error) {
    console.error("Error verificando límite del plan:", error)
    return false
  }
}

// ============================================
// OBTENER ESTADÍSTICAS DEL USO DEL PLAN
// ============================================

export async function obtenerEstadisticasPlan() {
  try {
    const organizacion = await obtenerOrganizacionActual()
    if (!organizacion) return null

    const supabase = await createClient()

    // Contar usuarios
    const { count: usuariosCount } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("organizacion_id", organizacion.id)

    // Contar productos
    const { count: productosCount } = await supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("organizacion_id", organizacion.id)

    // Contar ventas del mes
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { count: ventasMesCount } = await supabase
      .from("ventas")
      .select("*", { count: "exact", head: true })
      .eq("organizacion_id", organizacion.id)
      .gte("creado_en", inicioMes.toISOString())

    return {
      usuarios: {
        actual: usuariosCount || 0,
        maximo: organizacion.max_usuarios,
        porcentaje: ((usuariosCount || 0) / organizacion.max_usuarios) * 100,
      },
      productos: {
        actual: productosCount || 0,
        maximo: organizacion.max_productos,
        porcentaje: ((productosCount || 0) / organizacion.max_productos) * 100,
      },
      ventas_mes: {
        actual: ventasMesCount || 0,
        maximo: organizacion.max_ventas_mes,
        porcentaje: ((ventasMesCount || 0) / organizacion.max_ventas_mes) * 100,
      },
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas del plan:", error)
    return null
  }
}

// ============================================
// REGISTRAR ACCIÓN EN AUDITORÍA
// ============================================

export async function registrarAuditoria(params: {
  accion: string
  tabla: string
  registro_id?: string
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
}) {
  try {
    const usuario = await obtenerUsuarioActual()
    if (!usuario) return

    const supabase = await createClient()

    await supabase.from("auditoria").insert({
      organizacion_id: usuario.organizacion_id,
      usuario_id: usuario.id,
      accion: params.accion,
      tabla: params.tabla,
      registro_id: params.registro_id,
      datos_anteriores: params.datos_anteriores,
      datos_nuevos: params.datos_nuevos,
    })
  } catch (error) {
    console.error("Error registrando auditoría:", error)
  }
}

// ============================================
// CREAR NOTIFICACIÓN
// ============================================

export async function crearNotificacion(params: {
  usuario_id: string
  tipo: "stock_bajo" | "venta_importante" | "cierre_caja" | "sistema" | "info"
  titulo: string
  mensaje: string
  datos?: Record<string, unknown>
}) {
  try {
    const organizacion = await obtenerOrganizacionActual()
    if (!organizacion) return

    const supabase = await createClient()

    await supabase.from("notificaciones").insert({
      organizacion_id: organizacion.id,
      ...params,
    })
  } catch (error) {
    console.error("Error creando notificación:", error)
  }
}

// ============================================
// VERIFICAR ESTADO DE ORGANIZACIÓN
// ============================================

export async function verificarEstadoOrganizacion(): Promise<boolean> {
  const organizacion = await obtenerOrganizacionActual()
  if (!organizacion) return false

  // Verificar si la organización está activa
  if (organizacion.estado !== "activa") {
    return false
  }

  // Verificar si la suscripción está vigente
  if (organizacion.fecha_fin_suscripcion) {
    const fechaFin = new Date(organizacion.fecha_fin_suscripcion)
    if (fechaFin < new Date()) {
      return false
    }
  }

  return true
}
