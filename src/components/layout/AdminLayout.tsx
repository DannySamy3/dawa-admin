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
  '/settings': { title: 'Settings', subtitle: 'Account and preferences' },
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [apiOnline, setApiOnline] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [loading, user, router]);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

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
