import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { SelfUser } from '@suraksha/shared';

interface AuthContextValue {
  user: SelfUser | null;
  loading: boolean;
  refresh: () => Promise<SelfUser | null>;
  setUser: (u: SelfUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => null,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SelfUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async (): Promise<SelfUser | null> => {
    try {
      const res = await api<{ user: SelfUser }>('/auth/me');
      setUser(res.user);
      return res.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return <AuthContext.Provider value={{ user, loading, refresh, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Roles that moderate or administer the platform. */
export const isAdminRole = (role?: string) => role === 'moderator' || role === 'administrator' || role === 'super_admin';
/** Any role with console access — including content editors and lab managers. */
export const isStaffRole = (role?: string) => role !== undefined && role !== null && role !== '' && role !== 'learner';
export const isEditorRole = (role?: string) =>
  isAdminRole(role) || role === 'content_editor';
export const isLabManagerRole = (role?: string) =>
  isAdminRole(role) || role === 'lab_manager';

/** Mirrors REPORT_MANAGE_ROLES on the server, which is the actual enforcement point. */
export const isReportManagerRole = (role?: string) => role === 'administrator' || role === 'super_admin';

/** Where a signed-in user should land by default — staff go straight to the console. */
export function homeForRole(role?: string): string {
  return isStaffRole(role) ? '/admin' : '/dashboard';
}
