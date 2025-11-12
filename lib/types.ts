// ============================================
// TIPOS PARA EL SISTEMA MULTI-TENANT
// ============================================

// Enums y tipos comunes
export type Plan = "free" | "pro" | "enterprise"
export type EstadoOrganizacion = "activa" | "suspendida" | "cancelada"
export type Rol = "super_admin" | "admin" | "gerente" | "cajero" | "vendedor"
export type EstadoUsuario = "activo" | "inactivo" | "suspendido"
export type Moneda = "BS" | "USD"
export type MetodoPago = "Efectivo" | "Efectivo BS" | "Efectivo USD" | "Punto" | "Pago Móvil" | "Transferencia" | "Mixto"
export type MetodoPagoCompra = "Efectivo" | "Transferencia" | "Cheque" | "Crédito"
export type EstadoCompra = "pendiente" | "completada" | "cancelada"
export type TipoDocumento = "CI" | "RIF" | "Pasaporte"
export type TipoNotificacion = "stock_bajo" | "venta_importante" | "cierre_caja" | "sistema" | "info"
export type EstadoCaja = "abierta" | "cerrada"

// ============================================
// ORGANIZACIONES (TENANTS)
// ============================================

export interface Organizacion {
  id: string
  nombre: string
  slug: string
  email: string | null
  telefono: string | null
  direccion: string | null
  logo_url: string | null
  plan: Plan
  estado: EstadoOrganizacion
  max_usuarios: number
  max_productos: number
  max_ventas_mes: number
  fecha_inicio_suscripcion: string
  fecha_fin_suscripcion: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  creado_en: string
  actualizado_en: string
}

// ============================================
// USUARIOS Y ROLES
// ============================================

export interface Usuario {
  id: string
  organizacion_id: string
  email: string
  nombre_completo: string | null
  rol: Rol
  avatar_url: string | null
  telefono: string | null
  estado: EstadoUsuario
  ultima_sesion: string | null
  preferencias: Record<string, unknown>
  creado_en: string
  actualizado_en: string
}

export interface UsuarioConOrganizacion extends Usuario {
  organizaciones: Organizacion
}

export interface Invitacion {
  id: string
  organizacion_id: string
  email: string
  rol: Rol
  token: string
  invitado_por: string | null
  aceptada: boolean
  fecha_aceptacion: string | null
  expira_en: string
  creado_en: string
}

// ============================================
// PRODUCTOS
// ============================================

export interface Producto {
  id: string
  organizacion_id: string
  nombre: string
  descripcion: string | null
  precio_bs: number | null
  precio_usd: number | null
  tasa_dolar_momento: number | null
  stock: number
  stock_minimo: number
  costo_unitario_usd: number
  categoria_id: string | null
  codigo_barras: string | null
  proveedor_id: string | null
  imagen_url: string | null
  usuario_creador_id: string | null
  creado_en: string
  actualizado_en: string
}

export interface ProductoConRelaciones extends Producto {
  categorias?: Categoria
  proveedores?: Proveedor
  usuarios?: Usuario
}

// ============================================
// CATEGORÍAS
// ============================================

export interface Categoria {
  id: string
  organizacion_id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  parent_id: string | null
  orden: number
  creado_en: string
  actualizado_en: string
}

export interface CategoriaConHijos extends Categoria {
  subcategorias?: Categoria[]
  cantidad_productos?: number
}

// ============================================
// VENTAS
// ============================================

export interface Venta {
  id: string
  organizacion_id: string
  usuario_id: string | null
  cliente_id: string | null
  total: number
  moneda: Moneda
  metodo_pago: MetodoPago
  tasa_dolar_momento: number | null
  creado_en: string
}

export interface VentaDetalle {
  id: string
  organizacion_id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  creado_en: string
}

export interface VentaDetalleConProducto extends VentaDetalle {
  productos: Producto
}

export interface VentaCompleta extends Venta {
  ventas_detalle: VentaDetalleConProducto[]
  usuarios?: Usuario
  clientes?: Cliente
}

// ============================================
// CLIENTES
// ============================================

export interface Cliente {
  id: string
  organizacion_id: string
  nombre: string
  email: string | null
  telefono: string | null
  documento_identidad: string | null
  tipo_documento: TipoDocumento | null
  direccion: string | null
  ciudad: string | null
  estado: string | null
  codigo_postal: string | null
  notas: string | null
  limite_credito: number
  total_compras: number
  cantidad_compras: number
  ultima_compra: string | null
  creado_en: string
  actualizado_en: string
}

export interface ClienteConEstadisticas extends Cliente {
  ventas?: VentaCompleta[]
  ticket_promedio?: number
  frecuencia_compra?: string
}

// ============================================
// PROVEEDORES
// ============================================

export interface Proveedor {
  id: string
  organizacion_id: string
  nombre: string
  empresa: string | null
  email: string | null
  telefono: string | null
  documento_identidad: string | null
  direccion: string | null
  ciudad: string | null
  estado: string | null
  codigo_postal: string | null
  notas: string | null
  total_compras: number
  cantidad_compras: number
  ultima_compra: string | null
  creado_en: string
  actualizado_en: string
}

// ============================================
// COMPRAS
// ============================================

export interface Compra {
  id: string
  organizacion_id: string
  proveedor_id: string
  usuario_id: string | null
  numero_factura: string | null
  fecha_compra: string
  total: number
  moneda: Moneda
  metodo_pago: MetodoPagoCompra
  tasa_dolar_momento: number | null
  estado: EstadoCompra
  notas: string | null
  creado_en: string
  actualizado_en: string
}

export interface CompraDetalle {
  id: string
  organizacion_id: string
  compra_id: string
  producto_id: string
  cantidad: number
  costo_unitario: number
  subtotal: number
  creado_en: string
}

export interface CompraDetalleConProducto extends CompraDetalle {
  productos: Producto
}

export interface CompraCompleta extends Compra {
  compras_detalle: CompraDetalleConProducto[]
  proveedores: Proveedor
  usuarios?: Usuario
}

// ============================================
// CAJA
// ============================================

export interface CierreCaja {
  id: string
  organizacion_id: string
  fecha_apertura: string
  fecha_cierre: string | null
  monto_inicial_bs: number
  monto_inicial_usd: number
  monto_final_bs: number | null
  monto_final_usd: number | null
  monto_contado_bs: number | null
  monto_contado_usd: number | null
  diferencia_bs: number | null
  diferencia_usd: number | null
  total_ventas_efectivo_bs: number | null
  total_ventas_efectivo_usd: number | null
  total_ventas_punto: number | null
  total_ventas_pago_movil: number | null
  total_ventas_transferencia: number | null
  total_ventas_mixto: number | null
  cantidad_ventas: number
  estado: EstadoCaja
  notas: string | null
  usuario_apertura_id: string | null
  usuario_cierre_id: string | null
  creado_en: string
  actualizado_en: string
}

export interface CierreCajaConUsuarios extends CierreCaja {
  usuario_apertura?: Usuario
  usuario_cierre?: Usuario
}

// ============================================
// CONFIGURACIÓN
// ============================================

export interface Configuracion {
  id: string
  organizacion_id: string
  tasa_dolar: number
  actualizado_en: string
}

// ============================================
// NOTIFICACIONES
// ============================================

export interface Notificacion {
  id: string
  organizacion_id: string
  usuario_id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  leida: boolean
  datos: Record<string, unknown> | null
  creado_en: string
}

// ============================================
// AUDITORÍA
// ============================================

export interface Auditoria {
  id: string
  organizacion_id: string
  usuario_id: string | null
  accion: string
  tabla: string
  registro_id: string | null
  datos_anteriores: Record<string, unknown> | null
  datos_nuevos: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  creado_en: string
}

export interface AuditoriaConUsuario extends Auditoria {
  usuarios?: Usuario
}

// ============================================
// ESTADÍSTICAS Y DASHBOARDS
// ============================================

export interface EstadisticasDashboard {
  total_productos: number
  productos_stock_bajo: number
  inversion_total_usd: number
  ventas_hoy: number
  ingresos_hoy_usd: number
  ventas_mes: number
  ingresos_mes_usd: number
  clientes_activos: number
  ticket_promedio: number
  productos_mas_vendidos: ProductoMasVendido[]
  ventas_por_dia: VentaPorDia[]
  ventas_por_metodo_pago: VentaPorMetodoPago[]
}

export interface ProductoMasVendido {
  producto_id: string
  nombre: string
  cantidad_vendida: number
  ingresos_total: number
}

export interface VentaPorDia {
  fecha: string
  cantidad: number
  total: number
}

export interface VentaPorMetodoPago {
  metodo_pago: MetodoPago
  cantidad: number
  total: number
}

// ============================================
// PERMISOS
// ============================================

export interface Permisos {
  puede_ver_dashboard: boolean
  puede_crear_productos: boolean
  puede_editar_productos: boolean
  puede_eliminar_productos: boolean
  puede_ver_ventas: boolean
  puede_crear_ventas: boolean
  puede_editar_ventas: boolean
  puede_eliminar_ventas: boolean
  puede_ver_clientes: boolean
  puede_gestionar_clientes: boolean
  puede_ver_proveedores: boolean
  puede_gestionar_proveedores: boolean
  puede_ver_compras: boolean
  puede_gestionar_compras: boolean
  puede_abrir_caja: boolean
  puede_cerrar_caja: boolean
  puede_ver_reportes: boolean
  puede_exportar_reportes: boolean
  puede_ver_auditoria: boolean
  puede_gestionar_usuarios: boolean
  puede_gestionar_configuracion: boolean
  puede_gestionar_organizacion: boolean
}

// Mapa de permisos por rol
export const PERMISOS_POR_ROL: Record<Rol, Permisos> = {
  super_admin: {
    puede_ver_dashboard: true,
    puede_crear_productos: true,
    puede_editar_productos: true,
    puede_eliminar_productos: true,
    puede_ver_ventas: true,
    puede_crear_ventas: true,
    puede_editar_ventas: true,
    puede_eliminar_ventas: true,
    puede_ver_clientes: true,
    puede_gestionar_clientes: true,
    puede_ver_proveedores: true,
    puede_gestionar_proveedores: true,
    puede_ver_compras: true,
    puede_gestionar_compras: true,
    puede_abrir_caja: true,
    puede_cerrar_caja: true,
    puede_ver_reportes: true,
    puede_exportar_reportes: true,
    puede_ver_auditoria: true,
    puede_gestionar_usuarios: true,
    puede_gestionar_configuracion: true,
    puede_gestionar_organizacion: true,
  },
  admin: {
    puede_ver_dashboard: true,
    puede_crear_productos: true,
    puede_editar_productos: true,
    puede_eliminar_productos: true,
    puede_ver_ventas: true,
    puede_crear_ventas: true,
    puede_editar_ventas: true,
    puede_eliminar_ventas: true,
    puede_ver_clientes: true,
    puede_gestionar_clientes: true,
    puede_ver_proveedores: true,
    puede_gestionar_proveedores: true,
    puede_ver_compras: true,
    puede_gestionar_compras: true,
    puede_abrir_caja: true,
    puede_cerrar_caja: true,
    puede_ver_reportes: true,
    puede_exportar_reportes: true,
    puede_ver_auditoria: true,
    puede_gestionar_usuarios: true,
    puede_gestionar_configuracion: true,
    puede_gestionar_organizacion: true,
  },
  gerente: {
    puede_ver_dashboard: true,
    puede_crear_productos: true,
    puede_editar_productos: true,
    puede_eliminar_productos: true,
    puede_ver_ventas: true,
    puede_crear_ventas: true,
    puede_editar_ventas: true,
    puede_eliminar_ventas: true,
    puede_ver_clientes: true,
    puede_gestionar_clientes: true,
    puede_ver_proveedores: true,
    puede_gestionar_proveedores: true,
    puede_ver_compras: true,
    puede_gestionar_compras: true,
    puede_abrir_caja: true,
    puede_cerrar_caja: true,
    puede_ver_reportes: true,
    puede_exportar_reportes: true,
    puede_ver_auditoria: true,
    puede_gestionar_usuarios: false,
    puede_gestionar_configuracion: true,
    puede_gestionar_organizacion: false,
  },
  cajero: {
    puede_ver_dashboard: true,
    puede_crear_productos: false,
    puede_editar_productos: false,
    puede_eliminar_productos: false,
    puede_ver_ventas: true,
    puede_crear_ventas: true,
    puede_editar_ventas: false,
    puede_eliminar_ventas: false,
    puede_ver_clientes: true,
    puede_gestionar_clientes: true,
    puede_ver_proveedores: false,
    puede_gestionar_proveedores: false,
    puede_ver_compras: false,
    puede_gestionar_compras: false,
    puede_abrir_caja: true,
    puede_cerrar_caja: true,
    puede_ver_reportes: false,
    puede_exportar_reportes: false,
    puede_ver_auditoria: false,
    puede_gestionar_usuarios: false,
    puede_gestionar_configuracion: false,
    puede_gestionar_organizacion: false,
  },
  vendedor: {
    puede_ver_dashboard: true,
    puede_crear_productos: false,
    puede_editar_productos: false,
    puede_eliminar_productos: false,
    puede_ver_ventas: true,
    puede_crear_ventas: true,
    puede_editar_ventas: false,
    puede_eliminar_ventas: false,
    puede_ver_clientes: true,
    puede_gestionar_clientes: true,
    puede_ver_proveedores: false,
    puede_gestionar_proveedores: false,
    puede_ver_compras: false,
    puede_gestionar_compras: false,
    puede_abrir_caja: false,
    puede_cerrar_caja: false,
    puede_ver_reportes: false,
    puede_exportar_reportes: false,
    puede_ver_auditoria: false,
    puede_gestionar_usuarios: false,
    puede_gestionar_configuracion: false,
    puede_gestionar_organizacion: false,
  },
}

// Helper para obtener permisos de un rol
export function obtenerPermisos(rol: Rol): Permisos {
  return PERMISOS_POR_ROL[rol]
}
