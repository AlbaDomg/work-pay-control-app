import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatHours } from '../../engine/moneyEngine';
import { BarChart3, TrendingUp, DollarSign, Clock, Users, Percent } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { workEntries, clients, payments } = useApp();

  // Calcular ingresos y horas agrupados por mes
  const monthlyStatsMap = new Map<string, { monthKey: string; monthName: string; amount: number; hours: number }>();

  workEntries.forEach(entry => {
    const [year, month] = entry.date.split('-');
    const monthKey = `${year}-${month}`;
    const d = new Date(Number(year), Number(month) - 1, 1);
    const monthName = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

    const entryTotal = entry.totalAmount ?? entry.amount;
    const existing = monthlyStatsMap.get(monthKey) || { monthKey, monthName, amount: 0, hours: 0 };
    existing.amount += entryTotal;
    existing.hours += entry.hours;
    monthlyStatsMap.set(monthKey, existing);
  });

  const sortedMonths = Array.from(monthlyStatsMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const maxMonthAmount = Math.max(...sortedMonths.map(m => m.amount), 1);

  // Calcular ingresos por cliente
  const clientStatsMap = new Map<string, { clientName: string; amount: number; hours: number }>();
  workEntries.forEach(entry => {
    const client = clients.find(c => c.id === entry.clientId);
    const name = client ? client.name : 'Desconocido';
    const entryTotal = entry.totalAmount ?? entry.amount;
    const existing = clientStatsMap.get(entry.clientId) || { clientName: name, amount: 0, hours: 0 };
    existing.amount += entryTotal;
    existing.hours += entry.hours;
    clientStatsMap.set(entry.clientId, existing);
  });

  const sortedClients = Array.from(clientStatsMap.values()).sort((a, b) => b.amount - a.amount);
  const totalGlobalAmount = workEntries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0);
  const totalGlobalHours = workEntries.reduce((sum, e) => sum + e.hours, 0);
  const avgHourlyRate = totalGlobalHours > 0 ? Math.round((totalGlobalAmount / totalGlobalHours) * 100) / 100 : 0;

  // Comparación mes actual vs mes anterior
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthAmount = monthlyStatsMap.get(currentMonthKey)?.amount || 0;
  const prevMonthAmount = monthlyStatsMap.get(prevMonthKey)?.amount || 0;

  let growthText = 'Sin datos previos suficientes';
  let growthPositive = true;

  if (prevMonthAmount > 0) {
    const diff = ((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100;
    const rounded = Math.round(diff * 10) / 10;
    growthPositive = rounded >= 0;
    growthText = `${growthPositive ? '+' : ''}${rounded}% respecto al mes anterior`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1>Estadísticas & Análisis Financiero</h1>
        <p style={{ fontSize: '0.9rem' }}>Rendimiento mensual, rentabilidad por cliente y promedios por hora</p>
      </div>

      {/* COMPARATIVA DE CRECIMIENTO */}
      <div
        className="card"
        style={{
          background: 'var(--gradient-card)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Evolución de Ingresos</h3>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>{growthText}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mes Anterior</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatCurrency(prevMonthAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Este Mes</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(currentMonthAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid-3">
        <div className="card">
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>INGRESOS TOTALES</span>
            <DollarSign size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>{formatCurrency(totalGlobalAmount)}</div>
        </div>

        <div className="card">
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HORAS REGISTRADAS</span>
            <Clock size={18} color="var(--status-sent)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>{formatHours(totalGlobalHours)}</div>
        </div>

        <div className="card">
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MEDIA INGRESOS/HORA</span>
            <BarChart3 size={18} color="var(--status-paid)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-paid)', marginTop: '6px' }}>
            {formatCurrency(avgHourlyRate)}/h
          </div>
        </div>
      </div>

      {/* GRÁFICOS SENCILLOS */}
      <div className="grid-2">
        {/* Gráfico de Ingresos por Mes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Ingresos Mensuales (€)</h3>
          {sortedMonths.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center' }}>No hay datos suficientes.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', paddingTop: '20px' }}>
              {sortedMonths.map(m => {
                const heightPct = Math.max(10, Math.round((m.amount / maxMonthAmount) * 100));

                return (
                  <div
                    key={m.monthKey}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {formatCurrency(m.amount)}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '40px',
                        height: `${heightPct}%`,
                        background: 'var(--gradient-primary)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                      {m.monthName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Distribución de Ingresos por Cliente */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Ingresos por Cliente</h3>
          {sortedClients.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center' }}>No hay datos de clientes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedClients.map(c => {
                const pct = totalGlobalAmount > 0 ? Math.round((c.amount / totalGlobalAmount) * 100) : 0;

                return (
                  <div key={c.clientName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700 }}>{c.clientName}</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(c.amount)} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        width: '100%',
                        background: 'var(--bg-input)',
                        borderRadius: '99px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--gradient-primary)',
                          borderRadius: '99px',
                        }}
                      />
                    </div>
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
