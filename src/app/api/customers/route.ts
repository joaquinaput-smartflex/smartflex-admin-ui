import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { customersApi } from '@/lib/api';

// GET /api/customers - List all customers
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const result = await customersApi.list(session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Backend returns { customers: [...] }, extract the array
  return NextResponse.json(result.data?.customers || []);
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can create customers
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { company_id, first_name, last_name, phone, email, role, notifications_enabled, language, notes, status } = body;

    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'Nombre, apellido y teléfono son requeridos' },
        { status: 400 }
      );
    }

    const result = await customersApi.create(session.token, {
      company_id,
      first_name,
      last_name,
      phone,
      email,
      role,
      notifications_enabled,
      language,
      notes,
      status,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}
