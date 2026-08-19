import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateToISO, formatDateSpanish } from '../../utils/dateUtils';
import { formatCurrency, formatHours } from '../../engine/moneyEngine';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { workEntries, clients, openWorkModal } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateToISO(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primer día del mes y total de días
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Ajustar día de inicio para semana empezando en Lunes (0 = Lunes, 6 = Domingo)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateToISO(today));
  };

  // Mapa de jornadas por fecha YYYY-MM-DD
  const entriesByDateMap = new Map<string, typeof workEntries>();
  workEntries.forEach(entry => {
    const existing = entriesByDateMap.get(entry.date) || [];
    entriesByDateMap.set(entry.date, [...existing, entry]);
  });

  // Jornadas del día seleccionado actualmente
  const selectedDayEntries = entriesByDateMap.get(selectedDateStr) || [];
  const selectedDayTotalHours = selectedDayEntries.reduce((sum, e) => sum + e.hours, 0);
  const selectedDayTotalAmount = selectedDayEntries.reduce((sum, e) => sum + e.amount, 0);

  // Construir matriz de días
  const daysArray = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null); // Días de relleno
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day);
    daysArray.push(formatDateToISO(d));
  }

  const monthNameStr = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header y Navegación de Mes */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ textTransform: 'capitalize' }}>{monthNameStr}</h1>
          <p style={{ fontSize: '0.9rem' }}>Vista de calendario interactivo de jornadas trabajadas</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={goToday}>
            Hoy
          </button>
          <button className="btn btn-secondary btn-icon" onClick={prevMonth}>
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={nextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* REJILLA DE CALENDARIO */}
        <div className="card" style={{ padding: '16px' }}>
          {/* Cabecera de días de la semana */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
            <div>DOM</div>
          </div>

          {/* Días del Mes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}
          >
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty_${idx}`} style={{ minHeight: '64px' }} />;
              }

              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === formatDateToISO(new Date());
              const dayEntries = entriesByDateMap.get(dateStr) || [];
              const dayHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
              const dayAmount = dayEntries.reduce((sum, e) => sum + e.amount, 0);
              const hasWork = dayEntries.length > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  style={{
                    minHeight: '64px',
                    padding: '6px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '2px solid var(--primary)'
                      : isToday
                      ? '2px solid var(--status-paid)'
                      : '1px solid var(--border-color)',
                    background: isSelected
                      ? 'var(--primary-light)'
                      : hasWork
                      ? 'var(--bg-card-hover)'
                      : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isToday || isSelected ? 800 : 500,
                        color: isSelected ? 'var(--primary)' : isToday ? 'var(--status-paid)' : 'var(--text-main)',
                      }}
                    >
                      {dayNumber}
                    </span>
                    {hasWork && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                        }}
                      />
                    )}
                  </div>

                  {hasWork ? (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatHours(dayHours)}
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {formatCurrency(dayAmount)}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DETALLE DEL DÍA SELECCIONADO */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              {formatDateSpanish(selectedDateStr, { includeYear: true })}
            </h3>
            <button className="btn btn-sm btn-primary" onClick={() => openWorkModal(null)}>
              + Añadir
            </button>
          </div>

          {selectedDayEntries.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CalendarIcon size={36} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No hay jornadas registradas para este día.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Resumen del Día */}
              <div
                style={{
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Horas totales</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatHours(selectedDayTotalHours)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Generado</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {formatCurrency(selectedDayTotalAmount)}
                  </div>
                </div>
              </div>

              {/* Lista de entradas */}
              {selectedDayEntries.map(entry => {
                const client = clients.find(c => c.id === entry.clientId);
                const currency = client ? client.currency : 'EUR';

                return (
                  <div
                    key={entry.id}
                    style={{
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{client?.name || 'Cliente'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatHours(entry.hours)} × {formatCurrency(entry.hourlyRate, currency)}/h ={' '}
                      <strong style={{ color: 'var(--primary)' }}>{formatCurrency(entry.amount, currency)}</strong>
                    </div>
                    {entry.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {entry.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
