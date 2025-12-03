import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Step 1: Call backend login (same as old panel)
    const loginResponse = await fetch(`${BACKEND_URL}/admin/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Credenciales inválidas' },
        { status: loginResponse.status }
      );
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      return NextResponse.json(
        { error: 'No se recibió token del servidor' },
        { status: 500 }
      );
    }

    // Step 2: Get user info (same as old panel uses /settings/user-info)
    const userInfoResponse = await fetch(`${BACKEND_URL}/admin/api/settings/user-info`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Error al obtener información del usuario' },
        { status: 500 }
      );
    }

    const userInfo = await userInfoResponse.json();

    // Step 3: Create session with token and user info
    await createSession({
      token: token,
      username: userInfo.username,
      role: userInfo.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: userInfo.username,
        role: userInfo.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
