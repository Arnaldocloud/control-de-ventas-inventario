export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio_bs: number | null
  precio_usd: number | null
  stock: number
  stock_minimo: number
  costo_unitario_usd: number
  creado_en: string
  actualizado_en: string
}

export interface Venta {
  id: string
  total: number
  moneda: "BS" | "USD"
  metodo_pago: "Efectivo" | "Punto" | "Pago Móvil" | "Transferencia" | "Mixto"
  tasa_dolar_momento: number | null
  creado_en: string
}

export interface VentaDetalle {
  id: string
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
}

export interface Configuracion {
  id: string
  tasa_dolar: number
  actualizado_en: string
}

// export interface VentaConProducto extends Venta {
//   productos: Producto
// }

export interface CierreCaja {
  id: string
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
  estado: "abierta" | "cerrada"
  notas: string | null
  creado_en: string
  actualizado_en: string
}
