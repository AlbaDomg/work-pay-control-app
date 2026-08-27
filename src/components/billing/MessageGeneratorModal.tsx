import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateBillingMessage } from '../../engine/messageEngine';
import { MessageTone } from '../../types';
import { X, Copy, RefreshCw, Send, Check } from 'lucide-react';

export const MessageGeneratorModal: React.FC = () => {
  const {
    isMessageModalOpen,
    closeMessageModal,
    selectedPeriodForMessage,
    clients,
    workEntries,
    updatePeriodStatus,
    showToast,
  } = useApp();

  const [tone, setTone] = useState<MessageTone>('informal');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const client = selectedPeriodForMessage
    ? clients.find(c => c.id === selectedPeriodForMessage.clientId)
    : null;

  const periodWorkEntries = selectedPeriodForMessage
    ? workEntries.filter(w => selectedPeriodForMessage.workEntryIds.includes(w.id))
    : [];

  useEffect(() => {
    if (client && selectedPeriodForMessage) {
      // Si el periodo está en atraso o enviado, sugerir tono recordatorio
      let defaultTone: MessageTone = 'informal';
      if (selectedPeriodForMessage.status === 'overdue') {
        defaultTone = 'second_reminder';
      } else if (selectedPeriodForMessage.status === 'sent') {
        defaultTone = 'reminder';
      }
      setTone(defaultTone);

      const generated = generateBillingMessage({
        client,
        period: selectedPeriodForMessage,
        workEntries: periodWorkEntries,
        tone: defaultTone,
      });
      setMessageText(generated);
      setCopied(false);
    }
  }, [selectedPeriodForMessage, isMessageModalOpen]);

  if (!isMessageModalOpen || !selectedPeriodForMessage || !client) return null;

  const handleRegenerate = (newTone?: MessageTone) => {
    const activeTone = newTone || tone;
    const generated = generateBillingMessage({
      client,
      period: selectedPeriodForMessage,
      workEntries: periodWorkEntries,
      tone: activeTone,
    });
    setMessageText(generated);
    setCopied(false);
  };

  const handleToneChange = (newTone: MessageTone) => {
    setTone(newTone);
    handleRegenerate(newTone);
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

  return (
    <div className="modal-backdrop" onClick={closeMessageModal}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
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

        <div className="modal-body">
          {/* Selector de Tono/Plantilla */}
          <div className="form-group">
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
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label">Mensaje Listo para Enviar (Editable)</label>
              <button
                type="button"
                onClick={() => handleRegenerate()}
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
