import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backendFetch } from '@/lib/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('backendFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('makes GET request with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: 'test' }),
    });

    await backendFetch('/admin/api/users');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/api/users'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        cache: 'no-store',
      })
    );
  });

  it('adds Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await backendFetch('/admin/api/users', {}, 'test-token');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('returns data on successful response', async () => {
    const testData = { users: [{ id: 1, name: 'Test' }] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(testData),
    });

    const result = await backendFetch('/admin/api/users');

    expect(result).toEqual({
      data: testData,
      status: 200,
    });
  });

  it('returns error on failed response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ detail: 'Invalid credentials' }),
    });

    const result = await backendFetch('/admin/api/login');

    expect(result).toEqual({
      error: 'Invalid credentials',
      status: 401,
    });
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await backendFetch('/admin/api/users');

    expect(result).toEqual({
      error: 'Error de conexión con el servidor',
      status: 500,
    });
  });

  it('handles non-JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({ 'content-type': 'text/plain' }),
    });

    const result = await backendFetch('/admin/api/users/1', { method: 'DELETE' });

    expect(result.status).toBe(204);
  });
});
