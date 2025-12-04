# SmartFlex Admin UI

[![Deploy](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml)

Panel de administración moderno para SmartFlex IoT, construido con Next.js 15, React 19 y Mantine UI v7.

**URL de producción:** https://smartflex.com.ar/admin

## Características

- **Next.js 15 App Router** con Server Components y standalone output
- **React 19** con las últimas características
- **Mantine UI v7** para componentes modernos con dark mode
- **Autenticación segura** con JWT en cookies httpOnly
- **API Routes como BFF (Backend For Frontend)** - El backend nunca se expone al cliente
- **CI/CD automático** con GitHub Actions (tests + deploy)
- **Vitest + React Testing Library** para tests unitarios
- **TypeScript** con tipado estricto

## Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js | 15.x |
| UI | React | 19.x |
| Componentes | Mantine UI | 7.x |
| Lenguaje | TypeScript | 5.x |
| Testing | Vitest | 4.x |
| Linting | ESLint | 9.x |
| CI/CD | GitHub Actions | - |
| Runtime | Node.js | 20.x |

## Arquitectura de Seguridad

```
[Browser] <--> [Next.js API Routes] <--> [FastAPI Backend]
                    |
             Cookie httpOnly
             (JWT encriptado)
```

El cliente **nunca** conoce la URL del backend. Todas las peticiones pasan por las API Routes de Next.js que actúan como proxy (patrón BFF).

### Flujo de Autenticación

1. Usuario envía credenciales a `/api/auth/login`
2. Next.js valida con FastAPI backend (interno)
3. Si es válido, crea JWT y lo guarda en cookie httpOnly
4. Las siguientes peticiones incluyen la cookie automáticamente
5. Next.js valida el JWT y agrega headers al backend

## Base de Datos

El sistema utiliza MySQL 8.4+ con la base de datos `smartflexControldb`. Principales tablas:

### Tablas Principales

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `admin_users` | Usuarios del panel admin | 3 |
| `companies` | Empresas/clientes | 4 |
| `devices` | Dispositivos IoT | 1 |
| `customers` | Contactos de empresas | 5 |
| `wa_devices` | Mapeo WhatsApp-Dispositivo | 4 |
| `hardware` | Configuración de hardware | 1 |
| `io_config` | Configuración de I/O (entradas/salidas) | 11 |
| `plans` | Planes de suscripción | 4 |
| `report_types` | Tipos de reportes disponibles | 9 |
| `system_config` | Configuración global del sistema | 10 |
| `alarms` | Registro de alarmas | - |
| `profile` | Perfiles de usuario (permisos) | 6 |

### Vistas (18 total)

- `v_active_alarms` - Alarmas activas
- `v_device_health_status` - Estado de salud de dispositivos
- `v_company_dashboard` - Dashboard por empresa
- `v_io_status` - Estado de I/O en tiempo real
- `v_whitelist_full` - Lista blanca con detalles
- Y más...

## Configuración

### Variables de Entorno

```env
# Backend API URL (interno, nunca expuesto al cliente)
BACKEND_URL=http://127.0.0.1:8000

# JWT Secret para firmar cookies de sesión
JWT_SECRET=tu-clave-secreta-muy-larga

# Nombre de la cookie de sesión
SESSION_COOKIE_NAME=smartflex_session

# Base path para el deploy (debe coincidir con next.config.ts)
NEXT_PUBLIC_BASE_PATH=/admin

# Entorno
NODE_ENV=production
```

### Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/joaquinaput-smartflex/smartflex-admin-ui.git
cd smartflex-admin-ui
```

2. Copiar `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

3. Configurar las variables de entorno

4. Instalar dependencias:
```bash
npm install
```

5. Ejecutar en desarrollo:
```bash
npm run dev
```

6. Abrir http://localhost:3000/admin

## Testing

### Ejecutar Tests

```bash
# Tests en modo watch
npm test

# Tests una sola vez (CI)
npm run test:run

# Con cobertura
npm run test -- --coverage
```

### Tests Incluidos

- **session.test.ts** (11 tests) - Validación de roles y permisos
- **api.test.ts** (6 tests) - Cliente API y manejo de errores

## Deploy

### GitHub Actions (Automático)

El deploy se ejecuta automáticamente al hacer push a `main`:

1. Ejecuta lint y tests
2. Hace build con standalone output
3. Copia archivos al VPS via SSH
4. Reinicia PM2

**Secrets requeridos:**

| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | IP o dominio del VPS |
| `VPS_USER` | Usuario SSH |
| `VPS_SSH_KEY` | Clave privada SSH |
| `BACKEND_URL` | URL interna del backend (http://127.0.0.1:8000) |
| `JWT_SECRET` | Clave para firmar sesiones |

### Manual

```bash
# Build
npm run build

# Producción con standalone
node .next/standalone/server.js

# O con PM2
pm2 start ecosystem.config.js
```

## Estructura del Proyecto

```
src/
├── __tests__/          # Tests unitarios
│   ├── setup.ts        # Configuración de Vitest
│   ├── session.test.ts # Tests de sesión
│   └── api.test.ts     # Tests de API
├── app/
│   ├── api/            # API Routes (BFF proxy)
│   │   ├── auth/       # Login, logout, sesión
│   │   ├── devices/    # CRUD de dispositivos
│   │   ├── users/      # CRUD de usuarios
│   │   └── settings/   # Configuración del sistema
│   ├── dashboard/      # Páginas protegidas
│   │   ├── devices/    # Gestión de dispositivos
│   │   ├── users/      # Gestión de usuarios
│   │   └── settings/   # Configuración (superadmin)
│   ├── login/          # Página de login
│   └── layout.tsx      # Root layout con Mantine
├── components/
│   └── DashboardShell.tsx  # Layout del dashboard
├── lib/
│   ├── api.ts          # Cliente API server-side
│   ├── client-api.ts   # Helper para fetch con basePath
│   └── session.ts      # Manejo de sesiones JWT
└── theme.ts            # Configuración de Mantine (dark mode)
```

## Funcionalidades

### Dashboard
- Vista general del sistema
- Estadísticas rápidas
- Accesos directos

### Gestión de Usuarios
- Crear usuarios con clave por defecto
- Editar información de usuarios
- Resetear contraseñas
- Eliminar usuarios (excepto superadmin)
- Ver estado de bloqueo por intentos fallidos

### Gestión de Dispositivos
- Ver lista de dispositivos IoT
- Estado en tiempo real
- Información de hardware
- Configuración de I/O

### Configuración (Solo Superadmin)
- Ver y modificar la clave por defecto
- Configuración global del sistema

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| `viewer` | Solo lectura del dashboard |
| `admin` | Gestión de usuarios y dispositivos |
| `superadmin` | Todo + configuración del sistema |

### Perfiles de Base de Datos

| ID | Perfil | Descripción |
|----|--------|-------------|
| 1 | guest | Solo ver estados |
| 2 | operator | Ver y controlar dispositivos |
| 3 | supervisor | Gestionar zonas asignadas |
| 4 | manager | Administrar empresa |
| 5 | high_manager | Administrar múltiples empresas |
| 6 | superadmin | Acceso total |

## Planes de Suscripción

| Plan | Precio/mes | Dispositivos | Usuarios |
|------|------------|--------------|----------|
| Free Trial | $0 | 1 | 1 |
| Básico | $5.000 | 3 | 2 |
| Profesional | $15.000 | 10 | 5 |
| Empresarial | $50.000 | 100 | 50 |

*Precios en ARS + 21% IVA*

## Reportes Disponibles

1. **Resumen Diario** - Eventos y alarmas del día
2. **Reporte Semanal de Eventos** - Detalle semanal con gráficos
3. **Reporte Semanal de Alarmas** - Análisis de alarmas
4. **Reporte Mensual de Uso** - Estadísticas por dispositivo
5. **Reporte Mensual de Facturación** - Resumen de cobros
6. **Resumen Anual** - Tendencias anuales
7. **Ciclo de Vida del Dispositivo** - Historia completa
8. **Análisis de Alarmas** - Patrones y frecuencias
9. **Reporte de Disponibilidad** - Uptime/downtime

## Documentación Adicional

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura detallada del sistema
- [ROADMAP del Bot WhatsApp](https://github.com/joaquinaput-smartflex/smartflex-whatsapp-bot/blob/main/docs/ROADMAP.md)

## Soporte

- **Issues:** https://github.com/joaquinaput-smartflex/smartflex-admin-ui/issues
- **Email:** joaquin.aput@gmail.com

## Licencia

Privado - SmartFlex IoT © 2025
