import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();

  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={closeConfirmModal}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-overdue)' }}>
            <AlertTriangle size={22} />
            <h3 style={{ margin: 0 }}>{confirmModal.title}</h3>
          </div>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{confirmModal.message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeConfirmModal}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={confirmModal.onConfirm}>
            Confirmar eliminación
          </button>
        </div>
      </div>
    </div>
  );
};
