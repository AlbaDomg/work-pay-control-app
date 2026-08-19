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
          <h1>Panel de Control</h1>
          <p style={{ fontSize: '0.9rem' }}>Visión general de tus ingresos, jornadas y cobros</p>
        </div>

        {/* Filtros de Fecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: dateFilter === f.id ? 700 : 500,
                border: '1px solid var(--border-color)',
                background: dateFilter === f.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: dateFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* BANNER DE ALERTAS CRÍTICAS */}
      {(overduePeriods.length > 0 || pendingSendToday.length > 0 || totalGlobalPending > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {overduePeriods.length > 0 && (
            <div
              style={{
                background: 'var(--status-overdue-bg)',
                border: '1px solid var(--status-overdue)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--status-overdue)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  🔴 Tienes {overduePeriods.length} cobro(s) vencido(s) sin recibir pago.
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
                border: '1px solid var(--status-pending)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--status-pending)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarDays size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  📅 Hoy tienes {pendingSendToday.length} solicitud(es) de cobro pendientes de enviar.
                </span>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--status-pending)', color: '#fff' }}
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
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DINERO GENERADO
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatCurrency(totalGenerated)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            En el periodo seleccionado
          </div>
        </div>

        {/* DINERO COBRADO */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DINERO COBRADO
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-paid-bg)',
                color: 'var(--status-paid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-paid)' }}>
            {formatCurrency(totalCollected)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ingresado en cuenta
          </div>
        </div>

        {/* DINERO PENDIENTE */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DINERO PENDIENTE
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-pending-bg)',
                color: 'var(--status-pending)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-pending)' }}>
            {formatCurrency(totalGlobalPending)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total por cobrar acumulado
          </div>
        </div>

        {/* HORAS TRABAJADAS */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              HORAS TRABAJADAS
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-sent-bg)',
                color: 'var(--status-sent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatHours(totalHours)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {activeClientsCount} clientes activos
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
