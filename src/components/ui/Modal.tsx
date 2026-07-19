'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number | string;
}

export function Modal({ title, open, onClose, children, footer, maxWidth }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={maxWidth ? { maxWidth, width: '100%', position: 'relative' } : { position: 'relative' }}>
        {title ? (
          <div className="modal-header">
            <div className="modal-title">{title}</div>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>
        ) : (
          <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'var(--bg-active)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
