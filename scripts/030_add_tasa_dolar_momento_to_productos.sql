-- Add tasa_dolar_momento column to productos table
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS tasa_dolar_momento DECIMAL(10, 2);

-- Update existing records with the current rate
UPDATE productos 
SET tasa_dolar_momento = (SELECT tasa_dolar FROM configuracion LIMIT 1)
WHERE tasa_dolar_momento IS NULL;
