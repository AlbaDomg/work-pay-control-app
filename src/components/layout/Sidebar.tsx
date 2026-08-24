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
  Wrench,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, billingPeriods, userProfile } = useApp();

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
        width: '270px',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-color)',
        display: 'none',
        flexDirection: 'column',
        padding: '24px 18px',
        zIndex: 50,
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

      {/* Marca / Logo */}
      <div style={{ padding: '4px 10px 24px 10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Wrench size={22} />
        </div>
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            ControlPagos
          </h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} color="var(--status-paid)" /> PRO • Reformas
          </span>
        </div>
      </div>

      {/* Navegación */}
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
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={20} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    background: isActive ? '#ffffff' : 'var(--status-overdue)',
                    color: isActive ? 'var(--primary)' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 0 10px currentColor',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Perfil del Usuario / Trabajador en Pie de Sidebar */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            border: '2px solid var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          {(userProfile.mainWorkerName || 'J')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userProfile.mainWorkerName || 'Juan (Principal)'}
          </div>
          <div style={{ color: 'var(--status-paid)', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-paid)', boxShadow: '0 0 6px var(--status-paid)' }} />
            En línea
          </div>
        </div>
      </div>
    </aside>
  );
};
