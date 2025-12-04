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
    return backendFetch<{ token: string; expires_at: string; must_change_password: boolean }>(
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
    // Backend returns { users: [...] }
    return backendFetch<{ users: Array<{
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
    }> }>('/admin/api/users', {}, token);
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

// Companies endpoints
export const companiesApi = {
  list: async (token: string) => {
    return backendFetch<{ companies: Array<{
      id: number;
      name: string;
      tax_id: string | null;
      address: string | null;
      city: string | null;
      province: string | null;
      country: string;
      phone: string | null;
      email: string | null;
      contact_person: string | null;
      notes: string | null;
      status: 'active' | 'inactive' | 'suspended';
      created_at: string;
      updated_at: string;
    }> }>('/admin/api/companies', {}, token);
  },

  get: async (token: string, id: number) => {
    return backendFetch<{
      id: number;
      name: string;
      tax_id: string | null;
      address: string | null;
      city: string | null;
      province: string | null;
      country: string;
      phone: string | null;
      email: string | null;
      contact_person: string | null;
      notes: string | null;
      status: 'active' | 'inactive' | 'suspended';
      created_at: string;
      updated_at: string;
    }>(`/admin/api/companies/${id}`, {}, token);
  },

  create: async (token: string, data: {
    name: string;
    tax_id?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    notes?: string;
    status?: string;
  }) => {
    return backendFetch('/admin/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  update: async (token: string, id: number, data: {
    name?: string;
    tax_id?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    notes?: string;
    status?: string;
  }) => {
    return backendFetch(`/admin/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  delete: async (token: string, id: number) => {
    return backendFetch(`/admin/api/companies/${id}`, {
      method: 'DELETE',
    }, token);
  },
};

// Customers (contacts) endpoints
export const customersApi = {
  list: async (token: string) => {
    // Backend returns { customers: [...] }
    return backendFetch<{ customers: Array<{
      id: number;
      company_id: number | null;
      company_name: string | null;
      first_name: string;
      last_name: string;
      phone: string;
      email: string | null;
      role: 'user' | 'owner' | 'readonly' | 'admin';
      notifications_enabled: boolean;
      language: string;
      notes: string | null;
      status: 'active' | 'inactive';
      created_at: string;
      updated_at: string;
    }> }>('/admin/api/customers', {}, token);
  },

  get: async (token: string, id: number) => {
    return backendFetch<{
      id: number;
      company_id: number | null;
      company_name: string | null;
      first_name: string;
      last_name: string;
      phone: string;
      email: string | null;
      role: string;
      notifications_enabled: boolean;
      language: string;
      notes: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(`/admin/api/customers/${id}`, {}, token);
  },

  create: async (token: string, data: {
    company_id?: number;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    role?: string;
    notifications_enabled?: boolean;
    language?: string;
    notes?: string;
    status?: string;
  }) => {
    return backendFetch('/admin/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  update: async (token: string, id: number, data: {
    company_id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    notifications_enabled?: boolean;
    language?: string;
    notes?: string;
    status?: string;
  }) => {
    return backendFetch(`/admin/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  delete: async (token: string, id: number) => {
    return backendFetch(`/admin/api/customers/${id}`, {
      method: 'DELETE',
    }, token);
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
