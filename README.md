# SmartFlex Admin UI

Panel de administración moderno para SmartFlex IoT, construido con Next.js 15, React 19 y Mantine UI v7.

## Características

- **Next.js 15 App Router** con Server Components
- **React 19** con las últimas características
- **Mantine UI v7** para componentes modernos con dark mode
- **Autenticación segura** con JWT en cookies httpOnly
- **API Routes como proxy** - El backend nunca se expone al cliente
- **CI/CD automático** con GitHub Actions

## Arquitectura de Seguridad

```
[Browser] <--> [Next.js API Routes] <--> [FastAPI Backend]
                    |
             Cookie httpOnly
             (JWT encriptado)
```

El cliente **nunca** conoce la URL del backend. Todas las peticiones pasan por las API Routes de Next.js que actúan como proxy.

## Configuración

1. Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

2. Configurar las variables:

```env
BACKEND_URL=http://127.0.0.1:8000
JWT_SECRET=tu-clave-secreta-muy-larga
```

3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar en desarrollo:

```bash
npm run dev
```

## Deploy

### GitHub Actions (Automático)

Configurar estos secrets en el repositorio:

- `VPS_HOST` - IP o dominio del VPS
- `VPS_USER` - Usuario SSH
- `VPS_SSH_KEY` - Clave privada SSH
- `BACKEND_URL` - URL interna del backend
- `JWT_SECRET` - Clave para firmar sesiones

### Manual

```bash
npm run build
npm start
```

O con PM2:

```bash
pm2 start npm --name "smartflex-admin" -- start
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/          # API Routes (proxy al backend)
│   ├── dashboard/    # Páginas protegidas
│   ├── login/        # Página de login
│   └── layout.tsx    # Root layout con Mantine
├── components/       # Componentes React
├── lib/
│   ├── api.ts        # Cliente API server-side
│   └── session.ts    # Manejo de sesiones
└── theme.ts          # Configuración de Mantine
```

## Funcionalidades

### Usuarios (ABM)
- Crear usuarios con clave por defecto
- Editar información de usuarios
- Resetear contraseñas a la clave por defecto
- Eliminar usuarios (excepto superadmin)
- Ver estado de bloqueo

### Configuración (Solo Superadmin)
- Ver y modificar la clave por defecto
- La clave por defecto se usa para:
  - Nuevos usuarios
  - Reset de contraseñas

## Roles

| Rol | Permisos |
|-----|----------|
| `viewer` | Solo lectura |
| `admin` | Gestión de usuarios y dispositivos |
| `superadmin` | Todo + configuración del sistema |

## Licencia

Privado - SmartFlex IoT
