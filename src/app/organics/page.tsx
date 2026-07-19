'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Search, FileText, RefreshCw, Leaf, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { verifyBadge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import type { OrganicsSupplementProfile } from '@/lib/types';

type Tab = 'all' | 'pending' | 'approved' | 'rejected';

export default function OrganicsPage() {
  const [items, setItems] = useState<OrganicsSupplementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OrganicsSupplementProfile | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const LIMIT = 50;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getOrganics(page, LIMIT);
      const list: OrganicsSupplementProfile[] = data.data ?? data.profiles ?? data ?? [];
      const pagination = data.pagination;
      setItems(list);
      setTotal(pagination?.total ?? list.length);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(userId + status);
    try {
      await adminApi.verifyBusinessUser(userId, status);
      showToast(`Profile ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`, 'success');
      setSelected(null);
      load();
    } catch { showToast('Action failed. Please try again.', 'error'); }
    finally { setActionLoading(null); }
  };

  const filtered = items.filter((i) => {
    const matchSearch = search === '' ||
      i.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      i.user?.email?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchSearch) return false;
    if (tab === 'all') return true;
    return i.status?.toLowerCase() === tab;
  });

  const renderDocumentLink = (label: string, url?: string | null) => {
    if (!url) {
      return (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding: '8px 12px', fontSize: 13, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
          <FileText size={14} color="var(--text-muted)"/> {label}: <span style={{ fontStyle: 'italic', fontSize: 12 }}>Not provided</span>
        </div>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ justifyContent:'flex-start', padding: '8px 12px', fontSize: 13, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <FileText size={14} color="var(--accent-warning)"/> {label}
      </a>
    );
  };

  return (
    <AdminLayout>
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

      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Organics & Supplements</div>
          <div className="page-subtitle">{total} organic & supplement companies registered</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={16} />
          <input type="text" className="search-input" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'pending', 'approved', 'rejected'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Account Email</th>
              <th>Certification Number</th>
              <th>Status</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
                      <div className="skeleton" style={{ width: 140, height: 14 }} />
                    </div>
                  </td>
                  <td><div className="skeleton" style={{ width: 150, height: 14 }} /></td>
                  <td><div className="skeleton" style={{ width: 120, height: 14 }} /></td>
                  <td><div className="skeleton" style={{ width: 85, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><Leaf size={36}/><p>No organic companies found</p></div></td></tr>
            ) : filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:34,height:34,borderRadius:8,background:'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <Leaf size={16} color="#10b981"/>
                    </div>
                    <span className="table-name">{item.companyName}</span>
                  </div>
                </td>
                <td><span className="table-email">{item.user?.email ?? '—'}</span></td>
                <td style={{ fontSize:12,color:'var(--text-muted)' }}>{item.certificationNumber ?? '—'}</td>
                <td>{verifyBadge(item.status || 'PENDING')}</td>
                <td>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setSelected(item)} title="View Details"><Eye size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />}
      </div>

      <Modal title="Organics & Supplements Profile" open={!!selected} onClose={() => setSelected(null)}
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            {selected?.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-danger"
                  onClick={() => selected.user && handleVerify(selected.user.id, 'REJECTED')}
                  disabled={actionLoading === selected.user?.id + 'REJECTED'}
                >
                  {actionLoading === selected.user?.id + 'REJECTED' ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} /> : <XCircle size={14}/>}
                  Reject
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => selected.user && handleVerify(selected.user.id, 'APPROVED')}
                  disabled={actionLoading === selected.user?.id + 'APPROVED'}
                >
                  {actionLoading === selected.user?.id + 'APPROVED' ? <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} /> : <CheckCircle size={14}/>}
                  Approve
                </button>
              </div>
            )}
          </div>
        }
      >
        {selected && (
          <div style={{ display:'flex',flexDirection:'column',gap:18 }}>
            <div style={{ display:'flex',alignItems:'center',gap:14, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width:52,height:52,borderRadius:12,background:'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Leaf size={24} color="#10b981"/>
              </div>
              <div>
                <div style={{ fontSize:18,fontWeight:700,color:'var(--text-primary)' }}>{selected.companyName}</div>
                <div style={{ fontSize:13,color:'var(--text-muted)' }}>{selected.user?.email}</div>
                <div style={{ marginTop: 4 }}>{verifyBadge(selected.status || 'PENDING')}</div>
              </div>
            </div>
            
            <div className="detail-grid">
              <div className="detail-row"><div className="detail-label">Certification No.</div><div className="detail-value">{selected.certificationNumber ?? '—'}</div></div>
              <div className="detail-row"><div className="detail-label">Certification Body</div><div className="detail-value">{selected.certificationBody ?? '—'}</div></div>
              <div className="detail-row"><div className="detail-label">City / Country</div><div className="detail-value">{selected.city ?? '—'} / {selected.country ?? '—'}</div></div>
              <div className="detail-row"><div className="detail-label">Physical Address</div><div className="detail-value">{selected.physicalAddress ?? '—'}</div></div>
              <div className="detail-row"><div className="detail-label">Created Date</div><div className="detail-value">{new Date(selected.createdAt).toLocaleDateString()}</div></div>
            </div>
            
            <div style={{ fontWeight:600,color:'var(--text-primary)',fontSize:14, marginTop: 8 }}>Required Documentation</div>
            <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:10 }}>
              {renderDocumentLink('Incorporation Certificate', selected.incorporationCertificate)}
              {renderDocumentLink('Bank Statement', selected.bankStatement)}
              {renderDocumentLink('Pharmacist Certificate', selected.pharmacistCertificate)}
              {renderDocumentLink('Pharmacy Council License', selected.pharmacyCouncilLicense)}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
