# 🚀 Instrucciones para Ejecutar en Supabase

## ⚠️ IMPORTANTE: Ejecutar en este orden

### 1. Ve a Supabase Dashboard
URL: https://supabase.com/dashboard/project/sistemas-ventas

### 2. Abre SQL Editor
Dashboard > SQL Editor > New Query

### 3. Ejecuta los scripts en este orden:

---

## PASO 1: Schema Básico (Ejecutar PRIMERO)

```sql
-- ============================================
-- PASO 1: TABLAS PRINCIPALES
-- ============================================

-- Tabla de organizaciones
CREATE TABLE IF NOT EXISTS organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'cancelada')),
  max_usuarios INTEGER NOT NULL DEFAULT 1,
  max_productos INTEGER NOT NULL DEFAULT 50,
  max_ventas_mes INTEGER NOT NULL DEFAULT 100,
  fecha_inicio_suscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin_suscripcion TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizaciones_slug ON organizaciones(slug);
CREATE INDEX IF NOT EXISTS idx_organizaciones_plan ON organizaciones(plan);
CREATE INDEX IF NOT EXISTS idx_organizaciones_estado ON organizaciones(estado);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL DEFAULT 'vendedor' CHECK (rol IN ('super_admin', 'admin', 'gerente', 'cajero', 'vendedor')),
  avatar_url TEXT,
  telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  ultima_sesion TIMESTAMP WITH TIME ZONE,
  preferencias JSONB DEFAULT '{}'::jsonb,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organizacion_id, email)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion ON usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
```

---

## PASO 2: Tablas Secundarias (Ejecutar SEGUNDO)

```sql
-- Invitaciones
CREATE TABLE IF NOT EXISTS invitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'gerente', 'cajero', 'vendedor')),
  token TEXT UNIQUE NOT NULL,
  invitado_por UUID REFERENCES usuarios(id),
  aceptada BOOLEAN DEFAULT FALSE,
  fecha_aceptacion TIMESTAMP WITH TIME ZONE,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_organizacion ON invitaciones(organizacion_id);

-- Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL,
  tabla TEXT NOT NULL,
  registro_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_organizacion ON auditoria(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(creado_en);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT,
  color TEXT,
  parent_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organizacion_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_categorias_org ON categorias(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_categorias_parent ON categorias(parent_id);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  documento_identidad TEXT,
  tipo_documento TEXT CHECK (tipo_documento IN ('CI', 'RIF', 'Pasaporte')),
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  notas TEXT,
  limite_credito DECIMAL(10, 2) DEFAULT 0,
  total_compras DECIMAL(10, 2) DEFAULT 0,
  cantidad_compras INTEGER DEFAULT 0,
  ultima_compra TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_org ON clientes(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT,
  telefono TEXT,
  documento_identidad TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  notas TEXT,
  total_compras DECIMAL(10, 2) DEFAULT 0,
  cantidad_compras INTEGER DEFAULT 0,
  ultima_compra TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proveedores_org ON proveedores(organizacion_id);

-- Compras
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id),
  numero_factura TEXT,
  fecha_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  total DECIMAL(10, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('BS', 'USD')),
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque', 'Crédito')),
  tasa_dolar_momento DECIMAL(10, 2),
  estado TEXT NOT NULL DEFAULT 'completada' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_org ON compras(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha_compra);

-- Compras detalle
CREATE TABLE IF NOT EXISTS compras_detalle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  costo_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_detalle_org ON compras_detalle(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_compras_detalle_compra ON compras_detalle(compra_id);
CREATE INDEX IF NOT EXISTS idx_compras_detalle_producto ON compras_detalle(producto_id);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('stock_bajo', 'venta_importante', 'cierre_caja', 'sistema', 'info')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  datos JSONB,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_org ON notificaciones(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
```

---

## PASO 3: Actualizar Tablas Existentes (Ejecutar TERCERO)

```sql
-- Agregar organizacion_id a tablas existentes
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_configuracion_org ON configuracion(organizacion_id);

ALTER TABLE productos ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id UUID;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_barras TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS proveedor_id UUID;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS usuario_creador_id UUID REFERENCES usuarios(id);

CREATE INDEX IF NOT EXISTS idx_productos_org ON productos(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_id UUID;

CREATE INDEX IF NOT EXISTS idx_ventas_org ON ventas(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);

ALTER TABLE ventas_detalle ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_org ON ventas_detalle(organizacion_id);

ALTER TABLE cierres_caja ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;
ALTER TABLE cierres_caja ADD COLUMN IF NOT EXISTS usuario_apertura_id UUID REFERENCES usuarios(id);
ALTER TABLE cierres_caja ADD COLUMN IF NOT EXISTS usuario_cierre_id UUID REFERENCES usuarios(id);

CREATE INDEX IF NOT EXISTS idx_cierres_caja_org ON cierres_caja(organizacion_id);

-- Agregar constraints
ALTER TABLE productos ADD CONSTRAINT fk_productos_categoria
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

ALTER TABLE productos ADD CONSTRAINT fk_productos_proveedor
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL;

ALTER TABLE ventas ADD CONSTRAINT fk_ventas_cliente
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
```

---

## PASO 4: Triggers y Funciones (Ejecutar CUARTO)

```sql
-- Función para updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS actualizar_organizaciones_timestamp ON organizaciones;
CREATE TRIGGER actualizar_organizaciones_timestamp
  BEFORE UPDATE ON organizaciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_usuarios_timestamp ON usuarios;
CREATE TRIGGER actualizar_usuarios_timestamp
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_productos_timestamp ON productos;
CREATE TRIGGER actualizar_productos_timestamp
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_categorias_timestamp ON categorias;
CREATE TRIGGER actualizar_categorias_timestamp
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_clientes_timestamp ON clientes;
CREATE TRIGGER actualizar_clientes_timestamp
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_proveedores_timestamp ON proveedores;
CREATE TRIGGER actualizar_proveedores_timestamp
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS actualizar_cierres_caja_timestamp ON cierres_caja;
CREATE TRIGGER actualizar_cierres_caja_timestamp
  BEFORE UPDATE ON cierres_caja
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Funciones auxiliares
CREATE OR REPLACE FUNCTION obtener_organizacion_usuario()
RETURNS UUID AS $$
  SELECT organizacion_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION usuario_tiene_rol(rol_requerido TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND rol = rol_requerido
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION usuario_es_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND rol IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## PASO 5: Políticas RLS (Ejecutar QUINTO)

```sql
-- Copiar y pegar todo el contenido del archivo:
-- scripts/101_rls_policies.sql
```

Ver el archivo `scripts/101_rls_policies.sql` para las políticas completas.

---

## ✅ Verificación

Después de ejecutar todos los pasos, verifica:

```sql
-- Ver todas las tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Verificar organizaciones
SELECT * FROM organizaciones;
```

## 🎉 ¡Listo!

Ahora tu base de datos está completamente configurada con:
- ✅ Multi-tenancy
- ✅ Sistema de roles
- ✅ RLS por organización
- ✅ Auditoría
- ✅ Todas las tablas nuevas

**Siguiente paso**: Ejecuta `npm run dev` y registra tu primera cuenta en http://localhost:3000/auth/registro
