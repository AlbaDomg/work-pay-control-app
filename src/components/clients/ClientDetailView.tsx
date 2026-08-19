import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatHours, subtractMoney } from '../../engine/moneyEngine';
import { formatDateSpanish } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Plus,
  Send,
  Trash2,
  Edit,
} from 'lucide-react';

interface ClientDetailViewProps {
  clientId: string;
  onBack: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({ clientId, onBack }) => {
  const {
    clients,
    workEntries,
    billingPeriods,
    payments,
    openWorkModal,
    openClientModal,
    openPaymentModal,
    openMessageModal,
    showConfirmModal,
    deleteClient,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'works' | 'periods' | 'payments'>('works');

  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Volver a clientes
        </button>
        <p style={{ marginTop: '16px' }}>Cliente no encontrado.</p>
      </div>
    );
  }

  // Filtrar jornadas, periodos y pagos de este cliente
  const clientWorkEntries = workEntries.filter(w => w.clientId === client.id);
  const clientBillingPeriods = billingPeriods.filter(p => p.clientId === client.id);
  const clientPayments = payments.filter(p => p.clientId === client.id);

  // Cálculos financieros
  const totalHours = clientWorkEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalGenerated = clientWorkEntries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0);
  const totalCollected = clientPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = Math.max(0, subtractMoney(totalGenerated, totalCollected));

  const lastWorkEntry = clientWorkEntries[0];
  const lastPayment = clientPayments[0];

  const handleDelete = () => {
    showConfirmModal(
      `Eliminar a ${client.name}`,
      `¿Estás seguro de que deseas eliminar este cliente? Se borrarán sus datos asociados.`,
      () => {
        deleteClient(client.id);
        onBack();
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Botón de Retorno y Acciones */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Volver a Clientes</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => openClientModal(client)}>
            <Edit size={16} />
            <span>Editar Ficha</span>
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* CABECERA DEL CLIENTE */}
      <div className="card" style={{ background: 'var(--gradient-card)' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ margin: 0 }}>{client.name}</h1>
              <span className={`badge ${client.active ? 'badge-paid' : 'badge-overdue'}`}>
                {client.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {client.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <Building2 size={16} />
                <span>{client.company}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {client.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> <span>{client.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(client.hourlyRate, client.currency)}/hora
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Frecuencia de cobro:{' '}
              <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>
                {client.billingFrequency === 'custom'
                  ? `Cada ${client.customBillingDays} días`
                  : client.billingFrequency}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS RESUMEN DE LA FICHA */}
      <div className="grid-4">
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DINERO GENERADO</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{formatCurrency(totalGenerated, client.currency)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatHours(totalHours)} trabajadas</div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DINERO COBRADO</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-paid)', marginTop: '4px' }}>
            {formatCurrency(totalCollected, client.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Último pago: {lastPayment ? formatDateSpanish(lastPayment.paymentDate, { short: true }) : 'Sin pagos'}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DINERO PENDIENTE</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-pending)', marginTop: '4px' }}>
            {formatCurrency(totalPending, client.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pendiente por cobrar</div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ÚLTIMO TRABAJO</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
            {lastWorkEntry ? formatDateSpanish(lastWorkEntry.date, { short: true, includeYear: true }) : 'Sin trabajos'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {lastWorkEntry ? `${formatHours(lastWorkEntry.hours)} (${formatCurrency(lastWorkEntry.amount, client.currency)})` : '-'}
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE HISTORIAL */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'works' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('works')}
            >
              Jornadas de Trabajo ({clientWorkEntries.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'periods' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('periods')}
            >
              Periodos de Cobro ({clientBillingPeriods.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('payments')}
            >
              Historial de Pagos ({clientPayments.length})
            </button>
          </div>

          <button className="btn btn-sm btn-primary" onClick={() => openWorkModal(null, client.id)}>
            <Plus size={14} /> Registrar Trabajo
          </button>
        </div>

        {/* CONTENIDO PESTAÑA: JORNADAS */}
        {activeTab === 'works' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clientWorkEntries.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay jornadas registradas para este cliente.
              </p>
            ) : (
              clientWorkEntries.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {formatDateSpanish(entry.date, { short: true, includeYear: true })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {entry.description || 'Sin descripción'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(entry.amount, client.currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatHours(entry.hours)} @ {formatCurrency(entry.hourlyRate, client.currency)}/h
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA: PERIODOS DE COBRO */}
        {activeTab === 'periods' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clientBillingPeriods.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay periodos de cobro generados.
              </p>
            ) : (
              clientBillingPeriods.map(period => (
                <div
                  key={period.id}
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Del {formatDateSpanish(period.startDate, { short: true })} al{' '}
                      {formatDateSpanish(period.endDate, { short: true, includeYear: true })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Total horas: {formatHours(period.totalHours)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{formatCurrency(period.totalAmount, client.currency)}</div>
                      <StatusBadge status={period.status} />
                    </div>
                    {period.status !== 'paid' && (
                      <button className="btn btn-sm btn-primary" onClick={() => openMessageModal(period)}>
                        <Send size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA: PAGOS */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clientPayments.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay registros de cobros para este cliente.
              </p>
            ) : (
              clientPayments.map(payment => (
                <div
                  key={payment.id}
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {formatDateSpanish(payment.paymentDate, { short: true, includeYear: true })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      Método: {payment.paymentMethod.replace('_', ' ')}
                      {payment.notes ? ` • ${payment.notes}` : ''}
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, color: 'var(--status-paid)', fontSize: '1.1rem' }}>
                    + {formatCurrency(payment.amount, client.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
