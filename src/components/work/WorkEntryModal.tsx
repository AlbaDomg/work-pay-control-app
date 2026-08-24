import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateHoursFromTimeRange, getTodayFormatted } from '../../utils/dateUtils';
import { formatCurrency } from '../../engine/moneyEngine';
import { X, Clock, Calculator, UserCheck, Plus, Trash2, Package } from 'lucide-react';
import { WorkEntryCollaborator } from '../../types';

export const WorkEntryModal: React.FC = () => {
  const {
    isWorkModalOpen,
    closeWorkModal,
    editingWorkEntry,
    clients,
    collaborators,
    userProfile,
    saveWorkEntry,
  } = useApp();

  const activeClients = clients.filter(c => c.active);

  const [clientId, setClientId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayFormatted());
  const [mode, setMode] = useState<'timer' | 'manual'>('timer');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('14:00');
  const [breakMinutes, setBreakMinutes] = useState<string | number>(0);
  const [manualHours, setManualHours] = useState<string | number>(5);
  const [mainWorkerName, setMainWorkerName] = useState<string>('');
  const [entryCollaborators, setEntryCollaborators] = useState<WorkEntryCollaborator[]>([]);
  const [materialCost, setMaterialCost] = useState<string | number>(0);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (editingWorkEntry) {
      setClientId(editingWorkEntry.clientId);
      setDate(editingWorkEntry.date);
      setDescription(editingWorkEntry.description || '');
      setMainWorkerName(editingWorkEntry.mainWorkerName || userProfile.mainWorkerName || 'Juan');
      setEntryCollaborators(editingWorkEntry.collaborators || []);
      setMaterialCost(editingWorkEntry.materialCost ?? 0);

      if (editingWorkEntry.startTime && editingWorkEntry.endTime) {
        setMode('timer');
        setStartTime(editingWorkEntry.startTime);
        setEndTime(editingWorkEntry.endTime);
        setBreakMinutes(editingWorkEntry.breakMinutes || 0);
      } else {
        setMode('manual');
        setManualHours(editingWorkEntry.hours);
      }
    } else {
      setClientId(activeClients.length > 0 ? activeClients[0].id : '');
      setDate(getTodayFormatted());
      setMode('timer');
      setStartTime('09:00');
      setEndTime('14:00');
      setBreakMinutes(0);
      setManualHours(5);
      setMainWorkerName(userProfile.mainWorkerName || 'Juan');
      setEntryCollaborators([]);
      setMaterialCost(0);
      setDescription('');
    }
  }, [editingWorkEntry, isWorkModalOpen, userProfile]);

  if (!isWorkModalOpen) return null;

  const selectedClient = clients.find(c => c.id === clientId);
  const currentRate = selectedClient ? selectedClient.hourlyRate : 0;
  const currentCurrency = selectedClient ? selectedClient.currency : 'EUR';

  // Horas del trabajador principal
  const computedHours =
    mode === 'timer'
      ? calculateHoursFromTimeRange(startTime, endTime, Number(breakMinutes) || 0)
      : parseFloat(String(manualHours)) || 0;

  const mainWorkerAmount = Math.round(computedHours * currentRate * 100) / 100;

  // Cálculo de ayudantes
  const collabsTotalAmount = entryCollaborators.reduce((sum, c) => {
    const itemAmount = Math.round((Number(c.hours) || 0) * (Number(c.hourlyRate) || 0) * 100) / 100;
    return sum + itemAmount;
  }, 0);

  const parsedMaterialCost = Math.max(0, parseFloat(String(materialCost)) || 0);
  const grandTotalAmount = Math.round((mainWorkerAmount + collabsTotalAmount + parsedMaterialCost) * 100) / 100;

  const handleAddCollaborator = () => {
    const newCollab: WorkEntryCollaborator = {
      id: `collab_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      hours: '' as any,
      hourlyRate: '' as any,
      amount: 0,
    };
    setEntryCollaborators([...entryCollaborators, newCollab]);
  };

  const handleUpdateCollaborator = (id: string, field: keyof WorkEntryCollaborator, value: any) => {
    setEntryCollaborators(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === 'hours' || field === 'hourlyRate') {
          updated.amount = Math.round((Number(updated.hours) || 0) * (Number(updated.hourlyRate) || 0) * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveCollaborator = (id: string) => {
    setEntryCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    saveWorkEntry({
      id: editingWorkEntry ? editingWorkEntry.id : undefined,
      clientId,
      date,
      startTime: mode === 'timer' ? startTime : '',
      endTime: mode === 'timer' ? endTime : '',
      breakMinutes: mode === 'timer' ? Number(breakMinutes) || 0 : 0,
      hours: computedHours,
      hourlyRate: currentRate,
      amount: mainWorkerAmount,
      mainWorkerName: mainWorkerName.trim() || userProfile.mainWorkerName || 'Juan',
      collaborators: entryCollaborators,
      materialCost: parsedMaterialCost,
      totalAmount: grandTotalAmount,
      description,
    });
  };

  return (
    <div className="modal-backdrop" onClick={closeWorkModal}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
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
              <Clock size={18} />
            </div>
            <h3 style={{ margin: 0 }}>
              {editingWorkEntry ? 'Editar jornada de trabajo' : 'Registrar nueva jornada'}
            </h3>
          </div>
          <button
            onClick={closeWorkModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Selección de Cliente */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cliente *</label>
              <select
                className="input"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Seleccionar cliente --
                </option>
                {activeClients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Particular'}) - {formatCurrency(c.hourlyRate, c.currency)}/h
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fecha de trabajo *</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            {/* Selector de Modo (Horas o Inicio/Fin) */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Modo de Registro de Jornada
              </label>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMode('timer')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: mode === 'timer' ? 'var(--gradient-primary)' : 'transparent',
                    color: mode === 'timer' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: mode === 'timer' ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: mode === 'timer' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
                  }}
                >
                  ⏱️ Hora Inicio / Fin
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: mode === 'manual' ? 'var(--gradient-primary)' : 'transparent',
                    color: mode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: mode === 'manual' ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: mode === 'manual' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
                  }}
                >
                  ✏️ Horas Manuales
                </button>
              </div>
            </div>

            {mode === 'timer' ? (
              <div className="grid-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hora Inicio</label>
                  <input
                    type="time"
                    className="input"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hora Fin</label>
                  <input
                    type="time"
                    className="input"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Descanso (min)</label>
                  <input
                    type="number"
                    step="5"
                    className="input"
                    value={breakMinutes}
                    onChange={e => setBreakMinutes(e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Horas del Principal ({mainWorkerName || 'Juan'})</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={manualHours}
                  onChange={e => setManualHours(e.target.value)}
                  onFocus={e => e.target.select()}
                  placeholder="0"
                  required
                />
              </div>
            )}

            {/* SECCIÓN DE AYUDANTES / COMPAÑEROS */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                background: 'var(--bg-card)',
              }}
            >
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Ayudantes / Compañeros ({entryCollaborators.length})
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleAddCollaborator}
                >
                  <Plus size={14} />
                  <span>+ Añadir Ayudante</span>
                </button>
              </div>

              {entryCollaborators.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  No has añadido ningún ayudante a esta jornada.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {entryCollaborators.map(c => (
                    <div key={c.id} className="helper-row">
                      {/* Nombre del Ayudante (desplegable de guardados o texto libre) */}
                      <div className="helper-name-col">
                        {collaborators.length > 0 && !(c as any).isCustom ? (
                          <select
                            className="input"
                            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                            value={c.name}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === '__custom__') {
                                handleUpdateCollaborator(c.id, 'isCustom', true);
                                handleUpdateCollaborator(c.id, 'name', '');
                              } else {
                                const found = collaborators.find(col => col.name === val);
                                handleUpdateCollaborator(c.id, 'name', val);
                                if (found) {
                                  handleUpdateCollaborator(c.id, 'hourlyRate', found.defaultHourlyRate);
                                  handleUpdateCollaborator(c.id, 'hours', c.hours || computedHours);
                                }
                              }
                            }}
                          >
                            <option value="">-- Seleccionar Ayudante --</option>
                            {collaborators.map(col => (
                              <option key={col.id} value={col.name}>
                                {col.name} ({col.defaultHourlyRate} €/h)
                              </option>
                            ))}
                            <option value="__custom__">+ Escribir otro nombre...</option>
                          </select>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="text"
                              className="input"
                              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                              placeholder="Nombre del ayudante"
                              value={c.name}
                              onChange={e => handleUpdateCollaborator(c.id, 'name', e.target.value)}
                            />
                            {collaborators.length > 0 && (
                              <button
                                type="button"
                                title="Volver a la lista"
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', flexShrink: 0 }}
                                onClick={() => handleUpdateCollaborator(c.id, 'isCustom', false)}
                              >
                                Lista
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Horas, Tarifa / h y Eliminar */}
                      <div className="helper-inputs-col">
                        <input
                          type="number"
                          step="any"
                          className="input"
                          style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                          placeholder="Horas"
                          value={c.hours ?? ''}
                          onChange={e => handleUpdateCollaborator(c.id, 'hours', e.target.value)}
                          onFocus={e => e.target.select()}
                        />

                        <input
                          type="number"
                          step="any"
                          className="input"
                          style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                          placeholder="€/h"
                          value={c.hourlyRate ?? ''}
                          onChange={e => handleUpdateCollaborator(c.id, 'hourlyRate', e.target.value)}
                          onFocus={e => e.target.select()}
                        />

                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--status-overdue)',
                            cursor: 'pointer',
                            padding: '6px',
                            flexShrink: 0,
                          }}
                          onClick={() => handleRemoveCollaborator(c.id)}
                          title="Eliminar ayudante"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN DE GASTOS EN MATERIALES */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} color="var(--primary)" />
                <span>Gasto en Materiales ({currentCurrency}) (opcional)</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="input"
                placeholder="0.00"
                value={materialCost}
                onChange={e => setMaterialCost(e.target.value)}
                onFocus={e => e.target.select()}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Este importe se sumará al total facturado al cliente en este trabajo.
              </span>
            </div>

            {/* Descripción opcional */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción del trabajo (opcional)</label>
              <textarea
                className="input"
                placeholder="Ej: Instalación de red y configuración..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Resumen Calculado en Vivo */}
            <div
              style={{
                background: 'var(--primary-light)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Calculator size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Desglose en Vivo:</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <div>
                  {mainWorkerName || 'Juan'}: {computedHours}h × {formatCurrency(currentRate, currentCurrency)}/h ={' '}
                  <strong>{formatCurrency(mainWorkerAmount, currentCurrency)}</strong>
                </div>
                {collabsTotalAmount > 0 && (
                  <div>
                    Ayudante(s): <strong>{formatCurrency(collabsTotalAmount, currentCurrency)}</strong>
                  </div>
                )}
                {parsedMaterialCost > 0 && (
                  <div>
                    Materiales: <strong>+{formatCurrency(parsedMaterialCost, currentCurrency)}</strong>
                  </div>
                )}
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                  Total a cobrar al cliente: {formatCurrency(grandTotalAmount, currentCurrency)}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeWorkModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!clientId || computedHours <= 0}>
              {editingWorkEntry ? 'Guardar Cambios' : 'Guardar Jornada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
