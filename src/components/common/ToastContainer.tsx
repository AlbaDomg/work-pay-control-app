import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
      }}
    >
      {toasts.map(toast => {
        const getBg = () => {
          if (toast.type === 'error') return 'var(--status-overdue-bg)';
          if (toast.type === 'info') return 'var(--status-sent-bg)';
          return 'var(--status-paid-bg)';
        };

        const getColor = () => {
          if (toast.type === 'error') return 'var(--status-overdue)';
          if (toast.type === 'info') return 'var(--status-sent)';
          return 'var(--status-paid)';
        };

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-modal)',
              border: `1px solid ${getColor()}`,
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: getColor(), fontSize: '0.9rem', fontWeight: 600 }}>
              {toast.type === 'error' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              <span style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
