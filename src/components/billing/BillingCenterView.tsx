import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatHours, subtractMoney } from '../../engine/moneyEngine';
import { formatDateSpanish, getTodayFormatted } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import { BillingPeriod, BillingStatus } from '../../types';
import { Receipt, Send, CreditCard, CheckCircle2, Clock, AlertTriangle, Search } from 'lucide-react';

export const BillingCenterView: React.FC = () => {
  const {
    billingPeriods,
    clients,
    workEntries,
    openMessageModal,
    openPaymentModal,
    updatePeriodStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'pending' | 'overdue' | 'paid'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const today = getTodayFormatted();

  // Filtrado de periodos según la pestaña activa
  const getFilteredPeriods = (): BillingPeriod[] => {
    let filtered = billingPeriods;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return (
          client?.name.toLowerCase().includes(q) ||
          client?.company?.toLowerCase().includes(q) ||
          p.startDate.includes(q) ||
          p.endDate.includes(q)
        );
      });
    }

    switch (activeTab) {
      case 'today':
        // Cobros por enviar hoy o cuya fecha fin es hoy o previa
        return filtered.filter(p => p.status === 'pending_send' && p.endDate <= today);
      case 'week':
        // Periodos pendientes de enviar
        return filtered.filter(p => p.status === 'pending_send' || p.status === 'open');
      case 'pending':
        // Todos los no pagados (por recibir dinero)
        return filtered.filter(p => p.status !== 'paid');
      case 'overdue':
        // Vencidos
        return filtered.filter(p => p.status === 'overdue');
      case 'paid':
        // Completamente pagados
        return filtered.filter(p => p.status === 'paid');
      default:
        return filtered;
    }
  };

  const displayedPeriods = getFilteredPeriods();

  // Conteo de badges en pestañas
  const counts = {
    today: billingPeriods.filter(p => p.status === 'pending_send' && p.endDate <= today).length,
    week: billingPeriods.filter(p => p.status === 'pending_send' || p.status === 'open').length,
    pending: billingPeriods.filter(p => p.status !== 'paid').length,
    overdue: billingPeriods.filter(p => p.status === 'overdue').length,
    paid: billingPeriods.filter(p => p.status === 'paid').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Centro de Cobros</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Gestiona las solicitudes de pago, genera mensajes para WhatsApp/Email y registra cobros.
          </p>
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar por cliente o fecha..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pestañas Principales */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
        }}
      >
        {[
          { id: 'today', label: '🔴 HOY (Enviar hoy)', badge: counts.today, color: 'var(--status-overdue)' },
          { id: 'week', label: '🟡 ESTA SEMANA', badge: counts.week, color: 'var(--status-pending)' },
          { id: 'pending', label: 'PENDIENTES', badge: counts.pending, color: 'var(--primary)' },
          { id: 'overdue', label: 'VENCIDOS', badge: counts.overdue, color: 'var(--status-overdue)' },
          { id: 'paid', label: 'PAGADOS', badge: counts.paid, color: 'var(--status-paid)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
            }}
          >
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span
                style={{
                  background: activeTab === tab.id ? '#ffffff' : tab.color,
                  color: activeTab === tab.id ? 'var(--primary)' : '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LISTA DE PERIODOS DE COBRO */}
      {displayedPeriods.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={48} style={{ marginBottom: '12px', color: 'var(--status-paid)' }} />
          <h3>No hay cobros en esta categoría</h3>
          <p style={{ fontSize: '0.9rem' }}>Todos los elementos seleccionados están al día.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedPeriods.map(period => {
            const client = clients.find(c => c.id === period.clientId);
            const currency = client ? client.currency : 'EUR';
            const pendingAmount = subtractMoney(period.totalAmount, period.paidAmount);

            return (
              <div
                key={period.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: `4px solid ${
                    period.status === 'paid'
                      ? 'var(--status-paid)'
                      : period.status === 'overdue'
                      ? 'var(--status-overdue)'
                      : period.status === 'partial_payment'
                      ? 'var(--status-partial)'
                      : 'var(--primary)'
                  }`,
                }}
              >
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  {/* Info Cliente & Periodo */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{client?.name || 'Cliente'}</h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {period.frequency === 'custom'
                          ? `Cada ${client?.customBillingDays || 15} días`
                          : period.frequency}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Periodo:{' '}
                      <strong style={{ color: 'var(--text-main)' }}>
                        {formatDateSpanish(period.startDate, { short: true, includeYear: true })}
                      </strong>{' '}
                      al{' '}
                      <strong style={{ color: 'var(--text-main)' }}>
                        {formatDateSpanish(period.endDate, { short: true, includeYear: true })}
                      </strong>
                    </div>
                  </div>

                  {/* Estado y Montos */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(period.totalAmount, currency)}
                    </div>
                    {period.paidAmount > 0 && period.paidAmount < period.totalAmount && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--status-partial)', fontWeight: 600 }}>
                        Cobrado: {formatCurrency(period.paidAmount, currency)} | Pendiente:{' '}
                        {formatCurrency(pendingAmount, currency)}
                      </div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <StatusBadge status={period.status} />
                    </div>
                  </div>
                </div>

                {/* Detalles de horas */}
                <div
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    <span>Total: {formatHours(period.totalHours)} trabajadas</span>
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Fecha límite cobro: {formatDateSpanish(period.dueDate, { short: true })}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {period.status !== 'paid' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => openMessageModal(period)}
                    >
                      <Send size={16} />
                      <span>Generar Mensaje</span>
                    </button>
                  )}

                  {period.status !== 'paid' && (
                    <button
                      className="btn btn-success"
                      onClick={() => openPaymentModal(period)}
                    >
                      <CreditCard size={16} />
                      <span>Registrar Pago</span>
                    </button>
                  )}

                  {period.status === 'open' || period.status === 'pending_send' ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => updatePeriodStatus(period.id, 'sent')}
                    >
                      Marcar enviado
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
