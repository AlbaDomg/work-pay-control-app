import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateBillingMessage } from '../../engine/messageEngine';
import { MessageTone, WorkEntry } from '../../types';
import { X, Copy, RefreshCw, Send, Check, CheckSquare, Square, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { formatDateSpanish } from '../../utils/dateUtils';
import { formatCurrency, formatHours, addMoney } from '../../engine/moneyEngine';

export const MessageGeneratorModal: React.FC = () => {
  const {
    isMessageModalOpen,
    closeMessageModal,
    selectedPeriodForMessage,
    clients,
    workEntries,
    billingPeriods,
    updatePeriodStatus,
    showToast,
  } = useApp();

  const [tone, setTone] = useState<MessageTone>('informal');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [isSelectionOpen, setIsSelectionOpen] = useState<boolean>(true);

  const client = selectedPeriodForMessage
    ? clients.find(c => c.id === selectedPeriodForMessage.clientId)
    : null;

  // Obtener todos los trabajos registrados de este cliente
  const clientWorkEntries = selectedPeriodForMessage
    ? workEntries
        .filter(w => w.clientId === selectedPeriodForMessage.clientId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  // Al abrir el modal o cambiar de periodo, inicializar la selección por defecto
  useEffect(() => {
    if (client && selectedPeriodForMessage) {
      let defaultTone: MessageTone = 'informal';
      if (selectedPeriodForMessage.status === 'overdue') {
        defaultTone = 'second_reminder';
      } else if (selectedPeriodForMessage.status === 'sent') {
        defaultTone = 'reminder';
      }
      setTone(defaultTone);

      // Periodo actual IDs
      const periodWorkSet = new Set(selectedPeriodForMessage.workEntryIds);

      // Identificar entradas pertenecientes a periodos ya pagados
      const paidEntryIds = new Set<string>();
      billingPeriods.forEach(p => {
        if (p.clientId === client.id && p.status === 'paid') {
          p.workEntryIds.forEach(id => paidEntryIds.add(id));
        }
      });

      // Preseleccionar:
      // 1. Trabajos pertenecientes al periodo actual
      // 2. O trabajos del mismo cliente con fecha <= fin de periodo que NO pertenezcan a un periodo ya pagado
      const defaultSelected = clientWorkEntries
        .filter(entry => {
          if (periodWorkSet.has(entry.id)) return true;
          if (!paidEntryIds.has(entry.id) && entry.date <= selectedPeriodForMessage.endDate) return true;
          return false;
        })
        .map(e => e.id);

      // Fallback si no hubiese por regla 2: usar las del periodo
      const initialIds = defaultSelected.length > 0 ? defaultSelected : selectedPeriodForMessage.workEntryIds;
      setSelectedEntryIds(initialIds);

      const activeEntries = clientWorkEntries.filter(w => initialIds.includes(w.id));
      const generated = generateBillingMessage({
        client,
        period: selectedPeriodForMessage,
        workEntries: activeEntries,
        tone: defaultTone,
      });
      setMessageText(generated);
      setCopied(false);
    }
  }, [selectedPeriodForMessage, isMessageModalOpen]);

  if (!isMessageModalOpen || !selectedPeriodForMessage || !client) return null;

  // Recalcular el texto del mensaje cuando cambian las entradas seleccionadas o el tono
  const updateMessage = (entryIds: string[], activeTone: MessageTone = tone) => {
    const activeEntries = clientWorkEntries.filter(w => entryIds.includes(w.id));
    const generated = generateBillingMessage({
      client,
      period: selectedPeriodForMessage,
      workEntries: activeEntries,
      tone: activeTone,
    });
    setMessageText(generated);
    setCopied(false);
  };

  const handleToggleEntry = (entryId: string) => {
    let updated: string[];
    if (selectedEntryIds.includes(entryId)) {
      updated = selectedEntryIds.filter(id => id !== entryId);
    } else {
      updated = [...selectedEntryIds, entryId];
    }
    setSelectedEntryIds(updated);
    updateMessage(updated);
  };

  const handleSelectAll = () => {
    const allIds = clientWorkEntries.map(w => w.id);
    setSelectedEntryIds(allIds);
    updateMessage(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedEntryIds([]);
    updateMessage([]);
  };

  const handleToneChange = (newTone: MessageTone) => {
    setTone(newTone);
    updateMessage(selectedEntryIds, newTone);
  };

  const handleRegenerate = () => {
    updateMessage(selectedEntryIds);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      showToast('¡Mensaje copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
      showToast('No se pudo copiar automáticamente. Puedes seleccionarlo manualmente.', 'error');
    }
  };

  const handleMarkAsSent = () => {
    updatePeriodStatus(selectedPeriodForMessage.id, 'sent');
    closeMessageModal();
  };

  // Calcular métricas dinámicas de las entradas seleccionadas
  const selectedEntries = clientWorkEntries.filter(w => selectedEntryIds.includes(w.id));
  const totalSelectedAmount = selectedEntries.reduce(
    (sum, e) => addMoney(sum, e.totalAmount ?? e.amount),
    0
  );

  return (
    <div className="modal-backdrop" onClick={closeMessageModal}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Generar Mensaje de Cobro</h3>
              <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
                Para {client.name} ({client.billingFrequency.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={closeMessageModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Seccion Selector de Trabajos Registrados */}
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsSelectionOpen(!isSelectionOpen)}
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Trabajos a Incluir en el Mensaje
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedEntryIds.length > 0 ? 'var(--primary-light)' : 'var(--bg-input)',
                    color: selectedEntryIds.length > 0 ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {selectedEntryIds.length} / {clientWorkEntries.length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-paid)' }}>
                  {formatCurrency(totalSelectedAmount, client.currency || 'EUR')}
                </span>
                {isSelectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {isSelectionOpen && (
              <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    Marca o desmarca las jornadas que deseas enviar:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Todos
                    </button>
                    <span style={{ color: 'var(--border-color)' }}>|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {clientWorkEntries.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay registros de trabajo para este cliente.
                  </p>
                ) : (
                  <div
                    style={{
                      maxHeight: '170px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      paddingRight: '4px',
                    }}
                  >
                    {clientWorkEntries.map(entry => {
                      const isSelected = selectedEntryIds.includes(entry.id);
                      const isInPeriod = selectedPeriodForMessage.workEntryIds.includes(entry.id);
                      const entryTotal = entry.totalAmount ?? entry.amount;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => handleToggleEntry(entry.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: isSelected ? 'var(--bg-card)' : 'transparent',
                            border: `1px solid ${isSelected ? 'var(--primary-light)' : 'var(--border-light)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>
                              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                                  {formatDateSpanish(entry.date, { short: true, includeYear: true })}
                                </span>
                                {isInPeriod ? (
                                  <span
                                    style={{
                                      fontSize: '0.65rem',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      background: 'var(--primary-light)',
                                      color: 'var(--primary)',
                                      fontWeight: 700,
                                    }}
                                  >
                                    Periodo actual
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '0.65rem',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      background: 'var(--status-pending-bg)',
                                      color: 'var(--status-pending)',
                                      fontWeight: 700,
                                    }}
                                  >
                                    Anterior/Pendiente
                                  </span>
                                )}
                              </div>
                              {entry.description && (
                                <p
                                  style={{
                                    fontSize: '0.74rem',
                                    color: 'var(--text-muted)',
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '260px',
                                  }}
                                >
                                  {entry.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              {formatCurrency(entryTotal, client.currency || 'EUR')}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {formatHours(entry.hours)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selector de Tono/Plantilla */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tono del Mensaje / Plantilla</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {[
                { id: 'informal', label: 'Informal (Amigable)' },
                { id: 'professional', label: 'Profesional (Formal)' },
                { id: 'reminder', label: 'Recordatorio (1º aviso)' },
                { id: 'second_reminder', label: 'Urgent (2º aviso)' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToneChange(item.id as MessageTone)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: tone === item.id ? 'var(--primary-light)' : 'var(--bg-input)',
                    color: tone === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: tone === item.id ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Área de Texto Editable */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label">Mensaje Listo para Enviar (Editable)</label>
              <button
                type="button"
                onClick={handleRegenerate}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Regenerar
              </button>
            </div>
            <textarea
              className="input"
              rows={7}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.45, minHeight: '120px' }}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleMarkAsSent}
            style={{ flex: '1 1 140px', justifyContent: 'center' }}
            title="Marca el estado como Solicitud enviada"
          >
            <Send size={16} />
            <span>Marcar Enviado</span>
          </button>

          <button
            type="button"
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={handleCopy}
            style={{ flex: '1 1 140px', justifyContent: 'center' }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? '¡COPIADO!' : 'COPIAR MENSAJE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
