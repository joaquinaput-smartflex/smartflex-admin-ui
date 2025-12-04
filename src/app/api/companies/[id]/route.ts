import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { companiesApi } from '@/lib/api';

// GET /api/companies/[id] - Get single company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await companiesApi.get(session.token, companyId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}

// PUT /api/companies/[id] - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await companiesApi.update(session.token, companyId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only superadmin can delete companies
  if (session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Solo superadmin puede eliminar empresas' }, { status: 403 });
  }

  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await companiesApi.delete(session.token, companyId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
