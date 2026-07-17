'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';
import type { User } from '@/lib/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return null;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
      return data as User;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user as User;
  };

  const logout = async () => {
    const rt = getRefreshToken();
    if (rt) {
      try { await authApi.logout(rt); } catch { /* ignore */ }
    }
    clearTokens();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout, fetchMe };
}
