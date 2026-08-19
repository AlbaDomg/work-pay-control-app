import React from 'react';
import { Wallet } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header
      style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 20px',
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
            flexShrink: 0,
          }}
        >
          <Wallet size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, lineHeight: 1.2, fontWeight: 800 }}>Control de Pagos</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestión de Horas & Cobros</span>
        </div>
      </div>
    </header>
  );
};
