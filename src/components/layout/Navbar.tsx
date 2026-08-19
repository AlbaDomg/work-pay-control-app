import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Wallet } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { openWorkModal, openClientModal } = useApp();

  return (
    <header
      style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Wallet size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>Control de Pagos</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestión de Horas & Cobros</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => openClientModal()}
          style={{ display: 'none' }} // Visible en pantallas más amplias vía media query si se desea
        >
          + Nuevo Cliente
        </button>

        <button className="btn btn-primary" onClick={() => openWorkModal()}>
          <Plus size={18} />
          <span>Registrar trabajo</span>
        </button>
      </div>
    </header>
  );
};
