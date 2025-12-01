import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { usersApi } from '@/lib/api';

// GET /api/users - List all users
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const result = await usersApi.list(session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can create users
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, email, full_name, role } = body;

    if (!username || !role) {
      return NextResponse.json(
        { error: 'Usuario y rol son requeridos' },
        { status: 400 }
      );
    }

    const result = await usersApi.create(session.token, {
      username,
      email,
      full_name,
      role,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}
