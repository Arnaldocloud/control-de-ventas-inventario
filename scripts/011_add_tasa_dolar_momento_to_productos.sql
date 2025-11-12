-- Agregar columna para guardar la tasa de cambio usada al guardar el producto
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS tasa_dolar_momento DECIMAL(10, 2);

-- Actualizar registros existentes con la tasa actual
UPDATE productos 
SET tasa_dolar_momento = (SELECT tasa_dolar FROM configuracion LIMIT 1) 
WHERE tasa_dolar_momento IS NULL;

-- Crear índice para mejorar consultas por tasa
CREATE INDEX IF NOT EXISTS idx_productos_tasa_dolar ON productos(tasa_dolar_momento);
