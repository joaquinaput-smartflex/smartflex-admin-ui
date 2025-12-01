import { NextRequest, NextResponse } from 'next/server';
import { getSession, isSuperadmin } from '@/lib/session';
import { settingsApi } from '@/lib/api';

// GET /api/settings/default-password - Get current default password (superadmin only)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!isSuperadmin(session)) {
    return NextResponse.json({ error: 'Solo superadmin puede ver esta configuración' }, { status: 403 });
  }

  const result = await settingsApi.getDefaultPassword(session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}

// PUT /api/settings/default-password - Set default password (superadmin only)
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!isSuperadmin(session)) {
    return NextResponse.json({ error: 'Solo superadmin puede cambiar esta configuración' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const result = await settingsApi.setDefaultPassword(session.token, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, message: 'Contraseña por defecto actualizada' });
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}
