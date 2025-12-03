/**
 * Session management utilities.
 * Uses httpOnly cookies for secure JWT storage.
 */
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'smartflex_session';
// JWT_SECRET reserved for future JWT validation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export interface SessionData {
  token: string;
  username: string;
  role: string;
}

/**
 * Get the current session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    // The cookie contains a base64-encoded JSON with token and user info
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decoded) as SessionData;

    if (!session.token || !session.username) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Create a new session cookie.
 */
export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Destroy the current session.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if the current user has a specific role.
 */
export function hasRole(session: SessionData | null, requiredRole: string): boolean {
  if (!session) return false;

  // Role hierarchy: superadmin > admin > viewer
  const roleHierarchy: Record<string, number> = {
    superadmin: 3,
    admin: 2,
    viewer: 1,
  };

  const userLevel = roleHierarchy[session.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user is superadmin.
 */
export function isSuperadmin(session: SessionData | null): boolean {
  return session?.role === 'superadmin';
}
