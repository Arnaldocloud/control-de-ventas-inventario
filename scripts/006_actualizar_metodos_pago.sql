-- Actualizar la restricción de métodos de pago para incluir moneda en efectivo
-- Primero eliminamos la restricción antigua
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check;
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_nueva_metodo_pago_check;

-- Agregamos la nueva restricción con los valores actualizados
ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check 
  CHECK (metodo_pago IN ('Efectivo USD', 'Efectivo BS', 'Punto', 'Pago Móvil', 'Transferencia', 'Mixto'));

-- Actualizar registros existentes de "Efectivo" a "Efectivo USD" o "Efectivo BS" según la moneda
UPDATE ventas 
SET metodo_pago = CASE 
  WHEN moneda = 'USD' THEN 'Efectivo USD'
  WHEN moneda = 'BS' THEN 'Efectivo BS'
  ELSE metodo_pago
END
WHERE metodo_pago = 'Efectivo';
