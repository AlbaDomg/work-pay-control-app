import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, subtractMoney } from '../../engine/moneyEngine';
import { ClientDetailView } from './ClientDetailView';
import { Users, Plus, Search, Building2, ChevronRight, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

export const ClientListView: React.FC = () => {
  const {
    clients,
    workEntries,
    payments,
    selectedClientId,
    setSelectedClientId,
    openClientModal,
    toggleClientActive,
    showConfirmModal,
    deleteClient,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');

  if (selectedClientId) {
    return <ClientDetailView clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
  }

  // Filtrado de clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterActive === 'active') return matchesSearch && client.active;
    if (filterActive === 'inactive') return matchesSearch && !client.active;
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Gestión de Clientes</h1>
          <p style={{ fontSize: '0.9rem' }}>Administra la información de tus clientes y sus tarifas pactadas</p>
        </div>

        <button className="btn btn-primary" onClick={() => openClientModal()}>
          <Plus size={18} />
          <span>Crear Nuevo Cliente</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
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
            placeholder="Buscar por nombre, empresa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'active', label: 'Activos' },
            { id: 'inactive', label: 'Inactivos' },
            { id: 'all', label: 'Todos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterActive(f.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: filterActive === f.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: filterActive === f.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: filterActive === f.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE TARJETAS DE CLIENTES */}
      {filteredClients.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={44} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No se encontraron clientes</h3>
          <p style={{ fontSize: '0.9rem' }}>Crea tu primer cliente para comenzar a registrar horas de trabajo.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openClientModal()}>
            + Crear Cliente
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filteredClients.map(client => {
            const clientWorkEntries = workEntries.filter(w => w.clientId === client.id);
            const clientPayments = payments.filter(p => p.clientId === client.id);

            const generated = clientWorkEntries.reduce((sum, e) => sum + e.amount, 0);
            const collected = clientPayments.reduce((sum, p) => sum + p.amount, 0);
            const pending = Math.max(0, subtractMoney(generated, collected));

            return (
              <div
                key={client.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  opacity: client.active ? 1 : 0.65,
                }}
                onClick={() => setSelectedClientId(client.id)}
              >
                <div>
                  <div className="flex-between">
                    <span className={`badge ${client.active ? 'badge-paid' : 'badge-overdue'}`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {client.billingFrequency.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ marginTop: '10px', marginBottom: '2px', fontSize: '1.2rem' }}>{client.name}</h3>

                  {client.company && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Building2 size={14} />
                      <span>{client.company}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(client.hourlyRate, client.currency)}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/hora</span>
                  </div>
                </div>

                {/* Métricas rápidas */}
                <div
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Generado</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(generated, client.currency)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cobrado</div>
                    <div style={{ fontWeight: 800, color: 'var(--status-paid)' }}>
                      {formatCurrency(collected, client.currency)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Pendiente</div>
                    <div style={{ fontWeight: 800, color: 'var(--status-pending)' }}>
                      {formatCurrency(pending, client.currency)}
                    </div>
                  </div>
                </div>

                {/* Acciones de Tarjeta */}
                <div
                  className="flex-between"
                  style={{ paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openClientModal(client)}
                      title="Editar ficha"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => toggleClientActive(client.id)}
                      title={client.active ? 'Desactivar cliente' : 'Activar cliente'}
                    >
                      {client.active ? <ToggleRight size={16} color="var(--status-paid)" /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        showConfirmModal(
                          `Eliminar a ${client.name}`,
                          `¿Estás seguro de eliminar este cliente?`,
                          () => deleteClient(client.id)
                        );
                      }}
                      title="Eliminar cliente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <span>Ver Ficha</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
