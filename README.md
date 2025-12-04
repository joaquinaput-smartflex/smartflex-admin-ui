# SmartFlex Admin UI

[![Deploy](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/joaquinaput-smartflex/smartflex-admin-ui/actions/workflows/deploy.yml)

Panel de administración moderno para **SmartFlex IoT** - Sistema multi-tenant para control y monitoreo de dispositivos vía WhatsApp, con facturación automatizada.

**URL de producción:** https://smartflex.com.ar/admin
**Versión:** SMART-v52.0_PRO

### Conexión WhatsApp Bot

| Parámetro | Valor |
|-----------|-------|
| **Número WhatsApp** | +54 9 11 3290-9073 |
| **MQTT Broker** | 35.198.14.142:1883 |
| **WebSocket (WS)** | 35.198.14.142:8083 |
| **EMQX Dashboard** | http://35.198.14.142:18083 |

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

## Stack Tecnológico Completo

### Admin Panel (Este Repo)

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

### Backend & Cloud

| Componente | Tecnología |
|------------|------------|
| Runtime | Python 3.11+ / FastAPI |
| Base de datos | MySQL 8.4+ |
| MQTT Broker | EMQX / HiveMQ Cloud |
| API WhatsApp | WhatsApp Cloud API (Meta) |
| Hosting | Google Cloud VPS |

### Hardware

| Componente | Tecnología |
|------------|------------|
| MCU | ESP32 (LilyGO T-SIM7070G) |
| Módem | SIM7600G-H (4G LTE) |
| Sensores | DHT22, GPS/GNSS |
| I/O | 7 DI + 4 DO |

---

## Arquitectura del Sistema

### Las 4 Columnas del Sistema

| Hardware | Comunicación | Cloud | Interfaces |
|----------|--------------|-------|------------|
| ESP32 | 4G LTE | FastAPI | Bot WhatsApp |
| SIM7600G-H | MQTT TLS | MySQL | Web Dashboard |
| DHT22 | WebSockets | EMQX | Admin Panel |
| GPS/GNSS | AT Commands | WhatsApp API | API REST |
| 7 DI + 4 DO | JSON | FreeRTOS | Reportes |

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

### Flujo de Datos MQTT

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  ESP32  │────▶│  4G/LTE │────▶│  EMQX   │────▶│ FastAPI │
│         │     │         │     │ Broker  │     │ Backend │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   MySQL     │
                               │  Database   │
                               └─────────────┘
```

### Arquitectura de Seguridad (BFF Pattern)

```
[Browser] <--> [Next.js API Routes] <--> [FastAPI Backend]
                    |
             Cookie httpOnly
             (JWT encriptado)
```

El cliente **nunca** conoce la URL del backend. Todas las peticiones pasan por las API Routes de Next.js que actúan como proxy.

---

## FreeRTOS Dual-Core (Firmware ESP32)

El ESP32 ejecuta FreeRTOS con distribución de tareas en dos núcleos:

### Core 0 - Comunicaciones

| Tarea | Prioridad | Función |
|-------|-----------|---------|
| `taskMQTT` | Alta | Conexión y publicación MQTT |
| `taskModem` | Alta | Gestión del módulo SIM7600 |
| `taskGNSS` | Media | Adquisición GPS con fallback CLBS |
| `taskCommands` | Media | Procesamiento de comandos remotos |

### Core 1 - Sensores y Lógica

| Tarea | Prioridad | Función |
|-------|-----------|---------|
| `taskSensors` | Alta | Lectura DHT22 y batería |
| `taskInputs` | Alta | Monitoreo de 7 entradas digitales |
| `taskOutputs` | Media | Control de 4 salidas digitales |
| `taskAlarms` | Alta | Evaluación y disparo de alarmas |

### Secuencia de Stages (Boot)

```
STAGE 0: Init Hardware
    ↓
STAGE 1: Modem Power On
    ↓
STAGE 2: Network Registration
    ↓
STAGE 3: MQTT Connect
    ↓
STAGE 4: Subscribe Topics
    ↓
STAGE 5: Operational Loop
```

---

## Comunicación MQTT

### Topics MQTT

| Topic | Dirección | Contenido |
|-------|-----------|-----------|
| `smartflex/{device_id}/telemetry` | ESP32 → Cloud | Datos de sensores |
| `smartflex/{device_id}/status` | ESP32 → Cloud | Estado del dispositivo |
| `smartflex/{device_id}/alarms` | ESP32 → Cloud | Alarmas activas |
| `smartflex/{device_id}/commands` | Cloud → ESP32 | Comandos de control |
| `smartflex/{device_id}/config` | Cloud → ESP32 | Configuración remota |

### Formato de Payload (JSON)

```json
{
  "device_id": "SF-001",
  "timestamp": 1699876543,
  "temperature": 24.5,
  "humidity": 62,
  "battery": { "percent": 87, "voltage": 12.6 },
  "inputs": [1, 0, 0, 1, 0, 0, 1],
  "outputs": [0, 1, 0, 0],
  "gps": { "lat": -34.6037, "lng": -58.3816, "valid": true }
}
```

### Triggers de Envío de Datos

El sistema envía datos al servidor cuando:

1. **Cambio de entrada digital** - Inmediato
2. **Comando de salida ejecutado** - Inmediato
3. **Alarma disparada** - Inmediato
4. **Intervalo periódico** - Cada 60 segundos (configurable)
5. **Solicitud del servidor** - Bajo demanda
6. **Batería crítica** - Cuando < 20%

---

## Ciclo GNSS con Fallback

### Diagrama de Flujo

```
┌──────────────────┐
│  Iniciar GNSS    │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ AT+CGNSSPWR=1    │
└────────┬─────────┘
         ▼
┌──────────────────┐     NO      ┌──────────────────┐
│  ¿Fix válido?    │────────────▶│  Fallback CLBS   │
│  (30s timeout)   │             │  AT+CLBS=1,1     │
└────────┬─────────┘             └────────┬─────────┘
         │ SÍ                             │
         ▼                                ▼
┌──────────────────┐             ┌──────────────────┐
│ Usar coordenadas │             │ Usar ubicación   │
│ GPS precisas     │             │ por celdas       │
└────────┬─────────┘             └────────┬─────────┘
         │                                │
         └───────────────┬────────────────┘
                         ▼
              ┌──────────────────┐
              │ Publicar en MQTT │
              └──────────────────┘
```

### Comandos AT para GNSS

| Comando | Función | Respuesta |
|---------|---------|-----------|
| `AT+CGNSSPWR=1` | Encender GPS | OK |
| `AT+CGNSSINFO` | Obtener coordenadas | +CGNSSINFO: lat,lng,alt,... |
| `AT+CLBS=1,1` | Ubicación por celdas (fallback) | +CLBS: 0,lat,lng,acc |
| `AT+CGNSSPWR=0` | Apagar GPS (ahorro energía) | OK |

### Parámetros de Configuración GPS

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `gnssQueryMs` | 3000 ms | Intervalo entre consultas AT+CGNSSINFO |
| `maxGnssNoFix` | 6 intentos | Máximo intentos antes de fallback CLBS |
| `clbsRetries` | 2 | Reintentos de ubicación por celdas |
| GPS Timeout | 30 segundos | Tiempo máximo para obtener fix |
| CLBS Accuracy | ~500m (urbano) / ~2km (rural) | Precisión por triangulación |
| Update Interval | 60s - 3600s | Configurable según caso de uso |
| Power Mode | Auto-sleep | Apaga GPS entre lecturas para ahorro |

---

## Sensores y Monitoreo

### Sensor DHT22 (Temperatura/Humedad)

| Parámetro | Rango | Precisión |
|-----------|-------|-----------|
| Temperatura | -40°C a 80°C | ±0.5°C |
| Humedad | 0% a 100% | ±2% |
| Intervalo mínimo | 2 segundos | - |

#### Thresholds para Envío de Datos

El sistema solo envía datos al servidor cuando los valores cambian significativamente:

| Sensor | Threshold | Descripción |
|--------|-----------|-------------|
| Temperatura | 1.0°C | Cambio mínimo para triggear envío |
| Humedad | 3% | Cambio mínimo para triggear envío |

Esto optimiza el uso de datos móviles y reduce carga en el broker MQTT.

### Monitoreo de Batería

#### Curva Li-ion OCV (Open Circuit Voltage)

Curva de descarga para batería Li-ion 1S (3.3V - 4.2V):

| Voltaje | Porcentaje | Estado |
|---------|------------|--------|
| 4.20V | 100% | Carga completa |
| 4.00V | 75% | Normal |
| 3.80V | 50% | Medio |
| 3.60V | 25% | Bajo |
| 3.30V | 0% | Crítico - apagado |

#### Para Batería 12V (Backup)

| Nivel | Voltaje | Porcentaje |
|-------|---------|------------|
| Llena | ≥ 12.6V | 100% |
| Normal | 12.0V - 12.6V | 50-99% |
| Baja | 11.5V - 12.0V | 20-49% |
| Crítica | < 11.5V | < 20% |

```
Voltaje ADC → Divisor Resistivo → Cálculo
    │
    ├── Rango: 10V - 15V (12V) o 3.0V - 4.5V (Li-ion)
    ├── Resolución: 12 bits
    └── Fórmula: V = (ADC / 4095) × 3.3 × Factor
```

---

## Configuración I/O

### Entradas Digitales (DI1 - DI7)

| ID | Alias (ejemplo) | Uso típico | Sensor |
|----|-----------------|------------|--------|
| DI1 | Puerta Principal | Acceso | Magnético |
| DI2 | Ventana Cocina | Seguridad | Magnético |
| DI3 | Sensor Movimiento | Intrusión | PIR |
| DI4 | Alarma Humo | Incendio | Detector humo |
| DI5 | Botón Pánico | Emergencia | Pulsador |
| DI6 | Sensor Agua | Inundación | Detector agua |
| DI7 | Garage | Posición | Fin de carrera |

### Salidas Digitales (DO1 - DO4)

| ID | Alias (ejemplo) | Uso típico | Comandos |
|----|-----------------|------------|----------|
| DO1 | Luz Exterior | Iluminación | ON/OFF/TOGGLE |
| DO2 | Sirena | Alarma | ON/OFF/TOGGLE |
| DO3 | Bomba Agua | Riego/Cisterna | ON/OFF/TOGGLE |
| DO4 | Portón Garage | Acceso | ON/OFF/TOGGLE |

### Sensores Adicionales

| Sensor | Datos | Formato | Precisión |
|--------|-------|---------|-----------|
| **DHT22** | Temperatura y Humedad | 25.5°C / 65% | ±0.5°C / ±2% |
| **Batería** | Nivel de carga | 85% \| 12.4V | ±0.1V |
| **GPS** | Ubicación | Lat/Long + Link Maps | ~3m (GPS) / ~500m (CLBS) |

---

## WhatsApp Bot - Chatbot

### Estados del Chatbot

El chatbot mantiene un estado de conversación por usuario:

| Estado | Descripción |
|--------|-------------|
| `IDLE` | Esperando mensaje inicial |
| `MENU_PRINCIPAL` | Mostrando lista de Arduinos |
| `MENU_ARDUINO` | Dentro de un Arduino específico |
| `MENU_CONTROL` | Seleccionando salida a controlar |
| `CONTROL_SALIDA` | Ejecutando comando en una salida |
| `MENU_ALERTAS` | Gestionando suscripciones |
| `WAITING_CONFIRMATION` | Esperando confirmación de acción |

### Flujo de Navegación

1. Usuario envía "Hola" o cualquier mensaje inicial
2. Bot verifica si el número está registrado en la base de datos
3. Obtiene Company y Rol del usuario
4. Lista los Arduinos disponibles para su Company
5. Muestra menú principal según el rol

### Menú Principal (Usuario Registrado)

```
¡Hola Juan! 👋
Tienes acceso a los siguientes dispositivos:

1️⃣ Casa Principal
2️⃣ Oficina Centro

📊 Estado General
🔔 Gestionar Alertas
❓ Ayuda
```

### Comandos de Control (Rol Operador)

| Comando | Acción |
|---------|--------|
| `/estado [arduino]` | Ver estado completo |
| `/on [arduino] [salida]` | Encender salida específica |
| `/off [arduino] [salida]` | Apagar salida específica |
| `/toggle [arduino] [salida]` | Cambiar estado de salida |
| `/gps [arduino]` | Ver ubicación GPS |
| `/alertas` | Ver suscripciones de alertas |

**Ejemplo:**
```
/on casa luz
→ Enciende la "Luz Exterior" del Arduino "Casa Principal"
```

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
| `/comandos` | Últimos 10 comandos ejecutados |

### Roles WhatsApp

| Rol | Permisos |
|-----|----------|
| **Propietario** | ✅ Ver estado, sensores, reportes. ❌ NO puede ejecutar comandos. |
| **Operador** | ✅ Todo lo del Propietario + ejecutar comandos ON/OFF/TOGGLE |

---

## Formatos de Respuesta del Chatbot

### Estado Completo de un Arduino

```
📊 Estado Completo - Casa Principal
━━━━━━━━━━━━━━━━━━━━━━

🌡️ Temperatura: 24.5°C
💧 Humedad: 62%
🔋 Batería: 87% (12.6V)

━━━━━━━━━━━━━━━━━━━━━━
📥 ENTRADAS:
• Puerta Principal: 🟢 Cerrada
• Ventana Cocina: 🔴 Abierta

━━━━━━━━━━━━━━━━━━━━━━
📤 SALIDAS:
• Luz Exterior: 🔴 OFF
• Bomba Agua: 🟢 ON

🕐 Actualizado: hace 30 seg
```

### Confirmación de Comando

```
✅ Comando ejecutado correctamente
Luz Exterior: OFF → ON
🕐 Ejecutado: 14:32:15
```

### Error de Comando

```
❌ Error al ejecutar comando
No se pudo comunicar con el dispositivo.
Intente nuevamente en unos segundos.
```

---

## Sistema de Reportes (25 tipos)

### Menú de Reportes en WhatsApp

```
📊 Centro de Reportes
━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 OPERADORES
1️⃣ Rendimiento de operadores
2️⃣ Ranking de respuestas
3️⃣ Tasa de escalamiento
4️⃣ Horarios respuesta lenta

🚨 ALARMAS
5️⃣ Últimas confirmadas
6️⃣ Sin confirmar (activas)
7️⃣ Tiempos de respuesta
8️⃣ Distribución severidad

🔧 EQUIPOS
9️⃣ Más problemáticos
🔟 Equipos offline

📈 TENDENCIAS
1️⃣1️⃣ Análisis temporal

0️⃣ Volver
```

### Reportes de Operadores (4)
1. Rendimiento de operadores (Hoy/7d/30d)
2. Ranking de respuestas (7d/30d)
3. Tasa de escalamiento por operador (30d)
4. Horarios con respuesta lenta (30d)

### Reportes de Alarmas (7)
5. Últimas alarmas confirmadas (Últimas 10/20)
6. Alarmas sin confirmar (Activas ahora)
7. Tiempos de respuesta (7d/30d)
8. Tiempo en estado de alarma (7d/30d)
9. Distribución por severidad (7d/30d)
10. Alarmas recurrentes (30d)
11. Escalamientos múltiples (30d)

### Reportes de Equipos (7)
12. Equipos más problemáticos (7d/30d)
13. Equipos offline (Ahora)
14. Historial batería baja (7d)
15. Temp/Humedad fuera de rango (7d)
16. Sensores inactivos - posible falla (30d)
17. Uptime por equipo (30d)
18. Salud de equipos (dashboard)

### Reportes de Tendencias (4)
19. Alarmas por hora del día (7d/30d)
20. Alarmas por día de semana (30d)
21. Tendencia mensual (12 meses)
22. Comparativa mes actual vs anterior

### Reportes de Comandos (4)
23. Historial de comandos (Últimos 50)
24. Comandos por operador (7d/30d)
25. Salidas más utilizadas (30d)
26. Comandos post-alarma (30d)

---

## Ejemplos de Reportes

### Rendimiento de Operadores

```
👥 Rendimiento de Operadores (últimos 7 días)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Juan Pérez
📊 Alarmas recibidas: 45
✅ Confirmadas: 43 (95.5%)
⏱️ Tiempo promedio: 1m 23s
📢 Escalamientos: 2

👤 María García
📊 Alarmas recibidas: 38
✅ Confirmadas: 38 (100%)
⏱️ Tiempo promedio: 0m 47s
📢 Escalamientos: 0
```

### Ranking de Respuestas

```
🏆 Ranking de Operadores (últimos 30 días)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥇 María García - 0m 47s (100% conf.)
🥈 Carlos López - 1m 12s (98% conf.)
🥉 Juan Pérez - 1m 23s (95% conf.)
4. Ana Martínez - 1m 45s (97% conf.)
5. Pedro Gómez - 2m 01s (92% conf.)
```

### Análisis Temporal

```
📈 Alarmas por Hora del Día (últimos 7 días)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

00-06h ▓░░░░░░░░░ 12 alarmas
06-12h ▓▓▓▓▓░░░░░ 45 alarmas
12-18h ▓▓▓▓▓▓▓▓░░ 78 alarmas ⚠️ PICO
18-24h ▓▓▓░░░░░░░ 21 alarmas

💡 Recomendación: El mayor pico de alarmas
   ocurre entre las 12:00 y 18:00.
   Considerar reforzar el turno de tarde.
```

---

## Queries SQL de Referencia

### Rendimiento de Operadores

```sql
SELECT
  u.name,
  COUNT(*) as total_alarmas,
  SUM(CASE WHEN an.status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmadas,
  AVG(EXTRACT(EPOCH FROM (an.confirmed_at - an.sent_at))) as tiempo_promedio,
  SUM(CASE WHEN an.escalated THEN 1 ELSE 0 END) as escalamientos
FROM alarm_notifications an
JOIN users u ON an.user_id = u.id
WHERE an.sent_at >= NOW() - INTERVAL '7 days'
  AND u.company_id = :company_id
GROUP BY u.id, u.name
ORDER BY tiempo_promedio ASC;
```

### Equipos Más Problemáticos

```sql
SELECT
  a.name as arduino_name,
  COUNT(*) as total_alarmas,
  COUNT(DISTINCT DATE(al.created_at)) as dias_con_alarmas
FROM alarms al
JOIN arduinos a ON al.arduino_id = a.id
WHERE al.created_at >= NOW() - INTERVAL '30 days'
  AND a.company_id = :company_id
GROUP BY a.id, a.name
ORDER BY total_alarmas DESC
LIMIT 10;
```

### Equipos Offline

```sql
SELECT name, last_seen,
  EXTRACT(EPOCH FROM (NOW() - last_seen))/60 as minutos_offline
FROM arduinos
WHERE company_id = :company_id
  AND last_seen < NOW() - INTERVAL '30 minutes'
ORDER BY last_seen ASC;
```

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

## Notas de Implementación

1. Los alias de entradas/salidas se configuran en la Web UI de administración
2. Las alertas se configuran desde la Web UI, el bot solo permite suscribirse/desuscribirse
3. El timeout de sesión recomendado es de **5 minutos** de inactividad
4. Cada comando debe registrarse en un **log de auditoría**
5. Los mensajes deben ser concisos para WhatsApp (**máx 4096 caracteres**)
6. Implementar **caché** para reportes pesados (ej: tendencia mensual)
7. Limitar resultados en chatbot (ej: top 5/10) para mensajes cortos
8. Ofrecer opción de "ver más" o enviar PDF/Excel para reportes extensos
9. La Web UI puede mostrar reportes más detallados con gráficos
10. Considerar **reportes programados** (ej: resumen semanal automático)
11. Agregar filtros: por equipo, por operador, por período
12. Sistema **bilingüe ES/EN** - todos los comandos funcionan en ambos idiomas

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

### Presentación Técnica (PowerPoint)

**Archivo:** `SmartFlex_Sistema_IoT_1.pptx` (Google Drive)

Presentación de 15 diapositivas con **27 imágenes/capturas** incluyendo:

| Diapositiva | Contenido |
|-------------|-----------|
| 1-2 | Las 4 Columnas del Sistema, Arquitectura General |
| 3-4 | FreeRTOS Dual-Core (Core 0/1), Secuencia de Stages |
| 5-6 | Flujo MQTT, Formato de Payload JSON |
| 7-8 | Ciclo GNSS con Fallback CLBS, Parámetros GPS |
| 9-10 | Sensores (DHT22, Batería), Configuración I/O |
| 11-12 | **Web UI Dashboard** - Screenshots de la interfaz de administración |
| 13-14 | Roles y Permisos, Mapeo de I/O en la interfaz |
| 15 | Navegación del Chatbot WhatsApp, Centro de Reportes |

Las capturas incluyen vistas del:
- Dashboard principal con métricas
- Panel de control de dispositivos
- Gestión de usuarios y roles
- Configuración de entradas/salidas
- Interfaz de monitoreo en tiempo real

---

## Soporte

- **Issues:** https://github.com/joaquinaput-smartflex/smartflex-admin-ui/issues
- **Email:** joaquin.aput@gmail.com

## Licencia

Privado - SmartFlex IoT © 2025

---

*SmartFlex IoT - Documentación Técnica v52.0_PRO*
*Generada con [Claude Code](https://claude.ai/code) - Última actualización: 2025-12-03*
