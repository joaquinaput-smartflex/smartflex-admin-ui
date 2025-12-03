import { describe, it, expect } from 'vitest';
import { hasRole, isSuperadmin, type SessionData } from '@/lib/session';

describe('Session utilities', () => {
  describe('hasRole', () => {
    const createSession = (role: string): SessionData => ({
      token: 'test-token',
      username: 'testuser',
      role,
    });

    it('returns false for null session', () => {
      expect(hasRole(null, 'viewer')).toBe(false);
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(null, 'superadmin')).toBe(false);
    });

    it('viewer can access viewer-level resources', () => {
      const session = createSession('viewer');
      expect(hasRole(session, 'viewer')).toBe(true);
    });

    it('viewer cannot access admin-level resources', () => {
      const session = createSession('viewer');
      expect(hasRole(session, 'admin')).toBe(false);
      expect(hasRole(session, 'superadmin')).toBe(false);
    });

    it('admin can access admin and viewer resources', () => {
      const session = createSession('admin');
      expect(hasRole(session, 'viewer')).toBe(true);
      expect(hasRole(session, 'admin')).toBe(true);
    });

    it('admin cannot access superadmin resources', () => {
      const session = createSession('admin');
      expect(hasRole(session, 'superadmin')).toBe(false);
    });

    it('superadmin can access all resources', () => {
      const session = createSession('superadmin');
      expect(hasRole(session, 'viewer')).toBe(true);
      expect(hasRole(session, 'admin')).toBe(true);
      expect(hasRole(session, 'superadmin')).toBe(true);
    });

    it('handles unknown roles gracefully', () => {
      const session = createSession('unknown');
      expect(hasRole(session, 'viewer')).toBe(false);
    });
  });

  describe('isSuperadmin', () => {
    it('returns false for null session', () => {
      expect(isSuperadmin(null)).toBe(false);
    });

    it('returns false for viewer role', () => {
      expect(isSuperadmin({ token: 't', username: 'u', role: 'viewer' })).toBe(false);
    });

    it('returns false for admin role', () => {
      expect(isSuperadmin({ token: 't', username: 'u', role: 'admin' })).toBe(false);
    });

    it('returns true for superadmin role', () => {
      expect(isSuperadmin({ token: 't', username: 'u', role: 'superadmin' })).toBe(true);
    });
  });
});
