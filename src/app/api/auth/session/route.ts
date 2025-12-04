import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// GET /api/auth/session - Get current user session info
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json({
    username: session.username,
    role: session.role,
  });
}
