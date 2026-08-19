import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Sparkles, ArrowRight } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { userProfile, updateUserProfile } = useApp();
  const [name, setName] = useState<string>('');

  // Si ya está configurado el nombre del trabajador principal, no mostrar modal
  if (userProfile.isConfigured && userProfile.mainWorkerName.trim()) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUserProfile({
      mainWorkerName: name.trim(),
      isConfigured: true,
    });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 300 }}>
      <div
        className="modal-card"
        style={{ maxWidth: '480px', padding: '12px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', padding: '24px 20px 12px 20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Sparkles size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            ¡Bienvenido a Control de Pagos!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Para personalizar tus mensajes y cobros automáticamente, introduce tu nombre de trabajador principal.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 20px 24px 20px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="var(--primary)" />
              <span>Tu Nombre (Trabajador Principal) *</span>
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '1.05rem', padding: '12px 16px' }}
              placeholder="Ej: Juan"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Se pegará automáticamente en cada registro de trabajo. Podrás cambiarlo en Configuración.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
            disabled={!name.trim()}
          >
            <span>Comenzar a Usar la App</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
