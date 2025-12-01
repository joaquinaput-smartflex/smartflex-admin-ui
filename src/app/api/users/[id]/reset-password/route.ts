import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { usersApi } from '@/lib/api';

// POST /api/users/:id/reset-password - Reset user password to default
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can reset passwords
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await usersApi.resetPassword(session.token, userId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
