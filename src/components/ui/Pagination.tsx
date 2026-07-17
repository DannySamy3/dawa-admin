'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPage }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {total === 0 ? 0 : from}–{to} of {total} results
      </div>
      <div className="pagination-controls">
        <button className="pagination-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>
            {p}
          </button>
        ))}
        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
