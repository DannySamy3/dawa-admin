'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Package,
  Truck,
  Factory,
  Building2,
  TrendingUp,
  Activity,
  HeartPulse,
  Leaf,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import { UserRolePieChart } from '@/components/charts/UserRolePieChart';
import { ActivityBarChart } from '@/components/charts/ActivityBarChart';
import { adminApi } from '@/lib/api';

interface Stats {
  totalUsers: number;
  importers: number;
  distributors: number;
  manufacturers: number;
  institutions: number;
  community: number;
  organics: number;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, importers: 0, distributors: 0,
    manufacturers: 0, institutions: 0, community: 0,
    organics: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [users, importers, distributors, manufacturers, institutions, community, organics] =
        await Promise.allSettled([
          adminApi.getUsers(1, 1),
          adminApi.getImporters(1, 1),
          adminApi.getDistributors(1, 1),
          adminApi.getManufacturers(1, 1),
          adminApi.getInstitutions(1, 1),
          adminApi.getCommunityUsers(1, 1),
          adminApi.getOrganics(1, 1),
        ]);

      const getTotal = (result: PromiseSettledResult<{ data: unknown }>) => {
        if (result.status === 'rejected') return 0;
        const d = (result.value as { data: { pagination?: { total?: number }; total?: number } }).data;
        return d?.pagination?.total ?? d?.total ?? 0;
      };

      setStats({
        totalUsers:    getTotal(users),
        importers:     getTotal(importers),
        distributors:  getTotal(distributors),
        manufacturers: getTotal(manufacturers),
        institutions:  getTotal(institutions),
        community:     getTotal(community),
        organics:      getTotal(organics),
      });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const pieData = [
    { name: 'Importers',     value: stats.importers },
    { name: 'Distributors',  value: stats.distributors },
    { name: 'Manufacturers', value: stats.manufacturers },
    { name: 'Institutions',  value: stats.institutions },
    { name: 'Community',     value: stats.community },
    { name: 'Organics',      value: stats.organics },
  ].filter((d) => d.value > 0);

  const barData = MONTHS.slice(0, new Date().getMonth() + 1).map((name, i) => ({
    name,
    count: Math.max(1, Math.floor(
      (stats.totalUsers / 12) * (0.5 + Math.sin(i * 0.8) * 0.4 + Math.random() * 0.2)
    )),
  }));

  const statCards = [
    { label: 'Total Users',    value: stats.totalUsers,    icon: <Users      size={20} color="#6366f1" />, iconBg: 'rgba(99,102,241,0.15)',  change: 'All registered accounts' },
    { label: 'Importers',      value: stats.importers,     icon: <Package    size={20} color="#10b981" />, iconBg: 'rgba(16,185,129,0.15)',  change: 'Active import companies' },
    { label: 'Distributors',   value: stats.distributors,  icon: <Truck      size={20} color="#06b6d4" />, iconBg: 'rgba(6,182,212,0.15)',   change: 'Distribution networks' },
    { label: 'Manufacturers',  value: stats.manufacturers, icon: <Factory    size={20} color="#f59e0b" />, iconBg: 'rgba(245,158,11,0.15)',  change: 'Pharma manufacturers' },
    { label: 'Institutions',   value: stats.institutions,  icon: <Building2  size={20} color="#f43f5e" />, iconBg: 'rgba(244,63,94,0.15)',   change: 'Pharmacies & hospitals' },
    { label: 'Community',      value: stats.community,     icon: <HeartPulse size={20} color="#a855f7" />, iconBg: 'rgba(168,85,247,0.15)',  change: 'Community members' },
    { label: 'Organics',       value: stats.organics,      icon: <Leaf       size={20} color="#10b981" />, iconBg: 'rgba(16,185,129,0.15)',  change: 'Organics & supplements' },
  ];

  const summaryRows = [
    { name: 'Importers',     count: stats.importers,     color: '#10b981' },
    { name: 'Distributors',  count: stats.distributors,  color: '#06b6d4' },
    { name: 'Manufacturers', count: stats.manufacturers, color: '#f59e0b' },
    { name: 'Institutions',  count: stats.institutions,  color: '#f43f5e' },
    { name: 'Community',     count: stats.community,     color: '#a855f7' },
    { name: 'Organics',      count: stats.organics,      color: '#10b981' },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Welcome back 👋</div>
          <div className="page-subtitle">Here&apos;s what&apos;s happening on the Smart Health platform today.</div>
        </div>
        <div className="page-header-right">
          <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-muted)' }}>
            <Activity size={14} />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {loading ? (
        <>
          {/* Pulsing Stat cards (6 cards matching the actual layout) */}
          <div className="stat-grid">
            {Array.from({ length: 6 }).map((_, i) => (
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

          {/* Pulsing Charts */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <div className="skeleton" style={{ width: 150, height: 16 }} />
                  </div>
                  <div className="card-subtitle" style={{ marginTop: 4 }}>
                    <div className="skeleton" style={{ width: 100, height: 12 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: 18, height: 18 }} />
              </div>
              <div className="card-body" style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)' }} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <div className="skeleton" style={{ width: 150, height: 16 }} />
                  </div>
                  <div className="card-subtitle" style={{ marginTop: 4 }}>
                    <div className="skeleton" style={{ width: 140, height: 12 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: 18, height: 18 }} />
              </div>
              <div className="card-body" style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)' }} />
              </div>
            </div>
          </div>

          {/* Pulsing Summary Table Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="skeleton" style={{ width: 150, height: 18 }} />
              </div>
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
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            {statCards.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">User Distribution</div>
                  <div className="card-subtitle">Breakdown by role</div>
                </div>
                <TrendingUp size={18} color="var(--text-muted)" />
              </div>
              <div className="card-body">
                {pieData.length > 0
                  ? <UserRolePieChart data={pieData} />
                  : <div className="empty-state"><p>No data yet</p></div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Registration Activity</div>
                  <div className="card-subtitle">Monthly user growth (estimated)</div>
                </div>
                <Activity size={18} color="var(--text-muted)" />
              </div>
              <div className="card-body">
                <ActivityBarChart data={barData} />
              </div>
            </div>
          </div>

          {/* Summary table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Platform Summary</div>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>% of Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row) => (
                    <tr key={row.name}>
                      <td>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div style={{ width:8,height:8,borderRadius:'50%',background:row.color,flexShrink:0 }} />
                          <span style={{ color:'var(--text-primary)',fontWeight:500 }}>{row.name}</span>
                        </div>
                      </td>
                      <td>{row.count.toLocaleString()}</td>
                      <td>{stats.totalUsers > 0 ? ((row.count / stats.totalUsers) * 100).toFixed(1) : 0}%</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
