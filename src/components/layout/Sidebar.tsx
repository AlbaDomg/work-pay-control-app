import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  Receipt,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, billingPeriods } = useApp();

  // Contar cuántos periodos requieren atención (pendientes de enviar o vencidos)
  const alertCount = billingPeriods.filter(p => p.status === 'pending_send' || p.status === 'overdue').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Centro de cobros', icon: Receipt, badge: alertCount },
    { id: 'work', label: 'Trabajo / Horas', icon: Clock },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'none',
        flexDirection: 'column',
        padding: '24px 16px',
      }}
      className="sidebar-desktop"
    >
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-desktop {
            display: flex !important;
          }
        }
      `}</style>

      <div style={{ padding: '0 12px 24px 12px' }}>
        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Control de Pagos</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Panel de Control Personal</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    background: isActive ? '#fff' : 'var(--status-overdue)',
                    color: isActive ? 'var(--primary)' : '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '99px',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
