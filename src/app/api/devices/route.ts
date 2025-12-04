import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { devicesApi } from '@/lib/api';

// GET /api/devices - List all devices
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const result = await devicesApi.list(session.token);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Backend returns { devices: [...] }, extract the array
  return NextResponse.json(result.data?.devices || []);
}

// POST /api/devices - Create new device
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admin or superadmin can create devices
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { device_id, company_id, name, location, model, firmware_version, imei, mac_address,
            sim_number, sim_carrier, relay_count, relay_labels, input_count, input_labels, notes, status } = body;

    if (!device_id) {
      return NextResponse.json(
        { error: 'El ID del dispositivo es requerido' },
        { status: 400 }
      );
    }

    const result = await devicesApi.create(session.token, {
      device_id,
      company_id,
      name,
      location,
      model,
      firmware_version,
      imei,
      mac_address,
      sim_number,
      sim_carrier,
      relay_count,
      relay_labels,
      input_count,
      input_labels,
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
