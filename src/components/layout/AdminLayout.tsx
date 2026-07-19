'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { healthApi } from '@/lib/api';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview and analytics' },
  '/users': { title: 'User Management', subtitle: 'Manage all platform users' },
  '/importers': { title: 'Importers', subtitle: 'Importer company profiles' },
  '/distributors': { title: 'Distributors', subtitle: 'Distributor company profiles' },
  '/manufacturers': { title: 'Manufacturers', subtitle: 'Manufacturer company profiles' },
  '/institutions': { title: 'Institutions', subtitle: 'Pharmacies, hospitals and clinics' },
  '/community': { title: 'Community', subtitle: 'Professional verifications' },
  '/organics': { title: 'Organics & Supplements', subtitle: 'Organics & supplements company profiles' },
  '/settings': { title: 'Settings', subtitle: 'Account and preferences' },
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [apiOnline, setApiOnline] = useState(true);

  const hasNoToken = typeof window !== 'undefined' && !localStorage.getItem('dawa_access_token');

  // Auth guard
  useEffect(() => {
    if (hasNoToken) {
      router.replace('/login');
      return;
    }
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [loading, user, router, hasNoToken]);

  // Health check every 30s
  useEffect(() => {
    const check = async () => {
      try {
        await healthApi.check();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const meta = PAGE_META[pathname] ?? { title: 'Smart Health Admin', subtitle: '' };

  if (hasNoToken) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary, #080d1a)',
        color: 'var(--text-primary, #f1f5f9)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.15)',
            borderTopColor: 'var(--accent-primary, #6366f1)',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ fontSize: 14, color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>Checking session...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="admin-layout">
      <Sidebar user={user} />
      <div className="admin-main">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          user={user}
          onLogout={logout}
          apiOnline={apiOnline}
        />
        <main className="admin-content animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
