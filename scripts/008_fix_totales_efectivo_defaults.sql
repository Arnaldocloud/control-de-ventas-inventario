-- Actualizar registros existentes con valores NULL a 0
UPDATE cierres_caja
SET 
  total_ventas_efectivo_bs = COALESCE(total_ventas_efectivo_bs, 0),
  total_ventas_efectivo_usd = COALESCE(total_ventas_efectivo_usd, 0),
  total_ventas_punto = COALESCE(total_ventas_punto, 0),
  total_ventas_pago_movil = COALESCE(total_ventas_pago_movil, 0),
  total_ventas_transferencia = COALESCE(total_ventas_transferencia, 0),
  total_ventas_mixto = COALESCE(total_ventas_mixto, 0)
WHERE 
  total_ventas_efectivo_bs IS NULL 
  OR total_ventas_efectivo_usd IS NULL
  OR total_ventas_punto IS NULL
  OR total_ventas_pago_movil IS NULL
  OR total_ventas_transferencia IS NULL
  OR total_ventas_mixto IS NULL;

-- Agregar valores DEFAULT a las columnas para futuros registros
ALTER TABLE cierres_caja 
  ALTER COLUMN total_ventas_efectivo_bs SET DEFAULT 0,
  ALTER COLUMN total_ventas_efectivo_usd SET DEFAULT 0,
  ALTER COLUMN total_ventas_punto SET DEFAULT 0,
  ALTER COLUMN total_ventas_pago_movil SET DEFAULT 0,
  ALTER COLUMN total_ventas_transferencia SET DEFAULT 0,
  ALTER COLUMN total_ventas_mixto SET DEFAULT 0;
