import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { backendFetch, Device } from '@/lib/api';

// GET /api/companies/[id]/devices - Get devices for a company
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

  const result = await backendFetch<{ devices: Device[] }>(
    `/admin/api/devices/by-company/${companyId}`,
    {},
    session.token
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data?.devices || []);
}
