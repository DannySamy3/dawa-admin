'use client';

import { useState, useEffect } from 'react';
import { LogOut, User, Shield, Globe, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { roleBadge, statusBadge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const { user, logout, fetchMe } = useAuth();
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    await fetchMe();
    setRefreshing(false);
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Account information and preferences</div>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:900 }}>
        {/* Profile Card */}
        <div className="card" style={{ gridColumn:'1/-1' }}>
          <div className="card-header">
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <User size={18} color="var(--accent-primary)"/>
              <div className="card-title">Admin Profile</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleRefreshProfile} disabled={refreshing}>
              {refreshing ? <span className="spinner" style={{ width:12,height:12,borderWidth:2 }}/> : <RefreshCw size={13}/>}
              Refresh
            </button>
          </div>
          <div className="card-body">
            <div style={{ display:'flex',alignItems:'center',gap:20,marginBottom:24,paddingBottom:20,borderBottom:'1px solid var(--border)' }}>
              <div className="user-avatar-lg">{user?.name?.[0]?.toUpperCase() ?? 'A'}</div>
              <div>
                <div style={{ fontSize:20,fontWeight:700,color:'var(--text-primary)' }}>{user?.name ?? '—'}</div>
                <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:2 }}>{user?.email}</div>
                <div style={{ display:'flex',gap:8,marginTop:8 }}>
                  {user && roleBadge(user.role)}
                  {user && statusBadge(user.isActive)}
                </div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">User ID</div>
                <div className="detail-value" style={{ fontSize:11,fontFamily:'monospace',wordBreak:'break-all' }}>{user?.id ?? '—'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Role</div>
                <div className="detail-value">{user?.role ?? '—'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Member Since</div>
                <div className="detail-value">{user ? new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">{user ? new Date(user.updatedAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* API Config */}
        <div className="card">
          <div className="card-header">
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Globe size={18} color="var(--accent-info)"/>
              <div className="card-title">API Configuration</div>
            </div>
          </div>
          <div className="card-body" style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div className="detail-row">
              <div className="detail-label">Backend URL</div>
              <div className="detail-value" style={{ fontSize:12,fontFamily:'monospace',color:'var(--accent-info)' }}>{apiUrl}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Authentication</div>
              <div className="detail-value">JWT Bearer Token</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Token Storage</div>
              <div className="detail-value">localStorage</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Auto-Refresh</div>
              <div className="detail-value" style={{ color:'var(--accent-success)' }}>✓ Enabled (on 401)</div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Shield size={18} color="var(--accent-danger)"/>
              <div className="card-title">Security</div>
            </div>
          </div>
          <div className="card-body" style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div className="detail-row">
              <div className="detail-label">Access Token TTL</div>
              <div className="detail-value">30 days</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Refresh Token TTL</div>
              <div className="detail-value">7 days</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Rate Limit</div>
              <div className="detail-value">100 req / 15 min</div>
            </div>
            <div style={{ marginTop:8 }}>
              <button className="btn btn-danger" style={{ width:'100%',justifyContent:'center' }} onClick={logout}>
                <LogOut size={15}/> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
