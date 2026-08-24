import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, Clock, Users, Plus, UserPlus, FileText, Settings, X } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openWorkModal, openClientModal, billingPeriods } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const alertCount = billingPeriods.filter(p => p.status === 'pending_send' || p.status === 'overdue').length;

  const items = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'billing', label: 'Cobros', icon: Receipt, badge: alertCount },
    { id: 'add', label: '', icon: Plus, isCta: true },
    { id: 'work', label: 'Trabajo', icon: Clock },
    { id: 'clients', label: 'Clientes', icon: Users },
  ];

  const handleOpenWork = () => {
    setIsMenuOpen(false);
    setActiveTab('work');
    openWorkModal();
  };

  const handleOpenClient = () => {
    setIsMenuOpen(false);
    setActiveTab('clients');
    openClientModal();
  };

  const handleOpenSettings = () => {
    setIsMenuOpen(false);
    setActiveTab('settings');
  };

  return (
    <>
      {/* Menú Flotante Emergente al pulsar el botón + */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(6px)',
            zIndex: 90,
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              position: 'fixed',
              bottom: '84px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: 'var(--shadow-xl)',
              minWidth: '240px',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleOpenWork}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FileText size={18} />
              <span>Registrar Trabajo</span>
            </button>

            <button
              onClick={handleOpenClient}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <UserPlus size={18} color="var(--primary)" />
              <span>Nuevo Cliente</span>
            </button>

            <button
              onClick={handleOpenSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Settings size={18} color="var(--primary)" />
              <span>Configuración / Ayudantes</span>
            </button>
          </div>
        </div>
      )}

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-nav)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 12px 12px 12px',
          zIndex: 95,
        }}
        className="bottom-nav-mobile"
      >
        <style>{`
          @media (min-width: 1024px) {
            .bottom-nav-mobile {
              display: none !important;
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, 15px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}</style>

        {items.map((item, idx) => {
          if (item.isCta) {
            return (
              <button
                key={idx}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: isMenuOpen ? 'var(--status-overdue)' : 'var(--gradient-primary)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-14px)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                }}
              >
                {isMenuOpen ? <X size={26} /> : <Plus size={28} />}
              </button>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setIsMenuOpen(false);
                setActiveTab(item.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '4px',
                    background: 'var(--status-overdue)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
};
