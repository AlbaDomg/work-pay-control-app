import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayFormatted, formatDateSpanish } from '../../utils/dateUtils';
import { formatCurrency, subtractMoney } from '../../engine/moneyEngine';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { PaymentMethod } from '../../types';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    selectedPeriodForPayment,
    clients,
    billingPeriods,
    recordPayment,
  } = useApp();

  const [clientId, setClientId] = useState<string>('');
  const [periodId, setPeriodId] = useState<string>('');
  const [amount, setAmount] = useState<string | number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayFormatted());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (selectedPeriodForPayment) {
      setClientId(selectedPeriodForPayment.clientId);
      setPeriodId(selectedPeriodForPayment.id);
      const pending = subtractMoney(
        selectedPeriodForPayment.totalAmount,
        selectedPeriodForPayment.paidAmount
      );
      setAmount(pending > 0 ? pending : selectedPeriodForPayment.totalAmount);
    } else {
      const firstActive = clients.find(c => c.active);
      setClientId(firstActive ? firstActive.id : '');
      setPeriodId('');
      setAmount(0);
    }
    setPaymentDate(getTodayFormatted());
    setPaymentMethod('bank_transfer');
    setNotes('');
  }, [selectedPeriodForPayment, isPaymentModalOpen]);

  if (!isPaymentModalOpen) return null;

  const client = clients.find(c => c.id === clientId);
  const currency = client ? client.currency : 'EUR';

  // Periodos pendientes del cliente
  const clientPendingPeriods = billingPeriods.filter(
    p => p.clientId === clientId && p.status !== 'paid'
  );

  const targetPeriod = billingPeriods.find(p => p.id === periodId);
  const currentPending = targetPeriod
    ? subtractMoney(targetPeriod.totalAmount, targetPeriod.paidAmount)
    : 0;

  const remainingAfterPayment = targetPeriod
    ? Math.max(0, subtractMoney(currentPending, Number(amount) || 0))
    : 0;

  const numAmount = Number(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || numAmount <= 0) return;

    recordPayment({
      clientId,
      billingPeriodId: periodId || undefined,
      amount: numAmount,
      paymentDate,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="modal-backdrop" onClick={closePaymentModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <CreditCard size={18} />
            </div>
            <h3 style={{ margin: 0 }}>Registrar Cobro / Pago Recibido</h3>
          </div>
          <button
            onClick={closePaymentModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Selección de Cliente */}
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select
                className="input"
                value={clientId}
                onChange={e => {
                  setClientId(e.target.value);
                  setPeriodId('');
                }}
                required
              >
                <option value="" disabled>
                  -- Seleccionar cliente --
                </option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Particular'})
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Periodo específico (opcional) */}
            <div className="form-group">
              <label className="form-label">Periodo de Cobro Asociado (Opcional)</label>
              <select
                className="input"
                value={periodId}
                onChange={e => {
                  const pId = e.target.value;
                  setPeriodId(pId);
                  const p = billingPeriods.find(item => item.id === pId);
                  if (p) {
                    const pend = subtractMoney(p.totalAmount, p.paidAmount);
                    setAmount(pend);
                  }
                }}
              >
                <option value="">-- Distribuir automáticamente entre los más antiguos --</option>
                {clientPendingPeriods.map(p => {
                  const pending = subtractMoney(p.totalAmount, p.paidAmount);
                  return (
                    <option key={p.id} value={p.id}>
                      {formatDateSpanish(p.startDate, { short: true })} al{' '}
                      {formatDateSpanish(p.endDate, { short: true })} — Pendiente:{' '}
                      {formatCurrency(pending, currency)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid-2">
              {/* Importe del pago */}
              <div className="form-group">
                <label className="form-label">Importe Recibido (€) *</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onFocus={e => e.target.select()}
                  placeholder="€"
                  required
                />
              </div>

              {/* Fecha del pago */}
              <div className="form-group">
                <label className="form-label">Fecha del Pago *</label>
                <input
                  type="date"
                  className="input"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Método de pago */}
            <div className="form-group">
              <label className="form-label">Método de Pago *</label>
              <select
                className="input"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                required
              >
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="bizum">Bizum</option>
                <option value="cash">Efectivo</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Notas del pago */}
            <div className="form-group">
              <label className="form-label">Notas / Concepto (Opcional)</label>
              <textarea
                className="input"
                placeholder="Ej: Pago parcial del trabajo de la semana pasada..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Cálculo de Pago Parcial en Vivo */}
            {targetPeriod && (
              <div
                style={{
                  background:
                    remainingAfterPayment > 0 ? 'var(--status-partial-bg)' : 'var(--status-paid-bg)',
                  border: `1px solid ${
                    remainingAfterPayment > 0 ? 'var(--status-partial)' : 'var(--status-paid)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle
                    size={20}
                    color={remainingAfterPayment > 0 ? 'var(--status-partial)' : 'var(--status-paid)'}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {remainingAfterPayment > 0 ? 'Pago Parcial Detectado:' : 'Pago Completo:'}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 700 }}>
                  <div>Recibido: {formatCurrency(numAmount, currency)}</div>
                  {remainingAfterPayment > 0 ? (
                    <div style={{ color: 'var(--status-overdue)', fontSize: '0.85rem' }}>
                      Quedará pendiente: {formatCurrency(remainingAfterPayment, currency)}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--status-paid)', fontSize: '0.85rem' }}>
                      Periodo completamente pagado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success" disabled={!clientId || numAmount <= 0}>
              Confirmar Registro de Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
