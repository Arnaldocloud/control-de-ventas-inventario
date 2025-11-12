# 🛒 Sistema de Control de Ventas e Inventario - Multi-Tenant SaaS

> **Sistema profesional de gestión de ventas e inventario diseñado para pequeñas y medianas empresas en Venezuela y Latinoamérica**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#%EF%B8%8F-configuración)
- [Uso](#-uso)
- [Planes y Precios](#-planes-y-precios)
- [Seguridad](#-seguridad)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### 🏢 Multi-Tenancy
- **Arquitectura Multi-Tenant**: Cada organización tiene sus propios datos completamente aislados
- **Seguridad RLS**: Row Level Security a nivel de base de datos
- **Múltiples organizaciones**: Un sistema, infinitas empresas

### 👥 Sistema de Roles y Permisos
- **Super Admin**: Control total del sistema
- **Admin**: Gestión completa de la organización
- **Gerente**: Operaciones avanzadas y reportes
- **Cajero**: Ventas y gestión de caja
- **Vendedor**: Solo registro de ventas

### 📦 Gestión de Inventario
- Productos con categorías y subcategorías
- Control de stock con alertas automáticas
- Códigos de barras
- Imágenes de productos
- Costos y precios en BS y USD
- Historial de movimientos

### 💰 Ventas Completas
- Ventas con múltiples productos
- Métodos de pago: Efectivo, Punto, Pago Móvil, Transferencia, Mixto
- Manejo de múltiples monedas (BS/USD)
- Tasa del dólar en tiempo real
- Historial completo de ventas

### 💵 Gestión de Caja
- Apertura y cierre de caja
- Arqueo automático
- Totales por método de pago
- Cálculo de diferencias
- Múltiples cajas (plan Pro+)

### 👤 Gestión de Clientes
- Base de datos de clientes
- Historial de compras
- Estadísticas por cliente
- Límites de crédito
- Clientes frecuentes

### 🏭 Módulo de Compras
- Gestión de proveedores
- Registro de compras
- Órdenes de compra
- Control de costos
- Historial de compras

### 📊 Analytics y Reportes
- Dashboard con métricas en tiempo real
- Gráficos de ventas
- Productos más vendidos
- Reportes exportables (PDF, Excel)
- Análisis de rentabilidad

### 🔔 Notificaciones
- Stock bajo automático
- Ventas importantes
- Cierre de caja
- Notificaciones del sistema

### 🔒 Seguridad
- Autenticación con Supabase Auth
- Encriptación end-to-end
- Auditoría completa de acciones
- Backup automático
- RLS por organización
- Verificación de permisos

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilos utilitarios
- **shadcn/ui** - Componentes UI de alta calidad
- **Recharts** - Gráficos y visualizaciones
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de schemas

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
  - Storage
- **Edge Functions** - Serverless functions

### DevOps
- **Vercel** - Hosting y deployment
- **GitHub Actions** - CI/CD
- **Sentry** - Error tracking

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                    │
│  Next.js 14 + React 18 + TypeScript + Tailwind CSS         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware de Autenticación               │
│         Verificación de sesión + Protección de rutas        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Database   │  │   Storage    │     │
│  │ (JWT Tokens) │  │ (PostgreSQL) │  │   (Files)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Row Level Security (RLS)                        │
│   Cada organización solo accede a sus propios datos         │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenancy

```
Organización A          Organización B          Organización C
    │                       │                       │
    ├── Usuarios            ├── Usuarios            ├── Usuarios
    ├── Productos           ├── Productos           ├── Productos
    ├── Ventas              ├── Ventas              ├── Ventas
    ├── Clientes            ├── Clientes            ├── Clientes
    └── Caja                └── Caja                └── Caja

    Todos los datos aislados por RLS
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase (gratis)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/control-de-ventas-inventario.git
cd control-de-ventas-inventario
```

2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

3. **Configurar Supabase**

Ve a [Supabase Dashboard](https://supabase.com/dashboard) y:
- Crea un nuevo proyecto
- Anota la URL y las API Keys
- Ve a SQL Editor y ejecuta los scripts en orden:
  1. `scripts/100_multi_tenant_schema.sql`
  2. `scripts/101_rls_policies.sql`

**📖 Ver guía completa en:** [EJECUTAR-EN-SUPABASE.md](./EJECUTAR-EN-SUPABASE.md)

4. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración

### Registro de Primera Cuenta

1. Ve a http://localhost:3000/auth/registro
2. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña
   - Nombre de tu negocio
   - Selecciona el plan
3. Verifica tu email
4. ¡Inicia sesión!

### Configuración Inicial

Después del primer inicio de sesión:

1. **Configurar tasa del dólar** en Configuración
2. **Crear categorías** para tus productos
3. **Agregar productos** con sus precios
4. **Abrir caja** antes de hacer ventas
5. **¡Empezar a vender!**

## 📖 Uso

### Crear una Venta

1. Ve a **Ventas > Nueva Venta**
2. Busca productos (por nombre o código de barras)
3. Agrega productos al carrito
4. Selecciona cliente (opcional)
5. Elige método de pago
6. Confirma la venta

### Gestionar Inventario

1. Ve a **Productos**
2. Clic en **Nuevo Producto**
3. Completa la información
4. Asigna categoría
5. Define stock mínimo para alertas

### Abrir/Cerrar Caja

#### Apertura
1. Ve a **Caja**
2. Clic en **Abrir Caja**
3. Registra monto inicial en BS y USD

#### Cierre
1. Ve a **Caja**
2. Clic en **Cerrar Caja**
3. Cuenta el efectivo real
4. El sistema calcula automáticamente diferencias

## 💵 Planes y Precios

| Característica | Free | Pro | Enterprise |
|---|---|---|---|
| **Precio** | **$0**/mes | **$29**/mes | **$99**/mes |
| **Usuarios** | 1 | 5 | Ilimitados |
| **Productos** | 50 | ∞ | ∞ |
| **Ventas/mes** | 100 | ∞ | ∞ |
| **Categorías** | ✅ | ✅ | ✅ |
| **Clientes** | ✅ | ✅ | ✅ |
| **Múltiples cajas** | ❌ | ✅ | ✅ |
| **Código de barras** | ❌ | ✅ | ✅ |
| **Reportes avanzados** | ❌ | ✅ | ✅ |
| **Exportar PDF/Excel** | ❌ | ✅ | ✅ |
| **Proveedores y compras** | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Múltiples sucursales** | ❌ | ❌ | ✅ |
| **Backup personalizado** | ❌ | ❌ | ✅ |
| **Soporte** | Email | Prioritario | 24/7 |

## 🔒 Seguridad

### Características de Seguridad

- ✅ **Autenticación robusta** con Supabase Auth
- ✅ **Row Level Security (RLS)** - Cada organización solo ve sus datos
- ✅ **Encriptación** de datos sensibles
- ✅ **Auditoría completa** de todas las acciones
- ✅ **Rate limiting** para prevenir ataques
- ✅ **Validación exhaustiva** con Zod en todas las entradas
- ✅ **HTTPS** obligatorio en producción
- ✅ **Backup automático** diario
- ✅ **2FA** (opcional)

### Políticas RLS

Todas las tablas tienen políticas RLS que garantizan:
- Los usuarios solo acceden a datos de su organización
- Los permisos se verifican por rol
- Las operaciones sensibles requieren roles específicos

### Auditoría

El sistema registra:
- ✅ Todas las acciones CRUD
- ✅ Inicios de sesión
- ✅ IP y User Agent
- ✅ Datos anteriores y nuevos
- ✅ Usuario que realizó la acción

## 📚 Documentación

### Documentos Incluidos

- **[PLAN-PRODUCCION.md](./PLAN-PRODUCCION.md)** - Plan completo del proyecto, timeline, características
- **[IMPLEMENTACION-GUIA.md](./IMPLEMENTACION-GUIA.md)** - Guía paso a paso para continuar el desarrollo
- **[RESUMEN-IMPLEMENTACION.md](./RESUMEN-IMPLEMENTACION.md)** - Resumen ejecutivo de lo implementado
- **[EJECUTAR-EN-SUPABASE.md](./EJECUTAR-EN-SUPABASE.md)** - Instrucciones detalladas para configurar la base de datos

### API Documentation

Los tipos de TypeScript están documentados en:
- **[lib/types.ts](./lib/types.ts)** - Todos los tipos e interfaces

### Helpers

- **[lib/supabase/auth-helpers.ts](./lib/supabase/auth-helpers.ts)** - Funciones de autenticación y autorización
- **[lib/supabase/client.ts](./lib/supabase/client.ts)** - Cliente de Supabase para el navegador
- **[lib/supabase/server.ts](./lib/supabase/server.ts)** - Cliente de Supabase para el servidor

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

## 👨‍💻 Autor

**ARRODEV**
- Website: [arrodev.com](https://arrodev.com)
- GitHub: [@Arnaldocloud](https://github.com/Arnaldocloud)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Soporte

¿Necesitas ayuda?

- 📧 Email: soporte@arrodev.com
- 💬 Discord: [Únete a nuestra comunidad](#)
- 📖 Docs: [docs.arrodev.com](#)

---

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub!**

**🚀 ¿Listo para lanzar tu negocio al siguiente nivel?**
