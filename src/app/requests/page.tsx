'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Search, FileText, RefreshCw, CheckCircle, XCircle, AlertCircle, Package, Truck, Factory, Building2, Leaf, Inbox } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Badge, verifyBadge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import type { PendingRequest } from '@/lib/types';

export default function RequestsPage() {
  const [items, setItems] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PendingRequest | null>(null);
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
      const { data } = await adminApi.getPendingRequests();
      const list: PendingRequest[] = data.data ?? [];
      
      // Client-side pagination since endpoint returns all
      setTotal(list.length);
      setTotalPages(Math.ceil(list.length / LIMIT) || 1);
      setItems(list);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(userId + status);
    try {
      await adminApi.verifyBusinessUser(userId, status);
      showToast(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`, 'success');
      setSelected(null);
      load();
    } catch { showToast('Action failed. Please try again.', 'error'); }
    finally { setActionLoading(null); }
  };

  const filtered = items.filter((i) => {
    return search === '' ||
      i.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      i.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.requestType?.toLowerCase().includes(search.toLowerCase());
  });

  // Apply pagination
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

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
        <FileText size={14} color="var(--accent-primary)"/> {label}
      </a>
    );
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'IMPORTER': return { icon: Package, color: '#6366f1', label: 'Importer' };
      case 'DISTRIBUTOR': return { icon: Truck, color: '#06b6d4', label: 'Distributor' };
      case 'MANUFACTURER': return { icon: Factory, color: '#f59e0b', label: 'Manufacturer' };
      case 'INSTITUTION': return { icon: Building2, color: '#f43f5e', label: 'Institution' };
      case 'ORGANICSSUPPLEMENT': return { icon: Leaf, color: '#10b981', label: 'Organics' };
      default: return { icon: Package, color: '#94a3b8', label: type };
    }
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
          <div className="page-title">Pending Requests</div>
          <div className="page-subtitle">Review incoming registrations from all business types</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: 1, maxWidth: 350 }}>
          <Search size={16} />
          <input type="text" className="search-input" placeholder="Search by name, email, or type…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Request Details</th>
              <th>Type</th>
              <th>Account Email</th>
              <th>Submitted</th>
              <th>Actions</th>
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
                  <td><div className="skeleton" style={{ width: 85, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 150, height: 14 }} /></td>
                  <td><div className="skeleton" style={{ width: 100, height: 14 }} /></td>
                  <td>
                    <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><Inbox size={36}/><p>No pending requests found</p></div></td></tr>
            ) : paginated.map((req) => {
              const cfg = getTypeConfig(req.requestType);
              const Icon = cfg.icon;
              return (
                <tr key={req.id}>
                  <td>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:34,height:34,borderRadius:8,background:`${cfg.color}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                        <Icon size={16} color={cfg.color} />
                      </div>
                      <span className="table-name">{req.displayName}</span>
                    </div>
                  </td>
                  <td><Badge variant="secondary" style={{ color: cfg.color, background: `${cfg.color}15` }}>{cfg.label}</Badge></td>
                  <td><span className="table-email">{req.user?.email ?? '—'}</span></td>
                  <td style={{ fontSize:12,color:'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setSelected(req)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />}
      </div>

      <Modal title={`Review ${getTypeConfig(selected?.requestType || '').label} Registration`} open={!!selected} onClose={() => setSelected(null)}
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            {selected && (
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
        {selected && (() => {
          const cfg = getTypeConfig(selected.requestType);
          const Icon = cfg.icon;
          return (
            <div style={{ display:'flex',flexDirection:'column',gap:18 }}>
              <div style={{ display:'flex',alignItems:'center',gap:14, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width:52,height:52,borderRadius:12,background:`${cfg.color}22`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Icon size={24} color={cfg.color}/>
                </div>
                <div>
                  <div style={{ fontSize:18,fontWeight:700,color:'var(--text-primary)' }}>{selected.displayName}</div>
                  <div style={{ fontSize:13,color:'var(--text-muted)' }}>{selected.user?.email}</div>
                  <div style={{ marginTop: 4 }}>
                    <Badge variant="secondary" style={{ color: cfg.color, background: `${cfg.color}15` }}>{cfg.label}</Badge>
                    <span style={{ marginLeft: 6 }}>{verifyBadge(selected.status || 'PENDING')}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-row"><div className="detail-label">City / Country</div><div className="detail-value">{selected.city ?? '—'} / {selected.country ?? '—'}</div></div>
                <div className="detail-row"><div className="detail-label">TIN Number</div><div className="detail-value">{selected.tinNumber ?? '—'}</div></div>
                {selected.warehouseLocation && <div className="detail-row"><div className="detail-label">Warehouse</div><div className="detail-value">{selected.warehouseLocation}</div></div>}
                {selected.supplyArea && <div className="detail-row"><div className="detail-label">Supply Area</div><div className="detail-value">{selected.supplyArea}</div></div>}
                {selected.locationPremises && <div className="detail-row"><div className="detail-label">Location Premises</div><div className="detail-value">{selected.locationPremises}</div></div>}
                {selected.registrationFields?.registrationNumber && <div className="detail-row"><div className="detail-label">Reg. Number</div><div className="detail-value">{selected.registrationFields.registrationNumber}</div></div>}
                {selected.registrationFields?.licenseNumber && <div className="detail-row"><div className="detail-label">License Number</div><div className="detail-value">{selected.registrationFields.licenseNumber}</div></div>}
                <div className="detail-row"><div className="detail-label">Submitted</div><div className="detail-value">{new Date(selected.createdAt).toLocaleString()}</div></div>
              </div>
              
              <div style={{ fontWeight:600,color:'var(--text-primary)',fontSize:14, marginTop: 8 }}>Required Documentation</div>
              <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:10 }}>
                {selected.registrationDocs && selected.registrationDocs.length > 0 && selected.registrationDocs.map((doc, i) => (
                  renderDocumentLink(`Registration Doc ${i + 1}`, doc)
                ))}
                {renderDocumentLink('tFDA Document', selected.tFDA_Document)}
                {renderDocumentLink('Pharmacy Council', selected.pharmacyCouncilLicense)}
                {renderDocumentLink('BRELA', selected.brela)}
                {renderDocumentLink('Incorporation Cert', selected.incorporationCertificate)}
                {renderDocumentLink('Premises Registration', selected.premisesRegistration)}
                {renderDocumentLink('Business Licence', selected.businessLicence)}
                {renderDocumentLink('Pharmacist Cert', selected.pharmacistCertificate)}
                {renderDocumentLink('Director ID', selected.directorId)}
                {renderDocumentLink('Bank Statement', selected.bankStatement)}
                {renderDocumentLink('Building Picture', selected.buildingPicture)}
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}
