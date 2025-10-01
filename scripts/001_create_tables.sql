-- Tabla de configuración para la tasa del dólar
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa_dolar DECIMAL(10, 2) NOT NULL DEFAULT 36.50,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion (tasa_dolar) 
VALUES (36.50)
ON CONFLICT DO NOTHING;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_bs DECIMAL(10, 2),
  precio_usd DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  costo_unitario_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('BS', 'USD')),
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Punto', 'Pago Móvil', 'Transferencia')),
  tasa_dolar_momento DECIMAL(10, 2),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(creado_en);
CREATE INDEX IF NOT EXISTS idx_ventas_producto ON ventas(producto_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir acceso público para lectura y escritura
-- (En producción, deberías ajustar estas políticas según tus necesidades de seguridad)
CREATE POLICY "Permitir lectura pública de configuración" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Permitir actualización pública de configuración" ON configuracion FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura pública de productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de productos" ON productos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de productos" ON productos FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública de productos" ON productos FOR DELETE USING (true);

CREATE POLICY "Permitir lectura pública de ventas" ON ventas FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de ventas" ON ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de ventas" ON ventas FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública de ventas" ON ventas FOR DELETE USING (true);
