-- Modificar la estructura de ventas para soportar múltiples productos
-- Crear tabla de ventas (cabecera)
CREATE TABLE IF NOT EXISTS ventas_nueva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total DECIMAL(10, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('BS', 'USD')),
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Punto', 'Pago Móvil', 'Transferencia', 'Mixto')),
  tasa_dolar_momento DECIMAL(10, 2),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de detalle de ventas (items)
CREATE TABLE IF NOT EXISTS ventas_detalle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES ventas_nueva(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrar datos existentes de la tabla ventas antigua
INSERT INTO ventas_nueva (id, total, moneda, metodo_pago, tasa_dolar_momento, creado_en)
SELECT id, total, moneda, metodo_pago, tasa_dolar_momento, creado_en
FROM ventas;

INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT id, producto_id, cantidad, precio_unitario, total
FROM ventas;

-- Eliminar tabla antigua y renombrar
DROP TABLE ventas;
ALTER TABLE ventas_nueva RENAME TO ventas;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_venta ON ventas_detalle(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_producto ON ventas_detalle(producto_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE ventas_detalle ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ventas_detalle
CREATE POLICY "Permitir lectura pública de ventas_detalle" ON ventas_detalle FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de ventas_detalle" ON ventas_detalle FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de ventas_detalle" ON ventas_detalle FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública de ventas_detalle" ON ventas_detalle FOR DELETE USING (true);
