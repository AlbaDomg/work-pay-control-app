import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, Clock, Users, Plus } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openWorkModal, billingPeriods } = useApp();

  const alertCount = billingPeriods.filter(p => p.status === 'pending_send' || p.status === 'overdue').length;

  const items = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'billing', label: 'Cobros', icon: Receipt, badge: alertCount },
    { id: 'add', label: '', icon: Plus, isCta: true },
    { id: 'work', label: 'Trabajo', icon: Clock },
    { id: 'clients', label: 'Clientes', icon: Users },
  ];

  return (
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
        zIndex: 50,
      }}
      className="bottom-nav-mobile"
    >
      <style>{`
        @media (min-width: 1024px) {
          .bottom-nav-mobile {
            display: none !important;
          }
        }
      `}</style>

      {items.map((item, idx) => {
        if (item.isCta) {
          return (
            <button
              key={idx}
              onClick={() => openWorkModal()}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-14px)',
                cursor: 'pointer',
              }}
            >
              <Plus size={28} />
            </button>
          );
        }

        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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
  );
};
