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

  const renderBodySkeleton = () => {
    switch (pathname) {
      case '/dashboard':
        return (
          <>
            {/* Stat Cards */}
            <div className="stat-grid">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-header">
                    <div className="stat-card-label" style={{ display: 'block', width: '60%' }}>
                      <div className="skeleton" style={{ width: '100%', height: 12 }} />
                    </div>
                    <div className="stat-card-icon">
                      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  </div>
                  <div className="stat-card-value">
                    <div className="skeleton" style={{ width: 70, height: 32 }} />
                  </div>
                  <div className="stat-card-change">
                    <div className="skeleton" style={{ width: 130, height: 11 }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="charts-grid" style={{ marginTop: 24 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="card-header">
                    <div>
                      <div className="skeleton" style={{ width: 150, height: 16 }} />
                      <div className="skeleton" style={{ width: 100, height: 12, marginTop: 4 }} />
                    </div>
                    <div className="skeleton" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="card-body" style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Summary Table */}
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <div className="skeleton" style={{ width: 150, height: 18 }} />
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th><div className="skeleton" style={{ width: 100, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 60, height: 14 }} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                            <div className="skeleton" style={{ width: 120, height: 14 }} />
                          </div>
                        </td>
                        <td><div className="skeleton" style={{ width: 60, height: 14 }} /></td>
                        <td><div className="skeleton" style={{ width: 50, height: 14 }} /></td>
                        <td><div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10 }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case '/posts':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                minHeight: 280
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 2 }} />
                  <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ width: '60%', height: 14 }} />
                    <div className="skeleton" style={{ width: '30%', height: 10 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                    <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ width: '100%', height: 14 }} />
                  <div className="skeleton" style={{ width: '100%', height: 14 }} />
                  <div className="skeleton" style={{ width: '40%', height: 14 }} />
                </div>
                <div className="skeleton" style={{ width: '100%', height: 140, borderRadius: 'var(--radius-sm)', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        );

      case '/settings':
        return (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="skeleton" style={{ width: 18, height: 18 }} />
                <div className="skeleton" style={{ width: 120, height: 16 }} />
              </div>
              <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ width: 150, height: 20 }} />
                  <div className="skeleton" style={{ width: 180, height: 14 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10 }} />
                    <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10 }} />
                  </div>
                </div>
              </div>
              <div className="detail-grid">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="detail-row">
                    <div className="skeleton" style={{ width: 100, height: 14 }} />
                    <div className="skeleton" style={{ width: 180, height: 14 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case '/community':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card">
              <div className="card-header">
                <div className="skeleton" style={{ width: 180, height: 18 }} />
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th><div className="skeleton" style={{ width: 100, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                      <th><div className="skeleton" style={{ width: 60, height: 14 }} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            <div className="skeleton" style={{ width: 100, height: 14 }} />
                          </div>
                        </td>
                        <td><div className="skeleton" style={{ width: 120, height: 14 }} /></td>
                        <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                        <td><div className="skeleton" style={{ width: 75, height: 18, borderRadius: 10 }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th><div className="skeleton" style={{ width: 100, height: 14 }} /></th>
                    <th><div className="skeleton" style={{ width: 120, height: 14 }} /></th>
                    <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                    <th><div className="skeleton" style={{ width: 80, height: 14 }} /></th>
                    <th><div className="skeleton" style={{ width: 60, height: 14 }} /></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          <div className="skeleton" style={{ width: 100, height: 14 }} />
                        </div>
                      </td>
                      <td><div className="skeleton" style={{ width: 150, height: 14 }} /></td>
                      <td><div className="skeleton" style={{ width: 100, height: 14 }} /></td>
                      <td><div className="skeleton" style={{ width: 80, height: 18, borderRadius: 10 }} /></td>
                      <td><div className="skeleton" style={{ width: 60, height: 28, borderRadius: 'var(--radius-sm)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar user={null} loading={true} />

        {/* Skeleton Main Panel */}
        <div className="admin-main">
          {/* Skeleton Header */}
          <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton" style={{ width: 150, height: 16 }} />
              <div className="skeleton" style={{ width: 220, height: 10 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 10 }} />
              <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--radius-sm)' }} />
            </div>
          </header>

          {/* Skeleton Body Content */}
          <main className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '40%' }}>
                <div className="skeleton" style={{ width: '60%', height: 24 }} />
                <div className="skeleton" style={{ width: '90%', height: 14 }} />
              </div>
              <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 'var(--radius-sm)' }} />
            </div>

            {renderBodySkeleton()}
          </main>
        </div>
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
