-- ============================================
-- DESHABILITAR RLS TEMPORALMENTE PARA DESARROLLO
-- ============================================
-- Este script deshabilita Row Level Security en todas las tablas
-- para permitir desarrollo sin restricciones.
--
-- ⚠️ ADVERTENCIA: NO usar en producción
-- Solo para entorno de desarrollo/testing
--
-- Para volver a habilitar RLS, ejecuta: 102_enable_rls_for_production.sql
-- ============================================

-- Deshabilitar RLS en tablas principales
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_detalle DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tablas secundarias
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras_detalle DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'usuarios', 'organizaciones', 'productos', 'ventas',
    'configuracion', 'cierres_caja', 'categorias', 'clientes'
  )
ORDER BY tablename;

-- Resultado esperado: rls_enabled = false para todas las tablas
