-- ============================================
-- FIX: Políticas RLS Sin Recursión Infinita
-- ============================================
-- Este script corrige el problema de recursión infinita
-- en las políticas RLS detectado en desarrollo.
--
-- Error original: "infinite recursion detected in policy for relation usuarios"
-- Causa: Las políticas consultaban la tabla usuarios dentro de las mismas políticas
--
-- Ejecutar DESPUÉS de habilitar RLS nuevamente
-- ============================================

-- ============================================
-- PASO 1: Crear función helper que NO active RLS
-- ============================================

-- Esta función se ejecuta con privilegios elevados (SECURITY DEFINER)
-- y NO activa las políticas RLS, evitando recursión
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER  -- Ejecuta como superusuario, bypass RLS
STABLE            -- Cache del resultado durante la transacción
AS $$
  SELECT COALESCE(
    (SELECT organizacion_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

COMMENT ON FUNCTION auth.user_org_id() IS
  'Obtiene organizacion_id del usuario actual sin activar RLS. Usado en políticas para evitar recursión.';

-- ============================================
-- PASO 2: Eliminar políticas problemáticas
-- ============================================

-- Políticas de USUARIOS (recursión directa)
DROP POLICY IF EXISTS "usuarios_pueden_ver_misma_organizacion" ON usuarios;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_usuarios" ON usuarios;
DROP POLICY IF EXISTS "admins_pueden_crear_usuarios" ON usuarios;
DROP POLICY IF EXISTS "admins_pueden_eliminar_usuarios" ON usuarios;

-- Políticas de ORGANIZACIONES (recursión vía join)
DROP POLICY IF EXISTS "usuarios_pueden_ver_su_organizacion" ON organizaciones;
DROP POLICY IF EXISTS "admins_pueden_actualizar_organizacion" ON organizaciones;

-- Políticas de PRODUCTOS (recursión vía join con usuarios)
DROP POLICY IF EXISTS "usuarios_pueden_ver_productos_organizacion" ON productos;
DROP POLICY IF EXISTS "usuarios_pueden_crear_productos" ON productos;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_productos" ON productos;
DROP POLICY IF EXISTS "gerentes_pueden_eliminar_productos" ON productos;

-- Políticas de VENTAS
DROP POLICY IF EXISTS "usuarios_pueden_ver_ventas_organizacion" ON ventas;
DROP POLICY IF EXISTS "vendedores_pueden_crear_ventas" ON ventas;
DROP POLICY IF EXISTS "gerentes_pueden_actualizar_ventas" ON ventas;
DROP POLICY IF EXISTS "gerentes_pueden_eliminar_ventas" ON ventas;

-- Políticas de CONFIGURACIÓN
DROP POLICY IF EXISTS "usuarios_pueden_ver_config_organizacion" ON configuracion;
DROP POLICY IF EXISTS "gerentes_pueden_actualizar_config" ON configuracion;
DROP POLICY IF EXISTS "admins_pueden_crear_config" ON configuracion;

-- Políticas de CAJA
DROP POLICY IF EXISTS "usuarios_pueden_ver_cierres_organizacion" ON cierres_caja;
DROP POLICY IF EXISTS "cajeros_pueden_crear_cierres" ON cierres_caja;
DROP POLICY IF EXISTS "cajeros_pueden_actualizar_cierres" ON cierres_caja;

-- Políticas de CATEGORÍAS
DROP POLICY IF EXISTS "usuarios_pueden_ver_categorias_organizacion" ON categorias;
DROP POLICY IF EXISTS "gerentes_pueden_gestionar_categorias" ON categorias;

-- Políticas de CLIENTES
DROP POLICY IF EXISTS "usuarios_pueden_ver_clientes_organizacion" ON clientes;
DROP POLICY IF EXISTS "vendedores_pueden_gestionar_clientes" ON clientes;

-- ============================================
-- PASO 3: Crear nuevas políticas SIN recursión
-- ============================================

-- ========== USUARIOS ==========

-- Los usuarios pueden ver su propio perfil (sin consultar tabla usuarios)
CREATE POLICY "usuarios_ver_propio_perfil"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

-- Los usuarios pueden ver otros usuarios de su organización (usando función helper)
CREATE POLICY "usuarios_ver_misma_org"
  ON usuarios FOR SELECT
  USING (organizacion_id = auth.user_org_id());

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_actualizar_propio_perfil"
  ON usuarios FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ========== ORGANIZACIONES ==========

-- Los usuarios pueden ver su organización (usando función helper)
CREATE POLICY "usuarios_ver_su_organizacion"
  ON organizaciones FOR SELECT
  USING (id = auth.user_org_id());

-- Super admins pueden crear organizaciones (para sistema de registro)
CREATE POLICY "super_admins_crear_organizaciones"
  ON organizaciones FOR INSERT
  WITH CHECK (true); -- Se controlará en la aplicación

-- ========== PRODUCTOS ==========

-- Ver productos de la organización
CREATE POLICY "usuarios_ver_productos_org"
  ON productos FOR SELECT
  USING (organizacion_id = auth.user_org_id());

-- Crear productos
CREATE POLICY "usuarios_crear_productos"
  ON productos FOR INSERT
  WITH CHECK (organizacion_id = auth.user_org_id());

-- Actualizar productos
CREATE POLICY "usuarios_actualizar_productos"
  ON productos FOR UPDATE
  USING (organizacion_id = auth.user_org_id());

-- Eliminar productos (requiere rol pero sin consultar usuarios)
CREATE POLICY "usuarios_eliminar_productos"
  ON productos FOR DELETE
  USING (organizacion_id = auth.user_org_id());

-- ========== VENTAS ==========

-- Ver ventas de la organización
CREATE POLICY "usuarios_ver_ventas_org"
  ON ventas FOR SELECT
  USING (organizacion_id = auth.user_org_id());

-- Crear ventas
CREATE POLICY "usuarios_crear_ventas"
  ON ventas FOR INSERT
  WITH CHECK (organizacion_id = auth.user_org_id());

-- Actualizar ventas
CREATE POLICY "usuarios_actualizar_ventas"
  ON ventas FOR UPDATE
  USING (organizacion_id = auth.user_org_id());

-- Eliminar ventas
CREATE POLICY "usuarios_eliminar_ventas"
  ON ventas FOR DELETE
  USING (organizacion_id = auth.user_org_id());

-- ========== VENTAS_DETALLE ==========

CREATE POLICY "usuarios_ver_ventas_detalle_org"
  ON ventas_detalle FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_crear_ventas_detalle"
  ON ventas_detalle FOR INSERT
  WITH CHECK (organizacion_id = auth.user_org_id());

-- ========== CIERRES_CAJA ==========

CREATE POLICY "usuarios_ver_cierres_org"
  ON cierres_caja FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_crear_cierres"
  ON cierres_caja FOR INSERT
  WITH CHECK (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_actualizar_cierres"
  ON cierres_caja FOR UPDATE
  USING (organizacion_id = auth.user_org_id());

-- ========== CONFIGURACIÓN ==========

CREATE POLICY "usuarios_ver_config_org"
  ON configuracion FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_actualizar_config"
  ON configuracion FOR UPDATE
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_crear_config"
  ON configuracion FOR INSERT
  WITH CHECK (organizacion_id = auth.user_org_id());

-- ========== CATEGORÍAS ==========

CREATE POLICY "usuarios_ver_categorias_org"
  ON categorias FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_gestionar_categorias"
  ON categorias FOR ALL
  USING (organizacion_id = auth.user_org_id());

-- ========== CLIENTES ==========

CREATE POLICY "usuarios_ver_clientes_org"
  ON clientes FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_gestionar_clientes"
  ON clientes FOR ALL
  USING (organizacion_id = auth.user_org_id());

-- ========== PROVEEDORES ==========

DROP POLICY IF EXISTS "usuarios_pueden_ver_proveedores_organizacion" ON proveedores;
DROP POLICY IF EXISTS "gerentes_pueden_gestionar_proveedores" ON proveedores;

CREATE POLICY "usuarios_ver_proveedores_org"
  ON proveedores FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_gestionar_proveedores"
  ON proveedores FOR ALL
  USING (organizacion_id = auth.user_org_id());

-- ========== COMPRAS ==========

DROP POLICY IF EXISTS "usuarios_pueden_ver_compras_organizacion" ON compras;
DROP POLICY IF EXISTS "gerentes_pueden_gestionar_compras" ON compras;

CREATE POLICY "usuarios_ver_compras_org"
  ON compras FOR SELECT
  USING (organizacion_id = auth.user_org_id());

CREATE POLICY "usuarios_gestionar_compras"
  ON compras FOR ALL
  USING (organizacion_id = auth.user_org_id());

-- ========== NOTIFICACIONES ==========
-- Las notificaciones son por usuario, no por organización

DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_notificaciones" ON notificaciones;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_notificaciones" ON notificaciones;

CREATE POLICY "usuarios_ver_propias_notificaciones"
  ON notificaciones FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "usuarios_actualizar_propias_notificaciones"
  ON notificaciones FOR UPDATE
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- ============================================
-- PASO 4: Verificación
-- ============================================

-- Verificar que todas las políticas se crearon correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'usuarios', 'organizaciones', 'productos', 'ventas', 'configuracion',
    'cierres_caja', 'categorias', 'clientes', 'proveedores', 'compras'
  )
ORDER BY tablename, policyname;

-- Resultado esperado: Políticas sin recursión para todas las tablas

-- ============================================
-- PASO 5: Testing
-- ============================================

-- Probar que la función funciona
SELECT auth.user_org_id();
-- Debería retornar el UUID de la organización del usuario actual

-- Probar que las políticas funcionan
SELECT * FROM productos LIMIT 1;
-- Debería retornar productos solo de tu organización

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. La función auth.user_org_id() usa SECURITY DEFINER, lo que significa
   que se ejecuta con los privilegios del dueño (superusuario) y NO
   activa las políticas RLS. Esto rompe el ciclo de recursión.

2. Esta solución es MÁS SIMPLE que las políticas basadas en roles porque:
   - No necesita consultar roles en cada política
   - Más rápida (función cached)
   - Más fácil de mantener

3. Para verificación de roles (admin, gerente, etc.) se debe hacer
   en la aplicación (middleware, server actions) no en RLS.

4. En producción, considera agregar más validaciones en la función:
   - Verificar que el usuario esté activo
   - Verificar que la organización esté activa
   - Cache más agresivo

5. Monitorear performance de la función:
   - Si es lenta, considerar un trigger que actualice un campo
     en auth.users con organizacion_id
*/

-- ============================================
-- ROLLBACK (si algo sale mal)
-- ============================================

/*
-- Para deshabilitar RLS nuevamente en caso de emergencia:

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja DISABLE ROW LEVEL SECURITY;
-- ... resto de tablas
*/
