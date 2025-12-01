import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { usersApi } from '@/lib/api';

// PUT /api/users/:id - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await usersApi.update(session.token, userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}

// DELETE /api/users/:id - Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can delete users
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await usersApi.delete(session.token, userId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
