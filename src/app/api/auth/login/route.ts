import { NextRequest, NextResponse } from 'next/server';
import { authApi, settingsApi } from '@/lib/api';
import { createSession } from '@/lib/session';

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

    const { access_token } = loginResult.data;

    // Get user info to store in session
    const userInfoResult = await settingsApi.getUserInfo(access_token);

    if (userInfoResult.error || !userInfoResult.data) {
      return NextResponse.json(
        { error: 'Error al obtener información del usuario' },
        { status: 500 }
      );
    }

    // Create session with token and user info
    await createSession({
      token: access_token,
      username: userInfoResult.data.username,
      role: userInfoResult.data.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: userInfoResult.data.username,
        role: userInfoResult.data.role,
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
