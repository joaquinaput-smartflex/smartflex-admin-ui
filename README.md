# SmartFlex Admin UI

[![Deploy](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml)

Panel de administración moderno para **SmartFlex IoT** - Sistema multi-tenant para control y monitoreo de dispositivos vía WhatsApp, con facturación automatizada.

**URL de producción:** https://smartflex.com.ar/admin

---

## Estado del Sistema

| Componente | Estado | Cobertura |
|------------|--------|-----------|
| Firmware ESP32 (T-SIM7070G) | ✅ Producción | 100% |
| Backend FastAPI + MQTT | ✅ Producción | 90% |
| WhatsApp Bot (comandos básicos) | ✅ Producción | 100% |
| **Admin Panel (este repo)** | ✅ Funcional | 70% |
| Sistema de Billing (tablas) | ✅ Creadas | 60% |
| Multi-tenancy (Companies) | ✅ Funcional | 80% |
| WebUI Cliente | ✅ Funcional | 100% |
| Producción Meta WhatsApp | ⚠️ Pendiente | 40% |

---

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

---

## Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SMARTFLEX IoT                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   ESP32      │    │   WhatsApp   │    │   Admin UI   │               │
│  │  T-SIM7070G  │    │     Bot      │    │  (Next.js)   │               │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘               │
│         │                   │                   │                        │
│         │ MQTT              │ HTTP              │ HTTP                   │
│         ▼                   ▼                   ▼                        │
│  ┌─────────────────────────────────────────────────────┐                │
│  │              EMQX (MQTT Broker)                      │                │
│  │              FastAPI Backend                         │                │
│  │              MySQL 8.4+ Database                     │                │
│  └─────────────────────────────────────────────────────┘                │
│                                                                          │
│                    Google Cloud VPS (35.198.14.142)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Arquitectura de Seguridad (BFF Pattern)

```
[Browser] <--> [Next.js API Routes] <--> [FastAPI Backend]
                    |
             Cookie httpOnly
             (JWT encriptado)
```

El cliente **nunca** conoce la URL del backend. Todas las peticiones pasan por las API Routes de Next.js que actúan como proxy.

### Flujo de Autenticación

1. Usuario envía credenciales a `/api/auth/login`
2. Next.js valida con FastAPI backend (interno)
3. Si es válido, crea JWT y lo guarda en cookie httpOnly
4. Las siguientes peticiones incluyen la cookie automáticamente
5. Next.js valida el JWT y agrega headers al backend

---

## Roadmap de Implementación

### FASE 1: Admin Panel Completo ✅

- [x] ABM Usuarios Administrativos
- [x] Roles: superadmin, admin, viewer
- [x] Login multi-usuario
- [x] Listar/Crear/Editar/Eliminar empresas
- [x] Dark mode con Mantine UI

### FASE 2: Frontend Company (Portal Cliente)

- [ ] Crear tabla `company_users`
- [ ] Login por email/phone con JWT
- [ ] Dashboard resumen (dispositivos, alertas, balance)
- [ ] Control de relés desde portal
- [ ] Ver facturas y estado de cuenta
- [ ] ABM usuarios de mi empresa

### FASE 3: Meta WhatsApp Producción

- [x] Número de teléfono verificado
- [x] Webhook HTTPS configurado
- [ ] Business Manager verificado
- [ ] App en modo Producción
- [ ] Política de Privacidad (URL pública)
- [ ] Términos de Servicio (URL pública)

### FASE 4: Documentación

- [x] ARCHITECTURE.md
- [x] ROADMAP.md
- [ ] API_REFERENCE.md
- [ ] DATABASE_SCHEMA.md
- [ ] Manual Usuario Final

### FASE 5: Presentación Comercial

- [ ] Demo WhatsApp Bot en vivo
- [ ] Demo WebUI Control
- [ ] Planes y precios
- [ ] Template contrato de servicio

### FASE 6: Facturación Automatizada

- [ ] Factura Setup (cuota inicial)
- [ ] Factura Recurrente (mensual)
- [ ] Alertas de vencimiento por WhatsApp
- [ ] Integración ARCA (AFIP)
- [ ] Generación automática de CAE

### FASE 7: Sistema de Alarmas y Reportes

- [ ] Tabla `alarms` (eventos de alarma)
- [ ] Tabla `alarm_notifications` (envíos)
- [ ] 25 tipos de reportes
- [ ] Comandos WhatsApp de reportes
- [ ] Caché Redis para performance

### FASE 8: Gestión de Líneas Claro

- [ ] ABM líneas SIM
- [ ] Seguimiento de consumo MB
- [ ] Facturación SIM

---

## Cronograma

| Fase | Descripción | Semana | Estado |
|------|-------------|--------|--------|
| 1 | Admin Panel Completo | 1-2 | ✅ Completado |
| 2 | Frontend Company | 3-4 | ⬜ Pendiente |
| 3 | Meta Producción | 2-3 | ⬜ Pendiente |
| 4 | Documentación | Continuo | 🔄 En progreso |
| 5 | Presentación | 4 | ⬜ Pendiente |
| 6 | Facturación + ARCA | 5-6 | ⬜ Pendiente |
| 7 | Alarmas y Reportes | 7-8 | ⬜ Pendiente |
| 8 | Gestión SIM Claro | 9-10 | ⬜ Pendiente |

**Hitos clave:**
- 15/12: Admin multi-usuario listo ✅
- 22/12: Meta WhatsApp en producción
- 29/12: Portal cliente MVP
- 05/01: Integración ARCA funcional
- 31/01: **v1.0 Release**

---

## Base de Datos

El sistema utiliza **MySQL 8.4+** con la base de datos `smartflexControldb`.

### Tablas Principales (51 tablas)

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
| `invoices` | Facturas emitidas | - |
| `payments` | Pagos recibidos | - |
| `billing_config` | Configuración de facturación | 7 |

### Vistas (18 total)

- `v_active_alarms` - Alarmas activas
- `v_device_health_status` - Estado de salud de dispositivos
- `v_company_dashboard` - Dashboard por empresa
- `v_io_status` - Estado de I/O en tiempo real
- `v_whitelist_full` - Lista blanca con detalles
- `v_subscription_status` - Estado de suscripciones
- `v_pending_reports` - Reportes pendientes
- Y más...

---

## Modelo de Negocio

### Modelo de Facturación

| Concepto | Neto | IVA 21% | Total |
|----------|------|---------|-------|
| **Cuota Inicial** (alquiler equipo) | $300,000 | $63,000 | $363,000 |
| **Cuota Mensual** (servicio) | Variable | 21% | Según plan |

### Planes de Suscripción

| Plan | Precio/mes | Dispositivos | Usuarios | Características |
|------|------------|--------------|----------|-----------------|
| Free Trial | $0 | 1 | 1 | 30 días prueba |
| Básico | $5.000 | 3 | 2 | Soporte email |
| Profesional | $15.000 | 10 | 5 | API access, soporte prioritario |
| Empresarial | $50.000 | 100 | 50 | SLA, integración custom |

*Precios en ARS + 21% IVA*

---

## WhatsApp Bot - Comandos

### Comandos de Control (Rol Operador)

| Comando | Acción |
|---------|--------|
| `/estado [arduino]` | Ver estado completo |
| `/on [arduino] [salida]` | Encender salida específica |
| `/off [arduino] [salida]` | Apagar salida específica |
| `/toggle [arduino] [salida]` | Cambiar estado de salida |
| `/gps [arduino]` | Ver ubicación GPS |
| `/alertas` | Ver suscripciones de alertas |

### Comandos de Reportes (Rol Propietario)

| Comando | Resultado |
|---------|-----------|
| `/reportes` | Abre menú de reportes |
| `/ranking` | Ranking de operadores (30 días) |
| `/pendientes` | Alarmas sin confirmar ahora |
| `/offline` | Equipos sin conexión |
| `/resumen` | Resumen general del día |
| `/equipos` | Equipos más problemáticos |
| `/comparar` | Comparativa mes actual vs anterior |

### Roles WhatsApp

| Rol | Permisos |
|-----|----------|
| **Propietario** | Ver estado, sensores, reportes. NO puede ejecutar comandos. |
| **Operador** | Todo lo del Propietario + ejecutar comandos ON/OFF/TOGGLE |

---

## Sistema de Reportes (25 tipos)

### Reportes de Operadores (4)
1. Rendimiento de operadores (Hoy/7d/30d)
2. Ranking de respuestas (7d/30d)
3. Tasa de escalamiento por operador (30d)
4. Horarios con respuesta lenta (30d)

### Reportes de Alarmas (7)
5. Últimas alarmas confirmadas
6. Alarmas sin confirmar (activas)
7. Tiempos de respuesta
8. Tiempo en estado de alarma
9. Distribución por severidad
10. Alarmas recurrentes
11. Escalamientos múltiples

### Reportes de Equipos (7)
12. Equipos más problemáticos
13. Equipos offline
14. Historial batería baja
15. Temp/Humedad fuera de rango
16. Sensores inactivos
17. Uptime por equipo
18. Salud de equipos (dashboard)

### Reportes de Tendencias (4)
19. Alarmas por hora del día
20. Alarmas por día de semana
21. Tendencia mensual (12 meses)
22. Comparativa mes actual vs anterior

### Reportes de Comandos (3)
23. Historial de comandos
24. Comandos por operador
25. Salidas más utilizadas

---

## Configuración I/O

### Entradas Digitales (DI1 - DI7)

| ID | Uso típico | Sensor |
|----|------------|--------|
| DI1 | Puerta Principal | Magnético |
| DI2 | Ventana | Magnético |
| DI3 | Movimiento | PIR |
| DI4 | Humo | Detector |
| DI5 | Pánico | Pulsador |
| DI6 | Agua | Inundación |
| DI7 | Garage | Fin de carrera |

### Salidas Digitales (DO1 - DO4)

| ID | Uso típico | Comandos |
|----|------------|----------|
| DO1 | Luz Exterior | ON/OFF/TOGGLE |
| DO2 | Sirena | ON/OFF/TOGGLE |
| DO3 | Bomba Agua | ON/OFF/TOGGLE |
| DO4 | Portón | ON/OFF/TOGGLE |

### Sensores Adicionales

| Sensor | Datos |
|--------|-------|
| DHT22 | Temperatura (°C) / Humedad (%) |
| Batería | Nivel (%) / Voltaje (V) |
| GPS | Lat/Long + Link Maps |

---

## Roles y Permisos (Admin Panel)

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

---

## Instalación y Desarrollo

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

```bash
# 1. Clonar repositorio
git clone https://github.com/joaquinaput-smartflex/smartflex-admin-ui.git
cd smartflex-admin-ui

# 2. Configurar entorno
cp .env.example .env.local

# 3. Instalar dependencias
npm install

# 4. Ejecutar en desarrollo
npm run dev

# 5. Abrir http://localhost:3000/admin
```

### Testing

```bash
# Tests en modo watch
npm test

# Tests una sola vez (CI)
npm run test:run

# Con cobertura
npm run test -- --coverage
```

**Tests Incluidos:**
- **session.test.ts** (11 tests) - Validación de roles y permisos
- **api.test.ts** (6 tests) - Cliente API y manejo de errores

---

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
| `BACKEND_URL` | URL interna del backend |
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

---

## Estructura del Proyecto

```
src/
├── __tests__/              # Tests unitarios
│   ├── setup.ts            # Configuración de Vitest
│   ├── session.test.ts     # Tests de sesión
│   └── api.test.ts         # Tests de API
├── app/
│   ├── api/                # API Routes (BFF proxy)
│   │   ├── auth/           # Login, logout, sesión
│   │   ├── devices/        # CRUD de dispositivos
│   │   ├── users/          # CRUD de usuarios
│   │   └── settings/       # Configuración del sistema
│   ├── dashboard/          # Páginas protegidas
│   │   ├── devices/        # Gestión de dispositivos
│   │   ├── users/          # Gestión de usuarios
│   │   └── settings/       # Configuración (superadmin)
│   ├── login/              # Página de login
│   └── layout.tsx          # Root layout con Mantine
├── components/
│   └── DashboardShell.tsx  # Layout del dashboard
├── lib/
│   ├── api.ts              # Cliente API server-side
│   ├── client-api.ts       # Helper para fetch con basePath
│   └── session.ts          # Manejo de sesiones JWT
└── theme.ts                # Configuración de Mantine (dark mode)
```

---

## Métricas de Éxito

| Métrica | Actual | Objetivo v1.0 |
|---------|--------|---------------|
| Empresas activas | 1 | 5+ |
| Dispositivos conectados | 2 | 15+ |
| Uptime sistema | - | 99.5% |
| Tiempo respuesta WhatsApp | ~2s | <1s |
| Facturas emitidas/mes | 0 | 10+ |
| Cobranza automatizada | 0% | 80% |

---

## Repositorios Relacionados

| Repositorio | Descripción |
|-------------|-------------|
| [smartflex-admin-ui](https://github.com/joaquinaput-smartflex/smartflex-admin-ui) | Este repo - Panel Admin Next.js |
| [smartflex-whatsapp-bot](https://github.com/joaquinaput-smartflex/smartflex-whatsapp-bot) | WhatsApp Bot + FastAPI Backend |

## Documentación Adicional

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura detallada del sistema
- [ROADMAP Completo](https://github.com/joaquinaput-smartflex/smartflex-whatsapp-bot/blob/main/docs/ROADMAP.md) - Plan de implementación detallado

---

## Soporte

- **Issues:** https://github.com/joaquinaput-smartflex/smartflex-admin-ui/issues
- **Email:** joaquin.aput@gmail.com

## Licencia

Privado - SmartFlex IoT © 2025

---

*Documentación generada con [Claude Code](https://claude.ai/code) - Última actualización: 2025-12-04*
