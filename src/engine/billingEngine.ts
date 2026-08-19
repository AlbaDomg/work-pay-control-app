import { BillingPeriod, BillingStatus, Client, PaymentItem, WorkEntry } from '../types';
import { addDays, getCustomPeriodRange, getMonthRange, getTodayFormatted, getWeekRange } from '../utils/dateUtils';
import { addMoney, subtractMoney } from './moneyEngine';

/**
 * Motor de Gestión de Periodos de Cobro
 * Agrupa automáticamente las jornadas de trabajo en periodos según la frecuencia del cliente
 * y mantiene los estados de cobro y saldo pendiente actualizados sin duplicaciones.
 */

export function calculatePeriodRangeForDate(
  dateStr: string,
  frequency: Client['billingFrequency'],
  anchorDateStr: string,
  customDays?: number
): { startDate: string; endDate: string } {
  switch (frequency) {
    case 'daily':
      return { startDate: dateStr, endDate: dateStr };
    case 'weekly':
      return getWeekRange(dateStr);
    case 'monthly':
      return getMonthRange(dateStr);
    case 'custom':
      return getCustomPeriodRange(dateStr, anchorDateStr || dateStr, customDays || 15);
    default:
      return { startDate: dateStr, endDate: dateStr };
  }
}

export function calculateDueDate(endDateStr: string, frequency: Client['billingFrequency']): string {
  switch (frequency) {
    case 'daily':
      return addDays(endDateStr, 1);
    case 'weekly':
      return addDays(endDateStr, 3);
    case 'monthly':
      return addDays(endDateStr, 7);
    case 'custom':
      return addDays(endDateStr, 3);
    default:
      return addDays(endDateStr, 3);
  }
}

/**
 * Genera o sincroniza los periodos de cobro a partir de los clientes, trabajos y pagos existentes.
 */
export function syncBillingPeriods(
  clients: Client[],
  workEntries: WorkEntry[],
  existingPeriods: BillingPeriod[],
  paymentItems: PaymentItem[]
): BillingPeriod[] {
  const today = getTodayFormatted();
  const periodMap = new Map<string, BillingPeriod>();

  // Cargar periodos existentes
  existingPeriods.forEach(p => periodMap.set(p.id, { ...p, workEntryIds: [], totalHours: 0, totalAmount: 0 }));

  const clientMap = new Map<string, Client>(clients.map(c => [c.id, c]));

  // Agrupar trabajos por cliente y periodo
  workEntries.forEach(entry => {
    const client = clientMap.get(entry.clientId);
    if (!client) return;

    const range = calculatePeriodRangeForDate(
      entry.date,
      client.billingFrequency,
      client.billingStartDate || entry.date,
      client.customBillingDays
    );

    // ID determinista de periodo para ese cliente y rango
    const periodId = `bp_${client.id}_${range.startDate}_${range.endDate}`;
    
    let period = periodMap.get(periodId);
    if (!period) {
      period = {
        id: periodId,
        clientId: client.id,
        startDate: range.startDate,
        endDate: range.endDate,
        frequency: client.billingFrequency,
        workEntryIds: [],
        totalHours: 0,
        totalAmount: 0,
        paidAmount: 0,
        status: 'open',
        dueDate: calculateDueDate(range.endDate, client.billingFrequency),
        createdAt: entry.createdAt || today,
      };
      periodMap.set(periodId, period);
    }

    period.workEntryIds.push(entry.id);
    period.totalHours = Math.round((period.totalHours + entry.hours) * 100) / 100;
    const entryTotal = entry.totalAmount ?? entry.amount;
    period.totalAmount = addMoney(period.totalAmount, entryTotal);
  });

  // Calcular importe pagado para cada periodo desde PaymentItems
  const paidAmountsByPeriod = new Map<string, number>();
  paymentItems.forEach(item => {
    const current = paidAmountsByPeriod.get(item.billingPeriodId) || 0;
    paidAmountsByPeriod.set(item.billingPeriodId, addMoney(current, item.amount));
  });

  // Actualizar estados de cada periodo
  const finalPeriods: BillingPeriod[] = [];

  periodMap.forEach(period => {
    // Si no tiene trabajos asociados ni pagos, se descarta si es dinámico y vacío
    if (period.workEntryIds.length === 0 && !paidAmountsByPeriod.has(period.id)) {
      return;
    }

    const paid = paidAmountsByPeriod.get(period.id) || 0;
    period.paidAmount = paid;

    let nextStatus: BillingStatus = period.status;

    if (period.totalAmount > 0 && paid >= period.totalAmount) {
      nextStatus = 'paid';
    } else if (paid > 0 && paid < period.totalAmount) {
      nextStatus = 'partial_payment';
    } else if (period.status === 'sent') {
      if (today > period.dueDate) {
        nextStatus = 'overdue';
      } else {
        nextStatus = 'sent';
      }
    } else if (period.endDate <= today) {
      if (today > period.dueDate && nextStatus !== 'sent') {
        nextStatus = 'overdue';
      } else if (nextStatus === 'open') {
        nextStatus = 'pending_send';
      }
    } else {
      nextStatus = 'open';
    }

    period.status = nextStatus;
    finalPeriods.push(period);
  });

  // Ordenar periodos por fecha de inicio descendente
  return finalPeriods.sort((a, b) => b.startDate.localeCompare(a.startDate));
}
