'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, DollarSign, RefreshCw,
  HeartPulse, AlertCircle, Users, Stethoscope, User,
  Eye, Power, UserCheck, UserX
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/ui/Modal';
import { verifyBadge, roleBadge, statusBadge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import type { Professional } from '@/lib/types';

/* ── Types ─────────────────────────────────────────────────────────── */
interface CommunityUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  communityProfile?: {
    id: string;
    isProfessional: boolean;
    professionalType?: string;
    category?: string;
    status?: string;
    isVerified?: boolean;
    monthlyFeePaid?: boolean;
    licenseNumber?: string;
  } | null;
}

type Tab = 'all' | 'professional' | 'non-professional' | 'pending';

/* ── Component ──────────────────────────────────────────────────────── */
export default function CommunityPage() {
  const [allUsers, setAllUsers]             = useState<CommunityUser[]>([]);
  const [professionals, setProfessionals]   = useState<Professional[]>([]);
  const [loading, setLoading]               = useState(true);
  const [tab, setTab]                       = useState<Tab>('all');
  const [selected, setSelected]             = useState<Professional | null>(null);
  const [rejectReason, setRejectReason]     = useState('');
  const [actionLoading, setActionLoading]   = useState<string | null>(null);
  const [toast, setToast]                   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectedUser, setSelectedUser]     = useState<CommunityUser | null>(null);
  const [toggling, setToggling]             = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, profRes] = await Promise.allSettled([
        adminApi.getCommunityUsers(1, 200),
        adminApi.getPendingProfessionals(),
      ]);

      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value.data;
        setAllUsers(d?.data ?? d?.users ?? d ?? []);
      }
      if (profRes.status === 'fulfilled') {
        const d = profRes.value.data;
        setProfessionals(d?.data ?? d?.professionals ?? d ?? []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Actions ──────────────────────────────────────────────────────── */
  const handleVerify = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id + action);
    try {
      await adminApi.verifyProfessional(id, action, action === 'REJECTED' ? rejectReason : undefined);
      showToast(`Professional ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully`, 'success');
      setSelected(null);
      setRejectReason('');
      load();
    } catch { showToast('Action failed. Please try again.', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleToggleFee = async (id: string) => {
    setActionLoading(id + 'fee');
    try {
      await adminApi.toggleFeeStatus(id);
      showToast('Fee status updated', 'success');
      load();
    } catch { showToast('Action failed.', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleToggle = async (userId: string) => {
    setToggling(userId);
    try {
      const { data } = await adminApi.toggleUserStatus(userId);
      setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: data.isActive } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, isActive: data.isActive } : null);
      }
      showToast('User status updated successfully', 'success');
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setToggling(null);
    }
  };

  /* ── Derived lists ────────────────────────────────────────────────── */
  const proUsers     = allUsers.filter((u) => u.communityProfile?.isProfessional === true);
  const nonProUsers  = allUsers.filter((u) => !u.communityProfile?.isProfessional);
  const pending      = professionals.filter((p) => p.status === 'PENDING');

  const stats = [
    { label: 'Total Community', value: allUsers.length,   color: 'var(--accent-primary)' },
    { label: 'Professionals',   value: proUsers.length,   color: 'var(--accent-success)' },
    { label: 'Non-Professional',value: nonProUsers.length,color: 'var(--accent-info, #06b6d4)' },
    { label: 'Pending Review',  value: pending.length,    color: 'var(--accent-warning)' },
  ];

  /* ── Tabs config ──────────────────────────────────────────────────── */
  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all',              label: 'All Members',     icon: <Users        size={14} />, count: allUsers.length },
    { key: 'professional',     label: 'Professionals',   icon: <Stethoscope  size={14} />, count: proUsers.length },
    { key: 'non-professional', label: 'Non-Professional',icon: <User         size={14} />, count: nonProUsers.length },
    { key: 'pending',          label: 'Pending Review',  icon: <HeartPulse  size={14} />, count: pending.length },
  ];

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',bottom:24,right:24,zIndex:2000,
          background: toast.type === 'success' ? 'var(--accent-success-light)' : 'var(--accent-danger-light)',
          border:`1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          borderRadius:'var(--radius-sm)',padding:'12px 18px',display:'flex',alignItems:'center',
          gap:10,fontSize:13,color: toast.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
          animation:'slideUp 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Community Management</div>
          <div className="page-subtitle">Manage community members — professionals and general users</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom:28 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.color, fontSize:28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex',gap:6,marginBottom:20,borderBottom:'1px solid var(--border-subtle)',paddingBottom:0 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display:'flex',alignItems:'center',gap:6,padding:'8px 16px',
              fontSize:13,fontWeight:500,border:'none',cursor:'pointer',
              borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              background:'transparent',borderRadius:0,transition:'all 0.15s',
            }}
          >
            {t.icon}
            {t.label}
            <span style={{
              background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
              color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderRadius:9,padding:'1px 7px',fontSize:11,fontWeight:600,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: All Members */}
      {tab === 'all' && (
        <CommunityTable users={allUsers} loading={loading} showProfessionalType onView={setSelectedUser} />
      )}

      {/* Tab: Professionals */}
      {tab === 'professional' && (
        <div>
          <CommunityTable users={proUsers} loading={loading} showProfessionalType onView={setSelectedUser} />

          {/* Professional fee management */}
          {proUsers.length > 0 && (
            <div className="card" style={{ marginTop:20 }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Professional Verification & Fees</div>
                  <div className="card-subtitle">Manage verified professionals</div>
                </div>
                <HeartPulse size={18} color="var(--accent-success)" />
              </div>
              <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Fee Paid</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.filter((p) => p.status === 'APPROVED' || p.status === 'VERIFIED').map((prof) => (
                      <tr key={prof.id}>
                        <td>
                          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                            <div className="sidebar-avatar" style={{ width:32,height:32,fontSize:12 }}>{prof.name?.[0] ?? '?'}</div>
                            <div>
                              <div className="table-name">{prof.name}</div>
                              <div className="table-email">{prof.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:13 }}>{prof.specialty ?? '—'}</td>
                        <td>{verifyBadge(prof.status)}</td>
                        <td>
                          <span className={`badge ${prof.feesPaid ? 'badge-success' : 'badge-warning'}`}>
                            <DollarSign size={10}/>
                            {prof.feesPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleFee(prof.id)}
                            disabled={actionLoading === prof.id + 'fee'}
                          >
                            {actionLoading === prof.id + 'fee'
                              ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
                              : <DollarSign size={13}/>}
                            Toggle Fee
                          </button>
                        </td>
                      </tr>
                    ))}
                    {professionals.filter((p) => p.status === 'APPROVED' || p.status === 'VERIFIED').length === 0 && (
                      <tr><td colSpan={5}><div className="empty-state"><p>No verified professionals yet</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Non-Professional */}
      {tab === 'non-professional' && (
        <CommunityTable users={nonProUsers} loading={loading} showProfessionalType={false} onView={setSelectedUser} />
      )}

      {/* Tab: Pending Review */}
      {tab === 'pending' && (
        <div className="card">
          <div className="card-header" style={{ paddingBottom:16 }}>
            <div>
              <div className="card-title">Pending Applications</div>
              <div className="card-subtitle">{pending.length} awaiting review</div>
            </div>
            <HeartPulse size={18} color="var(--accent-warning)"/>
          </div>
          <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Professional</th>
                  <th>Specialty</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          <div className="skeleton" style={{ width: 100, height: 14 }} />
                        </div>
                      </td>
                      <td><div className="skeleton" style={{ width: 120, height: 14 }} /></td>
                      <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                      <td><div className="skeleton" style={{ width: 75, height: 18, borderRadius: 10 }} /></td>
                      <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div className="skeleton" style={{ width: 75, height: 28, borderRadius: 'var(--radius-sm)' }} />
                          <div className="skeleton" style={{ width: 70, height: 28, borderRadius: 'var(--radius-sm)' }} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : pending.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><CheckCircle size={32} color="var(--accent-success)"/><p>No pending applications 🎉</p></div></td></tr>
                ) : pending.map((prof) => (
                  <tr key={prof.id}>
                    <td>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div className="sidebar-avatar" style={{ width:32,height:32,fontSize:12 }}>{prof.name?.[0] ?? '?'}</div>
                        <span className="table-name">{prof.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize:13 }}>{prof.specialty ?? '—'}</td>
                    <td style={{ fontSize:12,color:'var(--text-muted)',fontFamily:'monospace' }}>{prof.licenseNumber ?? '—'}</td>
                    <td>{verifyBadge(prof.status)}</td>
                    <td style={{ fontSize:12,color:'var(--text-muted)' }}>{new Date(prof.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex',gap:6 }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleVerify(prof.id, 'APPROVED')}
                          disabled={actionLoading === prof.id + 'APPROVED'}
                        >
                          {actionLoading === prof.id + 'APPROVED'
                            ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
                            : <CheckCircle size={13}/>}
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => { setSelected(prof); setRejectReason(''); }}
                        >
                          <XCircle size={13}/> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        open={!!selected}
        onClose={() => { setSelected(null); setRejectReason(''); }}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setSelected(null); setRejectReason(''); }}>Cancel</button>
            <button
              className="btn btn-danger"
              onClick={() => selected && handleVerify(selected.id, 'REJECTED')}
              disabled={actionLoading === selected?.id + 'REJECTED'}
            >
              {actionLoading === selected?.id + 'REJECTED'
                ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
                : <XCircle size={14}/>}
              Confirm Rejection
            </button>
          </>
        }
      >
        {selected && (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <p style={{ fontSize:14,color:'var(--text-secondary)' }}>
              You are about to reject the application from{' '}
              <strong style={{ color:'var(--text-primary)' }}>{selected.name}</strong>.
              Please provide a reason:
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. License number could not be verified…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize:'vertical' }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal title="Community Member Details" open={!!selectedUser} onClose={() => setSelectedUser(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            {selectedUser && (
              <button
                className={`btn ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggle(selectedUser.id)}
                disabled={toggling === selectedUser.id}
              >
                {toggling === selectedUser.id ? (
                  <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
                ) : selectedUser.isActive ? (
                  <><UserX size={14}/> Deactivate</>
                ) : (
                  <><UserCheck size={14}/> Activate</>
                )}
              </button>
            )}
          </>
        }
      >
        {selectedUser && (
          <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
              <div className="user-avatar-lg">{selectedUser.name?.[0]?.toUpperCase() ?? '?'}</div>
              <div>
                <div style={{ fontSize:18,fontWeight:700,color:'var(--text-primary)' }}>{selectedUser.name}</div>
                <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:2 }}>{selectedUser.email}</div>
                <div style={{ marginTop:6,display:'flex',gap:8,flexWrap:'wrap' }}>
                  {roleBadge(selectedUser.role)}
                  {statusBadge(selectedUser.isActive)}
                  <span className={`badge ${selectedUser.communityProfile?.isProfessional ? 'badge-success' : 'badge-secondary'}`}>
                    {selectedUser.communityProfile?.isProfessional ? 'Professional' : 'General Member'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">User ID</div>
                <div className="detail-value" style={{ fontSize:12,fontFamily:'monospace',wordBreak:'break-all' }}>{selectedUser.id}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Account Role</div>
                <div className="detail-value">{selectedUser.role}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Member Since</div>
                <div className="detail-value">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year:'numeric',month:'long',day:'numeric' })}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">{new Date(selectedUser.updatedAt).toLocaleDateString()}</div>
              </div>

              {selectedUser.communityProfile?.isProfessional && (
                <>
                  <div className="detail-row">
                    <div className="detail-label">Specialty</div>
                    <div className="detail-value">{selectedUser.communityProfile.professionalType ?? '—'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">License Number</div>
                    <div className="detail-value" style={{ fontFamily:'monospace' }}>{selectedUser.communityProfile.licenseNumber ?? '—'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Verification Status</div>
                    <div className="detail-value">
                      {verifyBadge(selectedUser.communityProfile.status ?? 'PENDING')}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Membership Fee</div>
                    <div className="detail-value">
                      <span className={`badge ${selectedUser.communityProfile.monthlyFeePaid ? 'badge-success' : 'badge-warning'}`}>
                        {selectedUser.communityProfile.monthlyFeePaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

/* ── Shared table sub-component ─────────────────────────────────────── */
function CommunityTable({
  users, loading, showProfessionalType, onView,
}: {
  users: CommunityUser[];
  loading: boolean;
  showProfessionalType: boolean;
  onView: (u: CommunityUser) => void;
}) {
  return (
    <div className="card">
      <div className="card-header" style={{ paddingBottom:16 }}>
        <div>
          <div className="card-title">Members</div>
          <div className="card-subtitle">{users.length} total</div>
        </div>
      </div>
      <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {showProfessionalType && <th>Type</th>}
              <th>Professional</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div className="skeleton" style={{ width: 100, height: 14 }} />
                    </div>
                  </td>
                  <td><div className="skeleton" style={{ width: 150, height: 14 }} /></td>
                  {showProfessionalType && <td><div className="skeleton" style={{ width: 75, height: 18, borderRadius: 10 }} /></td>}
                  <td><div className="skeleton" style={{ width: 95, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                  <td><div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={showProfessionalType ? 7 : 6}>
                  <div className="empty-state">
                    <Users size={36}/>
                    <p>No users in this category</p>
                  </div>
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div className="sidebar-avatar" style={{ width:32,height:32,fontSize:12 }}>{u.name?.[0] ?? '?'}</div>
                    <span className="table-name">{u.name}</span>
                  </div>
                </td>
                <td className="table-email">{u.email}</td>
                {showProfessionalType && (
                  <td style={{ fontSize:13 }}>
                    {u.communityProfile?.professionalType ?? '—'}
                  </td>
                )}
                <td>
                  <span className={`badge ${u.communityProfile?.isProfessional ? 'badge-success' : 'badge-secondary'}`}>
                    {u.communityProfile?.isProfessional
                      ? <><Stethoscope size={10}/> Professional</>
                      : <><User size={10}/> General</>}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ fontSize:12,color:'var(--text-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => onView(u)} title="View Details">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
