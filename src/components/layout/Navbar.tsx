import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Wrench, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { userProfile, openWorkModal } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 13) return '¡Buenos días';
    if (hour >= 13 && hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const workerFirstName = (userProfile.mainWorkerName || 'Juan').split(' ')[0];

  return (
    <header
      className="navbar-desktop"
      style={{
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .navbar-desktop {
            display: flex !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            flexShrink: 0,
          }}
        >
          <Wrench size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {getGreeting()}, {workerFirstName}! 👋
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--primary)" /> Control de Horas & Cobros de Reformas
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => openWorkModal()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Registrar Trabajo</span>
        </button>
      </div>
    </header>
  );
};
