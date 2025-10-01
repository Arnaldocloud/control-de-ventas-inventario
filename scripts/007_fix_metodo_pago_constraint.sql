-- Corregir el constraint de métodos de pago definitivamente
-- Eliminar todos los constraints posibles relacionados con metodo_pago
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check;
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_nueva_metodo_pago_check;

-- Agregar el constraint correcto con los valores actualizados
ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check 
  CHECK (metodo_pago IN ('Efectivo USD', 'Efectivo BS', 'Punto', 'Pago Móvil', 'Transferencia', 'Mixto'));

-- Actualizar registros existentes de "Efectivo" a "Efectivo USD" o "Efectivo BS" según la moneda
UPDATE ventas 
SET metodo_pago = CASE 
  WHEN metodo_pago = 'Efectivo' AND moneda = 'USD' THEN 'Efectivo USD'
  WHEN metodo_pago = 'Efectivo' AND moneda = 'BS' THEN 'Efectivo BS'
  ELSE metodo_pago
END
WHERE metodo_pago = 'Efectivo';
