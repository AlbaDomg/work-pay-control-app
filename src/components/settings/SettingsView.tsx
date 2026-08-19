import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, RotateCcw, ShieldCheck, Database, User, Users, Plus, Trash2, Edit } from 'lucide-react';
import { Collaborator } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    collaborators,
    saveCollaborator,
    deleteCollaborator,
    exportData,
    importData,
    resetDemoData,
    showConfirmModal,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mainName, setMainName] = useState<string>(userProfile.mainWorkerName || 'Juan');

  // Estado para modal/formulario de ayudante
  const [newCollabName, setNewCollabName] = useState<string>('');
  const [newCollabRate, setNewCollabRate] = useState<string | number>('');
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainName.trim()) return;
    updateUserProfile({ mainWorkerName: mainName.trim() });
  };

  const handleSaveCollaboratorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName.trim()) return;

    saveCollaborator({
      id: editingCollabId || undefined,
      name: newCollabName.trim(),
      defaultHourlyRate: Number(newCollabRate) || 15,
    });

    setNewCollabName('');
    setNewCollabRate('');
    setEditingCollabId(null);
  };

  const handleEditCollab = (c: Collaborator) => {
    setEditingCollabId(c.id);
    setNewCollabName(c.name);
    setNewCollabRate(c.defaultHourlyRate);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    showConfirmModal(
      'Restablecer Aplicación',
      '¿Deseas vaciar todos los datos de la aplicación para empezar de cero?',
      () => resetDemoData()
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1>Configuración & Perfil</h1>
        <p style={{ fontSize: '0.9rem' }}>Administra tu nombre principal, lista de ayudantes y copias de seguridad</p>
      </div>

      <div className="grid-2">
        {/* PERFIL DEL TRABAJADOR PRINCIPAL */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Trabajador Principal</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Este nombre se utilizará por defecto en las jornadas y en los mensajes generados para los clientes.
          </p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="input"
              placeholder="Tu nombre (ej: Juan)"
              value={mainName}
              onChange={e => setMainName(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </form>
        </div>

        {/* GESTIÓN DE AYUDANTES / COMPAÑEROS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Ayudantes Frecuentes</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Guarda la lista de ayudantes o colaboradores habituales y su tarifa por hora recomendada.
          </p>

          <form onSubmit={handleSaveCollaboratorForm} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 2 }}
              placeholder="Nombre del ayudante"
              value={newCollabName}
              onChange={e => setNewCollabName(e.target.value)}
              required
            />
            <input
              type="number"
              step="any"
              className="input"
              style={{ flex: 1 }}
              placeholder="€/h"
              value={newCollabRate}
              onChange={e => setNewCollabRate(e.target.value)}
              onFocus={e => e.target.select()}
              required
            />
            <button type="submit" className="btn btn-primary">
              {editingCollabId ? 'Guardar' : '+ Añadir'}
            </button>
          </form>

          {collaborators.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {collaborators.map(c => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-input)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>{c.name}</strong> — {c.defaultHourlyRate} €/h
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditCollab(c)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteCollaborator(c.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Exportar / Importar Datos */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Copia de Seguridad de Datos</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Todos tus registros de clientes, jornadas de trabajo, ayudantes y cobros se guardan localmente en tu navegador. Puedes exportar una copia JSON en cualquier momento.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={exportData}>
              <Download size={16} />
              <span>Exportar Copia (.json)</span>
            </button>

            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              <span>Importar Copia</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Restablecer Datos Demo */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={20} color="var(--status-overdue)" />
            <h3 style={{ margin: 0 }}>Restablecer o Vaciar Datos</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Si deseas reiniciar la aplicación desde cero, puedes vaciar todos los registros.
          </p>

          <div>
            <button className="btn btn-danger" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>Vaciar Todo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
