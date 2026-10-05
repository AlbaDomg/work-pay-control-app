import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatHours, subtractMoney, addMoney } from '../../engine/moneyEngine';
import { formatDateSpanish, getTodayFormatted } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import { BillingPeriod, Client } from '../../types';
import { Send, CreditCard, CheckCircle2, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';

export const BillingCenterView: React.FC = () => {
  const {
    billingPeriods,
    clients,
    openMessageModal,
    openPaymentModal,
    updatePeriodStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'pending' | 'overdue' | 'paid'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedClientIds, setExpandedClientIds] = useState<string[]>([]);

  const today = getTodayFormatted();
  const currentMonthPrefix = today.substring(0, 7);

  // Filtrado de periodos según la pestaña activa y búsqueda
  const getFilteredPeriods = (): BillingPeriod[] => {
    let filtered = billingPeriods;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const client = clients.find(c => String(c.id).trim() === String(p.clientId).trim());
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
        return filtered.filter(p => p.status === 'pending_send' && p.endDate <= today);
      case 'week':
        return filtered.filter(p => p.status === 'pending_send' || p.status === 'open');
      case 'month':
        return filtered.filter(p => p.startDate.startsWith(currentMonthPrefix) || p.endDate.startsWith(currentMonthPrefix));
      case 'pending':
        return filtered.filter(p => p.status !== 'paid');
      case 'overdue':
        return filtered.filter(p => p.status === 'overdue');
      case 'paid':
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
    month: billingPeriods.filter(p => p.startDate.startsWith(currentMonthPrefix) || p.endDate.startsWith(currentMonthPrefix)).length,
    pending: billingPeriods.filter(p => p.status !== 'paid').length,
    overdue: billingPeriods.filter(p => p.status === 'overdue').length,
    paid: billingPeriods.filter(p => p.status === 'paid').length,
  };

  // Agrupar los periodos mostrados por Cliente
  const clientMap = new Map<string, Client>(clients.map(c => [String(c.id).trim(), c]));
  
  // Obtener lista de clientes que tienen periodos mostrados
  const periodsByClientId = new Map<string, BillingPeriod[]>();
  displayedPeriods.forEach(period => {
    const key = String(period.clientId).trim();
    const list = periodsByClientId.get(key) || [];
    list.push(period);
    periodsByClientId.set(key, list);
  });

  const clientGroupList = Array.from(periodsByClientId.entries()).map(([clientId, periods]) => {
    const client = clientMap.get(clientId);
    const totalAmount = periods.reduce((sum, p) => addMoney(sum, p.totalAmount), 0);
    const totalPaid = periods.reduce((sum, p) => addMoney(sum, p.paidAmount), 0);
    const totalPending = subtractMoney(totalAmount, totalPaid);
    const hasAlerts = periods.some(p => p.status === 'overdue' || p.status === 'pending_send');

    return {
      client,
      clientId,
      periods,
      totalAmount,
      totalPaid,
      totalPending,
      hasAlerts,
    };
  });

  const toggleExpandClient = (clientId: string) => {
    if (expandedClientIds.includes(clientId)) {
      setExpandedClientIds(expandedClientIds.filter(id => id !== clientId));
    } else {
      setExpandedClientIds([...expandedClientIds, clientId]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Centro de Cobros</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Gestiona cobros y mensajes organizados limpiamente por cada cliente.
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
            placeholder="Buscar cliente o fecha..."
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
          { id: 'month', label: '📅 ESTE MES', badge: counts.month, color: 'var(--primary)' },
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

      {/* VISTA DE TARJETAS AGRUPADAS POR CLIENTE */}
      {clientGroupList.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={48} style={{ marginBottom: '12px', color: 'var(--status-paid)' }} />
          <h3>No hay cobros en esta categoría</h3>
          <p style={{ fontSize: '0.9rem' }}>Todos los elementos seleccionados están al día.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {clientGroupList.map(group => {
            const clientName = group.client?.name || 'Cliente sin nombre';
            const company = group.client?.company;
            const currency = group.client?.currency || 'EUR';
            const isExpanded = expandedClientIds.includes(group.clientId) || clientGroupList.length === 1;

            return (
              <div
                key={group.clientId}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isExpanded ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                {/* Cabecera de la Tarjeta del Cliente */}
                <div
                  onClick={() => toggleExpandClient(group.clientId)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    flexWrap: 'wrap',
                    gap: '12px',
                    userSelect: 'none',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                    {/* Avatar iniciales cliente */}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: group.hasAlerts ? 'var(--status-pending-bg)' : 'var(--primary-light)',
                        border: `1px solid ${group.hasAlerts ? 'rgba(217, 119, 6, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`,
                        color: group.hasAlerts ? 'var(--status-pending)' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {clientName.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{clientName}</h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {group.client?.billingFrequency === 'custom'
                            ? `Cada ${group.client?.customBillingDays || 15} días`
                            : group.client?.billingFrequency || 'Mensual'}
                        </span>
                      </div>

                      {company && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          {company}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Saldo acumulado del cliente & Boton desplegar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--status-paid)' }}>
                        {formatCurrency(group.totalPending > 0 ? group.totalPending : group.totalAmount, currency)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {group.periods.length} {group.periods.length === 1 ? 'periodo de cobro' : 'periodos de cobro'}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Contenido desplegado: Periodos de cobro específicos de ESTE cliente */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'var(--bg-input)',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {group.periods.map(period => {
                      const pendingAmount = subtractMoney(period.totalAmount, period.paidAmount);

                      return (
                        <div
                          key={period.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                  Del {formatDateSpanish(period.startDate, { short: true, includeYear: true })} al{' '}
                                  {formatDateSpanish(period.endDate, { short: true, includeYear: true })}
                                </span>
                                <StatusBadge status={period.status} />
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Vencimiento cobro: {formatDateSpanish(period.dueDate, { short: true, includeYear: true })}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                {formatCurrency(period.totalAmount, currency)}
                              </div>
                              {period.paidAmount > 0 && period.paidAmount < period.totalAmount && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--status-partial)', fontWeight: 600 }}>
                                  Pagado: {formatCurrency(period.paidAmount, currency)} | Pendiente:{' '}
                                  {formatCurrency(pendingAmount, currency)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info de horas */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              borderTop: '1px solid var(--border-light)',
                              paddingTop: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} style={{ color: 'var(--primary)' }} />
                              <span>{formatHours(period.totalHours)} trabajadas en este periodo</span>
                            </div>

                            {/* Botones de acción del periodo de este cliente */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {period.status !== 'paid' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openMessageModal(period)}
                                >
                                  <Send size={14} />
                                  <span>Enviar Mensaje</span>
                                </button>
                              )}

                              {period.status !== 'paid' && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => openPaymentModal(period)}
                                >
                                  <CreditCard size={14} />
                                  <span>Registrar Pago</span>
                                </button>
                              )}

                              {(period.status === 'open' || period.status === 'pending_send') && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => updatePeriodStatus(period.id, 'sent')}
                                >
                                  Marcar enviado
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
