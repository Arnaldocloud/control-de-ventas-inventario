import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { VentaCompleta, Producto } from "./types"

// ============================================
// EXPORTAR VENTAS A PDF
// ============================================
export function exportarVentasPDF(ventas: VentaCompleta[]) {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(18)
  doc.text("Reporte de Ventas", 14, 22)

  // Fecha
  doc.setFontSize(11)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-VE")}`, 14, 30)

  // Resumen
  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  doc.text(`Total de Ventas: $${totalVentas.toFixed(2)}`, 14, 38)
  doc.text(`Cantidad de Ventas: ${ventas.length}`, 14, 46)

  // Tabla de ventas
  const tableData = ventas.map((venta) => [
    new Date(venta.creado_en).toLocaleDateString("es-VE"),
    venta.clientes?.nombre || "Cliente General",
    venta.metodo_pago,
    `${venta.moneda === "USD" ? "$" : "Bs. "}${venta.total.toFixed(2)}`,
    venta.ventas_detalle?.length || 0,
  ])

  autoTable(doc, {
    startY: 54,
    head: [["Fecha", "Cliente", "Método Pago", "Total", "Productos"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Guardar
  doc.save(`reporte-ventas-${new Date().toISOString().split("T")[0]}.pdf`)
}

// ============================================
// EXPORTAR VENTAS A EXCEL
// ============================================
export function exportarVentasExcel(ventas: VentaCompleta[]) {
  const data = ventas.map((venta) => ({
    Fecha: new Date(venta.creado_en).toLocaleDateString("es-VE"),
    Cliente: venta.clientes?.nombre || "Cliente General",
    "Método de Pago": venta.metodo_pago,
    Total: venta.total,
    Moneda: venta.moneda,
    "Cantidad Productos": venta.ventas_detalle?.length || 0,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas")

  // Ajustar ancho de columnas
  const maxWidth = data.reduce((w, r) => Math.max(w, r.Cliente.length), 10)
  worksheet["!cols"] = [
    { wch: 12 }, // Fecha
    { wch: maxWidth }, // Cliente
    { wch: 15 }, // Método
    { wch: 12 }, // Total
    { wch: 8 }, // Moneda
    { wch: 10 }, // Cantidad
  ]

  XLSX.writeFile(workbook, `reporte-ventas-${new Date().toISOString().split("T")[0]}.xlsx`)
}

// ============================================
// EXPORTAR INVENTARIO A PDF
// ============================================
export function exportarInventarioPDF(productos: Producto[]) {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(18)
  doc.text("Reporte de Inventario - Stock Bajo", 14, 22)

  // Fecha
  doc.setFontSize(11)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-VE")}`, 14, 30)
  doc.text(`Productos con Stock Bajo: ${productos.length}`, 14, 38)

  // Tabla de productos
  const tableData = productos.map((producto) => [
    producto.nombre,
    producto.stock.toString(),
    producto.stock_minimo.toString(),
    `$${producto.costo_unitario_usd.toFixed(2)}`,
    `$${producto.precio_usd?.toFixed(2) || "0.00"}`,
    producto.stock <= 0 ? "Sin Stock" : "Stock Bajo",
  ])

  autoTable(doc, {
    startY: 46,
    head: [["Producto", "Stock", "Mínimo", "Costo", "Precio", "Estado"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [239, 68, 68] },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "center" },
    },
  })

  // Guardar
  doc.save(`reporte-inventario-${new Date().toISOString().split("T")[0]}.pdf`)
}

// ============================================
// EXPORTAR INVENTARIO A EXCEL
// ============================================
export function exportarInventarioExcel(productos: Producto[]) {
  const data = productos.map((producto) => ({
    Producto: producto.nombre,
    Descripción: producto.descripcion || "",
    Stock: producto.stock,
    "Stock Mínimo": producto.stock_minimo,
    "Costo Unitario USD": producto.costo_unitario_usd,
    "Precio USD": producto.precio_usd || 0,
    "Precio BS": producto.precio_bs || 0,
    Estado: producto.stock <= 0 ? "Sin Stock" : "Stock Bajo",
    "Código de Barras": producto.codigo_barras || "",
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

  // Ajustar ancho de columnas
  worksheet["!cols"] = [
    { wch: 30 }, // Producto
    { wch: 40 }, // Descripción
    { wch: 10 }, // Stock
    { wch: 12 }, // Stock Mínimo
    { wch: 15 }, // Costo
    { wch: 12 }, // Precio USD
    { wch: 12 }, // Precio BS
    { wch: 12 }, // Estado
    { wch: 15 }, // Código
  ]

  XLSX.writeFile(workbook, `reporte-inventario-${new Date().toISOString().split("T")[0]}.xlsx`)
}

// ============================================
// EXPORTAR COMPRAS A PDF
// ============================================
export function exportarComprasPDF(compras: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Reporte de Compras", 14, 22)

  doc.setFontSize(11)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-VE")}`, 14, 30)

  const totalCompras = compras.reduce((sum, c) => sum + c.total, 0)
  doc.text(`Total de Compras: $${totalCompras.toFixed(2)}`, 14, 38)
  doc.text(`Cantidad de Compras: ${compras.length}`, 14, 46)

  const tableData = compras.map((compra) => [
    new Date(compra.fecha_compra).toLocaleDateString("es-VE"),
    compra.proveedores?.nombre || "N/A",
    compra.numero_factura || "S/N",
    `${compra.moneda === "USD" ? "$" : "Bs. "}${compra.total.toFixed(2)}`,
    compra.estado,
  ])

  autoTable(doc, {
    startY: 54,
    head: [["Fecha", "Proveedor", "Factura", "Total", "Estado"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94] },
  })

  doc.save(`reporte-compras-${new Date().toISOString().split("T")[0]}.pdf`)
}

// ============================================
// EXPORTAR COMPRAS A EXCEL
// ============================================
export function exportarComprasExcel(compras: any[]) {
  const data = compras.map((compra) => ({
    Fecha: new Date(compra.fecha_compra).toLocaleDateString("es-VE"),
    Proveedor: compra.proveedores?.nombre || "N/A",
    "Número Factura": compra.numero_factura || "S/N",
    Total: compra.total,
    Moneda: compra.moneda,
    "Método de Pago": compra.metodo_pago,
    Estado: compra.estado,
    "Cantidad Productos": compra.compras_detalle?.length || 0,
    Notas: compra.notas || "",
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Compras")

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
  ]

  XLSX.writeFile(workbook, `reporte-compras-${new Date().toISOString().split("T")[0]}.xlsx`)
}
