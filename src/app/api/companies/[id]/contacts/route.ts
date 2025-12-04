import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { backendFetch } from '@/lib/api';

// GET /api/companies/[id]/contacts - Get contacts for a company
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

  const result = await backendFetch<{ customers: Array<{
    id: number;
    company_id: number | null;
    company_name: string | null;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
    role: string;
    notifications_enabled: boolean;
    language: string;
    notes: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  }> }>(`/admin/api/customers/by-company/${companyId}`, {}, session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data?.customers || []);
}
