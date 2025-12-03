import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/lib/api';
import { createSession } from '@/lib/session';

// Decode JWT payload without verification (server already validated it)
function decodeJwtPayload(token: string): { sub: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

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

    // Call backend login
    const loginResult = await authApi.login(username, password);

    if (loginResult.error || !loginResult.data) {
      return NextResponse.json(
        { error: loginResult.error || 'Credenciales inválidas' },
        { status: loginResult.status }
      );
    }

    const { token } = loginResult.data;

    // Decode JWT to get username
    const payload = decodeJwtPayload(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 500 }
      );
    }

    // Get user role from verify endpoint
    const verifyResult = await fetch(
      `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/admin/api/verify`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    let role = 'viewer'; // default
    if (verifyResult.ok) {
      // Try to get role from users list if we're admin
      const usersResult = await fetch(
        `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/admin/api/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }
      );
      if (usersResult.ok) {
        const users = await usersResult.json();
        const currentUser = users.find((u: { username: string }) => u.username === payload.sub);
        if (currentUser) {
          role = currentUser.role;
        }
      }
    }

    // Create session with token and user info
    await createSession({
      token: token,
      username: payload.sub,
      role: role,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: payload.sub,
        role: role,
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
