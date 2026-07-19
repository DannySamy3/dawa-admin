'use client';

import { useState, useEffect } from 'react';
import { User, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { roleBadge, statusBadge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const { user, fetchMe } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    await fetchMe();
    setRefreshing(false);
  };

  return (
    <AdminLayout>

      <div style={{ maxWidth: 900 }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <User size={18} color="var(--accent-primary)"/>
              <div className="card-title">Admin Profile</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleRefreshProfile} disabled={refreshing}>
              {refreshing ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} /> : <RefreshCw size={13}/>}
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
      </div>
    </AdminLayout>
  );
}
