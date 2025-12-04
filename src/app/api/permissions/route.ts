import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { backendFetch } from '@/lib/api';

// POST /api/permissions - Create or update permission
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { customer_id, device_id, can_view, can_control, can_configure, receive_alerts } = body;

    if (!customer_id || !device_id) {
      return NextResponse.json(
        { error: 'customer_id y device_id son requeridos' },
        { status: 400 }
      );
    }

    const result = await backendFetch('/admin/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id,
        device_id,
        can_view: can_view ?? true,
        can_control: can_control ?? true,
        can_configure: can_configure ?? false,
        receive_alerts: receive_alerts ?? true,
      }),
    }, session.token);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}

// DELETE /api/permissions - Delete permission (uses query params)
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  const deviceId = searchParams.get('device_id');

  if (!customerId || !deviceId) {
    return NextResponse.json(
      { error: 'customer_id y device_id son requeridos' },
      { status: 400 }
    );
  }

  const result = await backendFetch(
    `/admin/api/permissions/${customerId}/${deviceId}`,
    { method: 'DELETE' },
    session.token
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
