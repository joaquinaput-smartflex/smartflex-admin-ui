/**
 * Server-side API client for communicating with the backend.
 * This module is ONLY used on the server (API routes, server components).
 * The BACKEND_URL is never exposed to the client.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function backendFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Don't cache API calls
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type');
    let data: T | undefined;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = (data as { detail?: string })?.detail ||
                          `HTTP ${response.status}`;
      return { error: errorMessage, status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    console.error('Backend fetch error:', error);
    return {
      error: 'Error de conexión con el servidor',
      status: 500
    };
  }
}

// Auth endpoints
export const authApi = {
  login: async (username: string, password: string) => {
    return backendFetch<{ access_token: string; token_type: string }>(
      '/admin/api/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  },
};

// User management endpoints
export const usersApi = {
  list: async (token: string) => {
    return backendFetch<Array<{
      id: number;
      username: string;
      email: string | null;
      full_name: string | null;
      role: string;
      is_active: boolean;
      must_change_password: boolean;
      failed_login_attempts: number;
      locked_until: string | null;
      last_login: string | null;
      created_at: string;
    }>>('/admin/api/users', {}, token);
  },

  create: async (token: string, data: {
    username: string;
    email?: string;
    full_name?: string;
    role: string;
  }) => {
    return backendFetch('/admin/api/users', {
      method: 'POST',
      body: JSON.stringify({ ...data, password: 'default' }),
    }, token);
  },

  update: async (token: string, id: number, data: {
    email?: string;
    full_name?: string;
    role?: string;
    is_active?: boolean;
  }) => {
    return backendFetch(`/admin/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  delete: async (token: string, id: number) => {
    return backendFetch(`/admin/api/users/${id}`, {
      method: 'DELETE',
    }, token);
  },

  resetPassword: async (token: string, id: number) => {
    return backendFetch(`/admin/api/users/${id}/reset-password`, {
      method: 'POST',
    }, token);
  },

  unlock: async (token: string, id: number) => {
    return backendFetch(`/admin/api/users/${id}/unlock`, {
      method: 'POST',
    }, token);
  },
};

// Settings endpoints (superadmin only)
export const settingsApi = {
  getDefaultPassword: async (token: string) => {
    return backendFetch<{ password: string }>('/admin/api/settings/default-password', {}, token);
  },

  setDefaultPassword: async (token: string, password: string) => {
    return backendFetch('/admin/api/settings/default-password', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }, token);
  },

  getUserInfo: async (token: string) => {
    return backendFetch<{
      username: string;
      role: string;
      email: string | null;
      full_name: string | null;
    }>('/admin/api/settings/user-info', {}, token);
  },
};

// Devices endpoints
export const devicesApi = {
  list: async (token: string) => {
    return backendFetch<Array<{
      id: number;
      imei: string;
      friendly_name: string | null;
      owner_phone: string | null;
      is_active: boolean;
      created_at: string;
    }>>('/admin/api/devices', {}, token);
  },

  getState: async (token: string, imei: string) => {
    return backendFetch<{
      relays: number[];
      digital_inputs: number[];
      temp: number;
      hum: number;
      bat: number;
      lat: number;
      lon: number;
      gps_fix: number;
      rssi: number;
    }>(`/admin/api/devices/${imei}/state`, {}, token);
  },

  update: async (token: string, id: number, data: {
    friendly_name?: string;
    owner_phone?: string;
    is_active?: boolean;
  }) => {
    return backendFetch(`/admin/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return backendFetch<{
      status: string;
      mqtt_connected: boolean;
      devices_cached: number;
    }>('/health');
  },
};
