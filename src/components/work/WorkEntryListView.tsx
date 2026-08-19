import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatHours } from '../../engine/moneyEngine';
import { formatDateSpanish } from '../../utils/dateUtils';
import { Clock, Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';

export const WorkEntryListView: React.FC = () => {
  const {
    workEntries,
    clients,
    openWorkModal,
    showConfirmModal,
    deleteWorkEntry,
  } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEntries = workEntries.filter(entry => {
    const matchesClient = selectedClientId === 'all' || entry.clientId === selectedClientId;
    const client = clients.find(c => c.id === entry.clientId);
    const matchesSearch =
      client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.includes(searchQuery);

    return matchesClient && matchesSearch;
  });

  const totalFilteredHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalFilteredAmount = filteredEntries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Registro de Trabajo y Horas</h1>
          <p style={{ fontSize: '0.9rem' }}>Historial completo de todas las jornadas de trabajo realizadas</p>
        </div>

        <button className="btn btn-primary" onClick={() => openWorkModal()}>
          <Plus size={18} />
          <span>Registrar Trabajo</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
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
            placeholder="Buscar por cliente, descripción..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="input"
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            style={{ maxWidth: '220px' }}
          >
            <option value="all">Todos los clientes</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen del Filtro Actual */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Mostrando <strong>{filteredEntries.length}</strong> jornada(s)
        </span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.95rem', fontWeight: 700 }}>
          <span>Total Horas: <strong style={{ color: 'var(--primary)' }}>{formatHours(totalFilteredHours)}</strong></span>
          <span>Total Importe: <strong style={{ color: 'var(--status-paid)' }}>{formatCurrency(totalFilteredAmount)}</strong></span>
        </div>
      </div>

      {/* LISTA DE JORNADAS */}
      {filteredEntries.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={44} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No hay jornadas registradas</h3>
          <p style={{ fontSize: '0.9rem' }}>Pulsa en "+ Registrar Trabajo" para añadir tu primera jornada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEntries.map(entry => {
            const client = clients.find(c => c.id === entry.clientId);
            const currency = client ? client.currency : 'EUR';

            return (
              <div
                key={entry.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {formatHours(entry.hours)}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{client?.name || 'Cliente'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDateSpanish(entry.date, { short: true, includeYear: true })}
                      </span>
                      {entry.startTime && entry.endTime ? (
                        <span>
                          • {entry.startTime} - {entry.endTime}
                        </span>
                      ) : null}
                    </div>
                    {entry.description && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {entry.description}
                      </div>
                    )}
                    {entry.collaborators && entry.collaborators.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        Ayudantes: {entry.collaborators.map(c => `${c.name} (${c.hours}h)`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--primary)' }}>
                      {formatCurrency(entry.totalAmount ?? entry.amount, currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {entry.mainWorkerName || 'Principal'}: {formatCurrency(entry.hourlyRate, currency)}/h
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openWorkModal(entry)}
                      title="Editar jornada"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        showConfirmModal(
                          'Eliminar Jornada de Trabajo',
                          '¿Estás seguro de eliminar este registro?',
                          () => deleteWorkEntry(entry.id)
                        );
                      }}
                      title="Eliminar jornada"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
