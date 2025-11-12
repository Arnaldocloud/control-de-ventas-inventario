-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Políticas de seguridad a nivel de fila para multi-tenancy
-- Cada organización solo puede ver y modificar sus propios datos

-- ============================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Las tablas existentes ya tienen RLS habilitado desde el script original
-- pero vamos a actualizar sus políticas

-- ============================================
-- 2. LIMPIAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas antiguas de configuracion
DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON configuracion;
DROP POLICY IF EXISTS "Permitir actualización pública de configuración" ON configuracion;

-- Eliminar políticas antiguas de productos
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir inserción pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir actualización pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir eliminación pública de productos" ON productos;

-- Eliminar políticas antiguas de ventas
DROP POLICY IF EXISTS "Permitir lectura pública de ventas" ON ventas;
DROP POLICY IF EXISTS "Permitir inserción pública de ventas" ON ventas;
DROP POLICY IF EXISTS "Permitir actualización pública de ventas" ON ventas;
DROP POLICY IF EXISTS "Permitir eliminación pública de ventas" ON ventas;

-- ============================================
-- 3. POLÍTICAS PARA ORGANIZACIONES
-- ============================================

-- Los usuarios pueden ver su propia organización
CREATE POLICY "usuarios_pueden_ver_su_organizacion"
  ON organizaciones FOR SELECT
  USING (
    id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Solo admins pueden actualizar la organización
CREATE POLICY "admins_pueden_actualizar_organizacion"
  ON organizaciones FOR UPDATE
  USING (
    id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

-- Super admins pueden crear organizaciones (para sistema de registro)
CREATE POLICY "super_admins_pueden_crear_organizaciones"
  ON organizaciones FOR INSERT
  WITH CHECK (true); -- Esto se controlará en la aplicación

-- ============================================
-- 4. POLÍTICAS PARA USUARIOS
-- ============================================

-- Los usuarios pueden ver otros usuarios de su organización
CREATE POLICY "usuarios_pueden_ver_misma_organizacion"
  ON usuarios FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "usuarios_pueden_ver_su_perfil"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_su_perfil"
  ON usuarios FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins pueden crear usuarios en su organización
CREATE POLICY "admins_pueden_crear_usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

-- Admins pueden actualizar usuarios de su organización
CREATE POLICY "admins_pueden_actualizar_usuarios"
  ON usuarios FOR UPDATE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

-- Admins pueden eliminar usuarios de su organización
CREATE POLICY "admins_pueden_eliminar_usuarios"
  ON usuarios FOR DELETE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 5. POLÍTICAS PARA CONFIGURACIÓN
-- ============================================

CREATE POLICY "usuarios_pueden_ver_config_organizacion"
  ON configuracion FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_actualizar_config"
  ON configuracion FOR UPDATE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

CREATE POLICY "admins_pueden_crear_config"
  ON configuracion FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 6. POLÍTICAS PARA PRODUCTOS
-- ============================================

CREATE POLICY "usuarios_pueden_ver_productos_organizacion"
  ON productos FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "usuarios_pueden_crear_productos"
  ON productos FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "usuarios_pueden_actualizar_productos"
  ON productos FOR UPDATE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_eliminar_productos"
  ON productos FOR DELETE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 7. POLÍTICAS PARA VENTAS
-- ============================================

CREATE POLICY "usuarios_pueden_ver_ventas_organizacion"
  ON ventas FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "vendedores_pueden_crear_ventas"
  ON ventas FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_actualizar_ventas"
  ON ventas FOR UPDATE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

CREATE POLICY "gerentes_pueden_eliminar_ventas"
  ON ventas FOR DELETE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 8. POLÍTICAS PARA VENTAS_DETALLE
-- ============================================

CREATE POLICY "usuarios_pueden_ver_ventas_detalle_organizacion"
  ON ventas_detalle FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "vendedores_pueden_crear_ventas_detalle"
  ON ventas_detalle FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- ============================================
-- 9. POLÍTICAS PARA CIERRES_CAJA
-- ============================================

CREATE POLICY "usuarios_pueden_ver_cierres_organizacion"
  ON cierres_caja FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "cajeros_pueden_crear_cierres"
  ON cierres_caja FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente', 'cajero')
    )
  );

CREATE POLICY "cajeros_pueden_actualizar_cierres"
  ON cierres_caja FOR UPDATE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente', 'cajero')
    )
  );

-- ============================================
-- 10. POLÍTICAS PARA CATEGORÍAS
-- ============================================

CREATE POLICY "usuarios_pueden_ver_categorias_organizacion"
  ON categorias FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_gestionar_categorias"
  ON categorias FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 11. POLÍTICAS PARA CLIENTES
-- ============================================

CREATE POLICY "usuarios_pueden_ver_clientes_organizacion"
  ON clientes FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "vendedores_pueden_gestionar_clientes"
  ON clientes FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- ============================================
-- 12. POLÍTICAS PARA PROVEEDORES
-- ============================================

CREATE POLICY "usuarios_pueden_ver_proveedores_organizacion"
  ON proveedores FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_gestionar_proveedores"
  ON proveedores FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 13. POLÍTICAS PARA COMPRAS
-- ============================================

CREATE POLICY "usuarios_pueden_ver_compras_organizacion"
  ON compras FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_gestionar_compras"
  ON compras FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 14. POLÍTICAS PARA COMPRAS_DETALLE
-- ============================================

CREATE POLICY "usuarios_pueden_ver_compras_detalle_organizacion"
  ON compras_detalle FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "gerentes_pueden_gestionar_compras_detalle"
  ON compras_detalle FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

-- ============================================
-- 15. POLÍTICAS PARA NOTIFICACIONES
-- ============================================

CREATE POLICY "usuarios_pueden_ver_sus_notificaciones"
  ON notificaciones FOR SELECT
  USING (
    usuario_id = auth.uid()
  );

CREATE POLICY "usuarios_pueden_actualizar_sus_notificaciones"
  ON notificaciones FOR UPDATE
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "sistema_puede_crear_notificaciones"
  ON notificaciones FOR INSERT
  WITH CHECK (true); -- La creación se controlará desde la aplicación

-- ============================================
-- 16. POLÍTICAS PARA AUDITORÍA
-- ============================================

CREATE POLICY "gerentes_pueden_ver_auditoria_organizacion"
  ON auditoria FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin', 'gerente')
    )
  );

CREATE POLICY "sistema_puede_crear_auditoria"
  ON auditoria FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- ============================================
-- 17. POLÍTICAS PARA INVITACIONES
-- ============================================

CREATE POLICY "admins_pueden_gestionar_invitaciones"
  ON invitaciones FOR ALL
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "usuarios_invitados_pueden_ver_su_invitacion"
  ON invitaciones FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================
-- 18. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON POLICY "usuarios_pueden_ver_su_organizacion" ON organizaciones IS
  'Los usuarios autenticados pueden ver los detalles de su organización';

COMMENT ON POLICY "usuarios_pueden_ver_productos_organizacion" ON productos IS
  'Los usuarios solo pueden ver productos de su propia organización';

COMMENT ON POLICY "gerentes_pueden_eliminar_productos" ON productos IS
  'Solo gerentes y admins pueden eliminar productos para evitar pérdida accidental de datos';
