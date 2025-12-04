import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { backendFetch } from '@/lib/api';

interface Permission {
  id: number;
  customer_id: number;
  device_id: number;
  device_db_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  device_name: string | null;
  can_view: boolean;
  can_control: boolean;
  can_configure: boolean;
  receive_alerts: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/companies/[id]/permissions - Get device permissions for a company
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

  const result = await backendFetch<{ permissions: Permission[] }>(
    `/admin/api/permissions/by-company/${companyId}`,
    {},
    session.token
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data?.permissions || []);
}
