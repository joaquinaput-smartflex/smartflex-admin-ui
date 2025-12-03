# SmartFlex Admin UI - Arquitectura

## Visión General

SmartFlex Admin UI es un panel de administración moderno construido con Next.js 15, React 19 y Mantine UI. Implementa un patrón BFF (Backend For Frontend) donde el servidor Next.js actúa como proxy entre el cliente y el backend FastAPI.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI Library | React | 19.x |
| Component Library | Mantine UI | 7.x |
| Icons | Tabler Icons | 3.x |
| Testing | Vitest + Testing Library | Latest |
| Language | TypeScript | 5.x |

## Arquitectura de Seguridad

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐     HTTP      ┌─────────────────┐
│                 │ ◄────────────► │                      │ ◄──────────► │                 │
│     Browser     │   Cookie JWT   │   Next.js Server     │   Bearer     │  FastAPI        │
│    (Cliente)    │   (httpOnly)   │   (API Routes)       │   Token      │  Backend        │
│                 │                │                      │              │                 │
└─────────────────┘                └──────────────────────┘              └─────────────────┘
                                            │
                                   ┌────────┴────────┐
                                   │                 │
                              Server         Server
                            Components      Actions
```

### Principios de Seguridad

1. **El cliente NUNCA conoce la URL del backend**
   - `BACKEND_URL` solo existe en el servidor
   - Todas las peticiones pasan por `/api/*` routes

2. **JWT almacenado en cookie httpOnly**
   - No accesible desde JavaScript del cliente
   - Protección contra XSS

3. **Validación de sesión en middleware**
   - Rutas protegidas verifican sesión antes de renderizar

## Estructura de Directorios

```
src/
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes (BFF Proxy)
│   │   ├── auth/
│   │   │   ├── login/       # POST: Autenticación
│   │   │   └── logout/      # POST: Cierre de sesión
│   │   ├── users/           # CRUD de usuarios
│   │   └── settings/        # Configuración (superadmin)
│   ├── dashboard/           # Páginas protegidas
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── users/           # ABM de usuarios
│   │   ├── devices/         # Lista de dispositivos
│   │   └── settings/        # Configuración
│   ├── login/               # Página de login
│   ├── layout.tsx           # Root layout con Mantine
│   └── page.tsx             # Redirect a /login
├── components/              # Componentes React
│   └── DashboardShell.tsx   # Layout del dashboard
├── lib/                     # Utilidades
│   ├── api.ts               # Cliente HTTP para backend
│   └── session.ts           # Manejo de sesiones
├── __tests__/               # Tests unitarios
│   ├── setup.ts             # Configuración de Vitest
│   ├── api.test.ts          # Tests del cliente API
│   └── session.test.ts      # Tests de sesión
└── theme.ts                 # Configuración de Mantine
```

## Flujo de Autenticación

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────┐
│  Login   │────►│ /api/auth/    │────►│ FastAPI      │────►│ MySQL   │
│  Form    │     │ login         │     │ /admin/api/  │     │ users   │
└──────────┘     └───────────────┘     │ login        │     └─────────┘
                        │              └──────────────┘
                        │                     │
                        │              ┌──────┴──────┐
                        │              │   JWT       │
                        ▼              │   Token     │
                 ┌──────────────┐      └─────────────┘
                 │  Set Cookie  │
                 │  (httpOnly)  │
                 └──────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Redirect    │
                 │  /dashboard  │
                 └──────────────┘
```

## API Routes (BFF Pattern)

Cada API route actúa como proxy seguro:

```typescript
// src/app/api/users/route.ts
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Llama al backend con el token de la sesión
  const result = await usersApi.list(session.token);
  return NextResponse.json(result.data);
}
```

## Sistema de Roles

| Rol | Nivel | Permisos |
|-----|-------|----------|
| `viewer` | 1 | Solo lectura |
| `admin` | 2 | CRUD usuarios y dispositivos |
| `superadmin` | 3 | Todo + configuración del sistema |

### Verificación de Roles

```typescript
// Jerarquía: superadmin > admin > viewer
function hasRole(session: SessionData | null, requiredRole: string): boolean {
  const roleHierarchy = { superadmin: 3, admin: 2, viewer: 1 };
  return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
}
```

## Configuración de Entorno

### Variables Requeridas

```env
# URL del backend FastAPI (solo servidor)
BACKEND_URL=http://127.0.0.1:8000

# Clave para firmar cookies de sesión
JWT_SECRET=clave-muy-segura-y-larga
```

### Variables Opcionales

```env
# Nombre de la cookie de sesión
SESSION_COOKIE_NAME=smartflex_session

# Ambiente
NODE_ENV=production
```

## Deploy

### Standalone Mode

Next.js compila a modo standalone para optimizar el bundle:

```bash
npm run build
# Genera .next/standalone/server.js

# Copiar archivos estáticos
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Ejecutar
node .next/standalone/server.js
```

### PM2 (Producción)

```bash
cd .next/standalone
PORT=3000 pm2 start server.js --name smartflex-admin
```

### Nginx (Reverse Proxy)

```nginx
location /admin {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Importante: excluir /admin de la regla de archivos estáticos
location ~* ^(?!/admin/).*\.(js|css|png|...)$ {
    # Servir estáticos de WordPress
}
```

## Testing

### Ejecutar Tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# Con coverage
npm run test:coverage
```

### Estructura de Tests

```typescript
// Tests de funciones puras
describe('hasRole', () => {
  it('superadmin can access all resources', () => {
    const session = { token: 't', username: 'u', role: 'superadmin' };
    expect(hasRole(session, 'admin')).toBe(true);
  });
});

// Tests con mocks
describe('backendFetch', () => {
  it('adds Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({...});
    await backendFetch('/api/users', {}, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      })
    );
  });
});
```

## CI/CD

### GitHub Actions Pipeline

1. **Test Job**: Lint + Tests unitarios
2. **Deploy Job**: SSH al VPS, pull, build, restart PM2

```yaml
jobs:
  test:
    - npm ci
    - npm run lint
    - npm run test:run

  deploy:
    needs: test
    - SSH to VPS
    - git pull
    - npm run build
    - pm2 restart
```

## Consideraciones de Rendimiento

1. **Server Components por defecto**
   - Solo los componentes interactivos usan `'use client'`

2. **Caché deshabilitado para API**
   - `cache: 'no-store'` en todas las peticiones al backend

3. **Standalone mode**
   - Bundle optimizado sin dependencias innecesarias

## Troubleshooting

### Error: "Error de conexión"
- Verificar que FastAPI esté corriendo en `BACKEND_URL`
- Revisar logs de PM2: `pm2 logs smartflex-admin`

### 404 en archivos estáticos
- Verificar que Nginx no intercepte `/admin/_next/*`
- La regex de archivos estáticos debe excluir `/admin/`

### Sesión no persiste
- Verificar `JWT_SECRET` sea el mismo en todos los deploys
- Cookie requiere HTTPS en producción (`secure: true`)
