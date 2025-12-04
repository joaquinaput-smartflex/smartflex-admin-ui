import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { devicesApi } from '@/lib/api';

// GET /api/devices/[id] - Get single device
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const deviceId = parseInt(id, 10);

  if (isNaN(deviceId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await devicesApi.get(session.token, deviceId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}

// PUT /api/devices/[id] - Update device
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
  const deviceId = parseInt(id, 10);

  if (isNaN(deviceId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await devicesApi.update(session.token, deviceId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}

// DELETE /api/devices/[id] - Delete device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only superadmin can delete devices
  if (session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Solo superadmin puede eliminar dispositivos' }, { status: 403 });
  }

  const { id } = await params;
  const deviceId = parseInt(id, 10);

  if (isNaN(deviceId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await devicesApi.delete(session.token, deviceId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
