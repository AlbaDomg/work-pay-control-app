import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayFormatted } from '../../utils/dateUtils';
import { X, UserPlus, Building2 } from 'lucide-react';
import { BillingFrequency } from '../../types';

export const ClientFormModal: React.FC = () => {
  const { isClientModalOpen, closeClientModal, editingClient, saveClient } = useApp();

  const [name, setName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string | number>('');
  const [currency, setCurrency] = useState<string>('EUR');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [customBillingDays, setCustomBillingDays] = useState<string | number>('');
  const [billingStartDate, setBillingStartDate] = useState<string>(getTodayFormatted());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setCompany(editingClient.company || '');
      setEmail(editingClient.email || '');
      setPhone(editingClient.phone || '');
      setHourlyRate(editingClient.hourlyRate);
      setCurrency(editingClient.currency || 'EUR');
      setBillingFrequency(editingClient.billingFrequency);
      setCustomBillingDays(editingClient.customBillingDays || 15);
      setBillingStartDate(editingClient.billingStartDate || getTodayFormatted());
      setNotes(editingClient.notes || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setHourlyRate('');
      setCurrency('EUR');
      setBillingFrequency('monthly');
      setCustomBillingDays('');
      setBillingStartDate(getTodayFormatted());
      setNotes('');
    }
  }, [editingClient, isClientModalOpen]);

  if (!isClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveClient({
      id: editingClient ? editingClient.id : undefined,
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      hourlyRate: parseFloat(String(hourlyRate)) || 0,
      currency,
      billingFrequency,
      customBillingDays: billingFrequency === 'custom' ? parseInt(String(customBillingDays), 10) || 15 : undefined,
      billingStartDate,
      notes: notes.trim(),
    });
  };

  return (
    <div className="modal-backdrop" onClick={closeClientModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <UserPlus size={18} />
            </div>
            <h3 style={{ margin: 0 }}>
              {editingClient ? 'Editar Ficha de Cliente' : 'Crear Nuevo Cliente'}
            </h3>
          </div>
          <button
            onClick={closeClientModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre del Cliente *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Carlos Ruiz"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Empresa (Opcional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: CR Consultores S.L."
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="carlos@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+34 612 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tarifa por Hora (€/h) *</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  onFocus={e => e.target.select()}
                  placeholder="€/h"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Frecuencia de Cobro *</label>
                <select
                  className="input"
                  value={billingFrequency}
                  onChange={e => setBillingFrequency(e.target.value as BillingFrequency)}
                  required
                >
                  <option value="daily">Diario (Cada día)</option>
                  <option value="weekly">Semanal (Cada semana)</option>
                  <option value="monthly">Mensual (Cada mes)</option>
                  <option value="custom">Personalizado (Cada X días)</option>
                </select>
              </div>

              {billingFrequency === 'custom' ? (
                <div className="form-group">
                  <label className="form-label">Días entre cobros (Cada X días)</label>
                  <input
                    type="number"
                    className="input"
                    value={customBillingDays}
                    onChange={e => setCustomBillingDays(e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="Días"
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Inicio del periodo de cobro</label>
                  <input
                    type="date"
                    className="input"
                    value={billingStartDate}
                    onChange={e => setBillingStartDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notas Adicionales</label>
              <textarea
                className="input"
                placeholder="Detalles del contrato, preferencias de facturación..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeClientModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
