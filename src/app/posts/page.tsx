'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Trash2, CheckCircle, AlertCircle, MessageSquare, Heart, Image as ImageIcon, Grid, List, Eye, Users } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import type { Post } from '@/lib/types';

export default function PostsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Views & Selection
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals & Loadings
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const LIMIT = 20;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getPosts(page, LIMIT, selectedRole, sortBy);
      setItems(data.data ?? []);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, selectedRole, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedRole, sortBy]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await adminApi.deletePost(deleteId);
      showToast('Post deleted successfully', 'success');
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
      load();
    } catch {
      showToast('Failed to delete post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await adminApi.bulkDeletePosts(selectedIds);
      showToast(`${selectedIds.length} posts deleted successfully`, 'success');
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      load();
    } catch {
      showToast('Failed to delete selected posts', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = filtered.map(x => x.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const filtered = items.filter((post) =>
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.user.name.toLowerCase().includes(search.toLowerCase()) ||
    post.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'IMPORTER': return { color: '#6366f1', bg: '#6366f115' };
      case 'DISTRIBUTOR': return { color: '#06b6d4', bg: '#06b6d415' };
      case 'MANUFACTURER': return { color: '#f59e0b', bg: '#f59e0b15' };
      case 'INSTITUTION': return { color: '#f43f5e', bg: '#f43f5e15' };
      case 'COMMUNITY': return { color: '#10b981', bg: '#10b98115' };
      default: return { color: '#94a3b8', bg: '#94a3b815' };
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
          <div className="page-title">Posts & Moderation</div>
          <div className="page-subtitle">Manage, filter and bulk moderate all user posts ({total} total)</div>
        </div>
        <div className="page-header-right" style={{ display: 'flex', gap: 12 }}>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', boxShadow: 'none', padding: '6px 12px' }} onClick={() => setViewMode('grid')}>
              <Grid size={14} style={{ marginRight: 6 }}/> Grid
            </button>
            <button className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', boxShadow: 'none', padding: '6px 12px' }} onClick={() => setViewMode('table')}>
              <List size={14} style={{ marginRight: 6 }}/> Table
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 260, maxWidth: 350 }}>
            <Search size={16} />
            <input type="text" className="search-input" placeholder="Search content, author, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 'auto' }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role Filter:</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
              <option value="ALL">All Roles</option>
              <option value="COMMUNITY">Community</option>
              <option value="IMPORTER">Importer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="INSTITUTION">Institution</option>
            </select>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
              <option value="comments">Most Commented</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', background: 'var(--accent-danger-light)',
            border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-sm)', width: '100%',
            animation: 'fadeIn 0.2s ease'
          }}>
            <span style={{ fontSize: 14, color: 'var(--accent-danger)', fontWeight: 600 }}>
              {selectedIds.length} posts selected
            </span>
            <button className="btn btn-danger btn-sm" onClick={() => setBulkDeleteOpen(true)} style={{ marginLeft: 'auto' }}>
              <Trash2 size={14} style={{ marginRight: 6 }}/> Delete Selected
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])}>
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={36}/>
          <p>No posts found matching the criteria</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(post => {
            const isChecked = selectedIds.includes(post.id);
            const badge = getRoleBadgeColor(post.user.role);
            return (
              <div key={post.id} style={{
                background: 'var(--bg-card)',
                border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                boxShadow: isChecked ? '0 0 0 1px var(--accent-primary)' : 'none',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                height: '100%',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(post.id)} style={{ width: 16, height: 16, marginTop: 4, cursor: 'pointer' }} />
                  <div style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {post.user.name.substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewPost(post)} title="Preview Post">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDeleteId(post.id)} style={{ color: 'var(--accent-danger)' }} title="Delete Post">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </div>

                {post.images && post.images.length > 0 && (
                  <div 
                    onClick={() => setViewPost(post)}
                    style={{ 
                      width: '100%', 
                      height: 160, 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-subtle)', 
                      overflow: 'hidden', 
                      position: 'relative',
                      cursor: 'pointer',
                      marginTop: 'auto'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.images[0]} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {post.images.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: 12,
                        backdropFilter: 'blur(4px)'
                      }}>
                        +{post.images.length - 1}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: post.images && post.images.length > 0 ? 0 : 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} /> {post._count.likes}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MessageSquare size={14} /> {post._count.comments}</div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Badge variant="secondary" style={{ fontSize: 11, color: badge.color, background: badge.bg }}>{post.user.role}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={filtered.length > 0 && filtered.every(x => selectedIds.includes(x.id))} onChange={toggleSelectAll} style={{ width: 16, height: 16, cursor: 'pointer' }} /></th>
                <th>Author</th>
                <th>Role</th>
                <th>Content Preview</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Posted Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const isChecked = selectedIds.includes(post.id);
                const badge = getRoleBadgeColor(post.user.role);
                return (
                  <tr key={post.id} style={{ background: isChecked ? 'rgba(99,102,241,0.03)' : undefined }}>
                    <td><input type="checkbox" checked={isChecked} onChange={() => toggleSelect(post.id)} style={{ width: 16, height: 16, cursor: 'pointer' }} /></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="table-name" style={{ fontSize: 13.5 }}>{post.user.name}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{post.user.email}</span>
                      </div>
                    </td>
                    <td><Badge variant="secondary" style={{ color: badge.color, background: badge.bg }}>{post.user.role}</Badge></td>
                    <td>
                      <div style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {post.content}
                      </div>
                    </td>
                    <td>{post._count.likes}</td>
                    <td>{post._count.comments}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewPost(post)} title="View full post">
                          <Eye size={13} />
                        </button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDeleteId(post.id)} style={{ color: 'var(--accent-danger)' }} title="Delete post">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div style={{ marginTop: 24 }}>
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      )}

      {/* VIEW POST PREVIEW MODAL */}
      <Modal open={!!viewPost} onClose={() => setViewPost(null)} maxWidth={800}
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setViewPost(null)}>Close</button>
            {viewPost && (
              <button className="btn btn-danger" onClick={() => { setViewPost(null); setDeleteId(viewPost.id); }}>
                <Trash2 size={14} style={{ marginRight: 6 }}/> Delete Post
              </button>
            )}
          </div>
        }
      >
        {viewPost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16 }}>
                {viewPost.user.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{viewPost.user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{viewPost.user.email} • {new Date(viewPost.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge variant="secondary">{viewPost.user.role}</Badge>
              </div>
            </div>
            
            <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {viewPost.content}
            </div>

            {viewPost.images && viewPost.images.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: viewPost.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: 12, 
                marginTop: 8 
              }}>
                {viewPost.images.map((img, i) => (
                  <div key={i} style={{ width: '100%', height: viewPost.images!.length === 1 ? 400 : 250, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden', background: 'var(--bg-active)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Attached media" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 24, padding: '12px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', fontSize: 14, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={16} /> {viewPost._count.likes} Likes</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MessageSquare size={16} /> {viewPost._count.comments} Comments</div>
            </div>

            {viewPost.comments && viewPost.comments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Comments</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {viewPost.comments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                        {comment.user.name.substring(0,2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, background: 'var(--bg-active)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginRight: 8 }}>{comment.user.name}</span>
                            <Badge variant="secondary" style={{ fontSize: 10, padding: '2px 6px' }}>{comment.user.role}</Badge>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* SINGLE DELETE CONFIRMATION */}
      <Modal title="Delete Post" open={!!deleteId} onClose={() => setDeleteId(null)}
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
              Delete Permanently
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Are you sure you want to permanently delete this post? This will also remove all likes and comments associated with it. This action cannot be undone.
        </p>
      </Modal>

      {/* BULK DELETE CONFIRMATION */}
      <Modal title="Bulk Delete Posts" open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleBulkDelete} disabled={actionLoading}>
              {actionLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
              Delete {selectedIds.length} Posts
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Are you sure you want to permanently delete these **{selectedIds.length} selected posts**? This will clean up all associated likes and comments for all selected items. This action cannot be undone.
        </p>
      </Modal>
    </AdminLayout>
  );
}
