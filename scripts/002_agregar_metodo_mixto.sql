-- Actualizar la restricción CHECK para incluir 'Mixto' como método de pago
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check;

ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check 
CHECK (metodo_pago IN ('Efectivo', 'Punto', 'Pago Móvil', 'Transferencia', 'Mixto'));
