import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { companiesApi } from '@/lib/api';

// GET /api/companies - List all companies
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const result = await companiesApi.list(session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data?.companies || []);
}

// POST /api/companies - Create new company
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can create companies
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, tax_id, address, city, province, country, phone, email, contact_person, notes, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    const result = await companiesApi.create(session.token, {
      name,
      tax_id,
      address,
      city,
      province,
      country,
      phone,
      email,
      contact_person,
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
