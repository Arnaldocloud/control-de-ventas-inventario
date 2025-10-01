-- Tabla de cierres de caja
CREATE TABLE IF NOT EXISTS cierres_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  monto_inicial_bs DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monto_inicial_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monto_final_bs DECIMAL(10, 2),
  monto_final_usd DECIMAL(10, 2),
  monto_contado_bs DECIMAL(10, 2),
  monto_contado_usd DECIMAL(10, 2),
  diferencia_bs DECIMAL(10, 2),
  diferencia_usd DECIMAL(10, 2),
  total_ventas_efectivo_bs DECIMAL(10, 2),
  total_ventas_efectivo_usd DECIMAL(10, 2),
  total_ventas_punto DECIMAL(10, 2),
  total_ventas_pago_movil DECIMAL(10, 2),
  total_ventas_transferencia DECIMAL(10, 2),
  total_ventas_mixto DECIMAL(10, 2),
  cantidad_ventas INTEGER DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cierres_caja_estado ON cierres_caja(estado);
CREATE INDEX IF NOT EXISTS idx_cierres_caja_fecha_apertura ON cierres_caja(fecha_apertura);
CREATE INDEX IF NOT EXISTS idx_cierres_caja_fecha_cierre ON cierres_caja(fecha_cierre);

-- Habilitar Row Level Security (RLS)
ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir acceso público
CREATE POLICY "Permitir lectura pública de cierres_caja" ON cierres_caja FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de cierres_caja" ON cierres_caja FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de cierres_caja" ON cierres_caja FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública de cierres_caja" ON cierres_caja FOR DELETE USING (true);
