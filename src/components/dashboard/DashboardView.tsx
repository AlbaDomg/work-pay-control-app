import React from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterRange } from '../../types';
import { formatCurrency, formatHours, subtractMoney } from '../../engine/moneyEngine';
import { formatDateSpanish, isDateInRange, getTodayFormatted, getWeekRange, getMonthRange } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import {
  TrendingUp,
  CreditCard,
  Clock,
  Users,
  AlertTriangle,
  Send,
  Plus,
  ArrowUpRight,
  Receipt,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    clients,
    workEntries,
    billingPeriods,
    payments,
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    setActiveTab,
    openWorkModal,
    openMessageModal,
    openPaymentModal,
  } = useApp();

  const today = getTodayFormatted();

  // Determinar rango de fechas activo para filtrado de KPIs
  const getActiveRange = (): { startDate: string; endDate: string } => {
    switch (dateFilter) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'week':
        return getWeekRange(today);
      case 'month':
        return getMonthRange(today);
      case 'last_month': {
        const [year, month] = today.split('-').map(Number);
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
        return getMonthRange(prevMonthStr);
      }
      case 'year': {
        const year = today.split('-')[0];
        return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
      }
      case 'custom':
        return customDateRange;
      default:
        return getMonthRange(today);
    }
  };

  const activeRange = getActiveRange();

  // Filtrar jornadas y pagos en el rango seleccionado
  const filteredWorkEntries = workEntries.filter(w =>
    isDateInRange(w.date, activeRange.startDate, activeRange.endDate)
  );

  const filteredPayments = payments.filter(p =>
    isDateInRange(p.paymentDate, activeRange.startDate, activeRange.endDate)
  );

  // Cálculos de métricas clave
  const totalGenerated = filteredWorkEntries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0);
  const totalHours = filteredWorkEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Dinero pendiente global (sin importar rango de fechas para reflejar deuda real)
  const totalGlobalGenerated = workEntries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0);
  const totalGlobalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalGlobalPending = Math.max(0, subtractMoney(totalGlobalGenerated, totalGlobalCollected));

  const activeClientsCount = clients.filter(c => c.active).length;

  // Alertas
  const overduePeriods = billingPeriods.filter(p => p.status === 'overdue');
  const pendingSendToday = billingPeriods.filter(p => p.status === 'pending_send' && p.endDate <= today);
  const totalPendingPeriods = billingPeriods.filter(p => p.status !== 'paid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header y Filtro de Rango */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Panel de Control</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Resumen en tiempo real de ingresos, horas trabajadas y cobros pendientes
          </p>
        </div>

        {/* Filtros de Fecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'today', label: 'Hoy' },
            { id: 'week', label: 'Esta semana' },
            { id: 'month', label: 'Este mes' },
            { id: 'last_month', label: 'Mes anterior' },
            { id: 'year', label: 'Este año' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as DateFilterRange)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: dateFilter === f.id ? 800 : 600,
                border: 'none',
                background: dateFilter === f.id ? 'var(--gradient-primary)' : 'transparent',
                color: dateFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: dateFilter === f.id ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* BANNER DE ALERTAS CRÍTICAS */}
      {(overduePeriods.length > 0 || pendingSendToday.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {overduePeriods.length > 0 && (
            <div
              style={{
                background: 'var(--status-overdue-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--status-overdue)',
                boxShadow: '0 4px 16px rgba(244, 63, 94, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={22} />
                <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                  Tienes {overduePeriods.length} cobro(s) vencido(s) que requieren reclamación inmediata.
                </span>
              </div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setActiveTab('billing')}
              >
                Ver en Centro de cobros
              </button>
            </div>
          )}

          {pendingSendToday.length > 0 && (
            <div
              style={{
                background: 'var(--status-pending-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--status-pending)',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalendarDays size={22} />
                <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                  Hoy finalizan {pendingSendToday.length} periodo(s) listos para enviar solicitud de cobro.
                </span>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--status-pending)', color: '#fff', fontWeight: 700 }}
                onClick={() => setActiveTab('billing')}
              >
                Generar Mensajes
              </button>
            </div>
          )}
        </div>
      )}

      {/* TARJETAS KPI DE MÉTRICAS */}
      <div className="grid-4">
        {/* DINERO GENERADO */}
        <div className="card card-hover">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              DINERO GENERADO
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalGenerated)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            Trabajos facturados en periodo
          </div>
        </div>

        {/* DINERO COBRADO */}
        <div className="card card-hover">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              DINERO COBRADO
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-paid-bg)',
                color: 'var(--status-paid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--status-paid)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalCollected)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            Ingresado y confirmado
          </div>
        </div>

        {/* DINERO PENDIENTE */}
        <div className="card card-hover">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              DINERO PENDIENTE
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-pending-bg)',
                color: 'var(--status-pending)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
              }}
            >
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--status-pending)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalGlobalPending)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            Total por cobrar acumulado
          </div>
        </div>

        {/* HORAS TRABAJADAS */}
        <div className="card card-hover">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              HORAS TRABAJADAS
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-sent-bg)',
                color: 'var(--status-sent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(14, 165, 233, 0.25)',
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatHours(totalHours)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            {activeClientsCount} clientes activos en cartera
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: COBROS PENDIENTES & ACCIONES RÁPIDAS */}
      <div className="grid-2">
        {/* Próximos Cobros y Pendientes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Cobros Urgentes & Pendientes</h3>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setActiveTab('billing')}
            >
              Ver todos ({totalPendingPeriods.length})
            </button>
          </div>

          {totalPendingPeriods.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '8px', color: 'var(--status-paid)' }} />
              <p style={{ fontWeight: 600, margin: 0 }}>¡Todo al día!</p>
              <p style={{ fontSize: '0.85rem' }}>No tienes cobros pendientes por reclamar.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {totalPendingPeriods.slice(0, 4).map(period => {
                const client = clients.find(c => c.id === period.clientId);
                const currency = client ? client.currency : 'EUR';
                const pending = subtractMoney(period.totalAmount, period.paidAmount);

                return (
                  <div
                    key={period.id}
                    style={{
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {client?.name || 'Cliente'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Periodo: {formatDateSpanish(period.startDate, { short: true })} al{' '}
                        {formatDateSpanish(period.endDate, { short: true })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {formatCurrency(pending, currency)}
                      </div>
                      <StatusBadge status={period.status} />
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openMessageModal(period)}
                        title="Generar mensaje preparado"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => openPaymentModal(period)}
                        title="Registrar cobro"
                      >
                        <CreditCard size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actividad Reciente (Jornadas) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Últimas Jornadas Registradas</h3>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => openWorkModal()}>
              <Plus size={14} />
              <span>Registrar</span>
            </button>
          </div>

          {workEntries.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Aún no has registrado ninguna jornada de trabajo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workEntries.slice(0, 5).map(entry => {
                const client = clients.find(c => c.id === entry.clientId);
                const currency = client ? client.currency : 'EUR';

                return (
                  <div
                    key={entry.id}
                    style={{
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {client?.name || 'Cliente'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDateSpanish(entry.date, { short: true, includeYear: true })}
                        {entry.description ? ` • ${entry.description}` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {formatCurrency(entry.totalAmount ?? entry.amount, currency)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatHours(entry.hours)} ({formatCurrency(entry.hourlyRate, currency)}/h)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
