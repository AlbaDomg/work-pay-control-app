import { BillingPeriod, Client, MessageTone, WorkEntry } from '../types';
import { formatDateSpanish, getMonthName } from '../utils/dateUtils';
import { formatCurrency, formatHours, subtractMoney } from './moneyEngine';

/**
 * Motor de Generación Automática de Mensajes de Cobro
 */

export interface MessageGenerationParams {
  client: Client;
  period: BillingPeriod;
  workEntries: WorkEntry[];
  tone: MessageTone;
}

function formatEntryBreakdown(entry: WorkEntry, currency: string): string {
  const dateFormatted = formatDateSpanish(entry.date, { short: true });
  const entryTotal = entry.totalAmount ?? entry.amount;
  const desc = entry.description ? ` (${entry.description})` : '';

  const hasCollabs = entry.collaborators && entry.collaborators.length > 0;
  const hasMaterials = Boolean(entry.materialCost && entry.materialCost > 0);

  if (hasCollabs || hasMaterials) {
    const lines: string[] = [];

    if (hasCollabs) {
      const mainWorker = entry.mainWorkerName || 'Trabajador principal';
      lines.push(`• ${mainWorker}: ${formatHours(entry.hours)} × ${formatCurrency(entry.hourlyRate, currency)}/h = ${formatCurrency(entry.amount, currency)}`);
      
      entry.collaborators!.forEach(c => {
        const cHours = Number(c.hours) || 0;
        const rawRate = Number(c.hourlyRate) || 0;
        const cRate = rawRate > 0 ? rawRate : (cHours > 0 && c.amount > 0 ? c.amount / cHours : 0);
        const cName = c.name || 'Ayudante';
        lines.push(`• ${cName} (Ayudante): ${formatHours(cHours)} × ${formatCurrency(cRate, currency)}/h = ${formatCurrency(c.amount, currency)}`);
      });
    } else {
      const mainWorkerPrefix = entry.mainWorkerName ? `${entry.mainWorkerName}: ` : '';
      lines.push(`• Mano de obra (${mainWorkerPrefix}${formatHours(entry.hours)} × ${formatCurrency(entry.hourlyRate, currency)}/h): ${formatCurrency(entry.amount, currency)}`);
    }

    if (hasMaterials) {
      if (entry.materials && entry.materials.length > 0) {
        lines.push(`• Materiales comprados:`);
        entry.materials.forEach(m => {
          lines.push(`  - ${m.name}: ${formatCurrency(m.cost, currency)}`);
        });
        const matTotal = entry.materialCost ?? entry.materials.reduce((s, m) => s + (Number(m.cost) || 0), 0);
        lines.push(`  (Total materiales: ${formatCurrency(matTotal, currency)})`);
      } else {
        lines.push(`• Materiales: ${formatCurrency(entry.materialCost!, currency)}`);
      }
    }

    return `${dateFormatted}${desc}:\n${lines.join('\n')}\n  Subtotal día: ${formatCurrency(entryTotal, currency)}`;
  }

  const mainWorkerPrefix = entry.mainWorkerName ? `${entry.mainWorkerName}: ` : '';
  return `${dateFormatted} — ${mainWorkerPrefix}${formatHours(entry.hours)} × ${formatCurrency(entry.hourlyRate, currency)}/h = ${formatCurrency(entry.amount, currency)}${desc}`;
}

export function generateBillingMessage(params: MessageGenerationParams): string {
  const { client, period, workEntries, tone } = params;
  const currency = client.currency || 'EUR';
  const pendingAmount = subtractMoney(period.totalAmount, period.paidAmount);
  const clientName = client.name.split(' ')[0]; // Nombre de pila

  // Ordenar entradas por fecha
  const sortedEntries = [...workEntries].sort((a, b) => a.date.localeCompare(b.date));

  // Tono Recordatorio o 2º Recordatorio
  if (tone === 'reminder') {
    return `Hola ${clientName},

Te escribo para recordarte que sigue pendiente el pago correspondiente al periodo del ${formatDateSpanish(period.startDate, { short: true, includeYear: true })} al ${formatDateSpanish(period.endDate, { short: true, includeYear: true })}.

Importe pendiente: ${formatCurrency(pendingAmount, currency)}.

Cuando puedas, agradecería que realizaras el pago.

Gracias.`;
  }

  if (tone === 'second_reminder') {
    return `Hola ${clientName},

Te contacto de nuevo respecto a la solicitud de pago pendiente del periodo ${formatDateSpanish(period.startDate, { short: true, includeYear: true })} al ${formatDateSpanish(period.endDate, { short: true, includeYear: true })}.

Importe pendiente: ${formatCurrency(pendingAmount, currency)}.

Por favor, avísame cuando realices el pago o transferencia para confirmar la recepción.

Un saludo.`;
  }

  // Tono Informal vs Profesional
  const isProfessional = tone === 'professional';

  const entryListStr = sortedEntries.length > 0
    ? sortedEntries.map(e => formatEntryBreakdown(e, currency)).join('\n\n')
    : `${formatDateSpanish(period.startDate, { short: true })}: ${formatHours(period.totalHours)} = ${formatCurrency(period.totalAmount, currency)}`;

  // Frecuencia diaria
  if (client.billingFrequency === 'daily') {
    if (isProfessional) {
      return `Estimado/a ${client.name},

Adjunto le envío la liquidación del trabajo realizado hoy (${formatDateSpanish(period.startDate, { short: true, includeYear: true })}):

${entryListStr}

Total a abonar: ${formatCurrency(period.totalAmount, currency)}

Quedo a la espera de la confirmación del pago.

Atentamente.`;
    }

    return `Hola ${clientName},

Te paso las horas realizadas hoy (${formatDateSpanish(period.startDate, { short: true })}):

${entryListStr}

Total a abonar: ${formatCurrency(period.totalAmount, currency)}

Gracias.`;
  }

  // Frecuencia semanal
  if (client.billingFrequency === 'weekly') {
    if (isProfessional) {
      return `Estimado/a ${client.name},

Le presento el resumen de horas correspondientes a la semana del ${formatDateSpanish(period.startDate, { short: true })} al ${formatDateSpanish(period.endDate, { short: true, includeYear: true })}:

${entryListStr}

Total a abonar: ${formatCurrency(period.totalAmount, currency)}

Agradecería la tramitación del pago según la tarifa pactada.

Un cordial saludo.`;
    }

    return `Hola ${clientName},

Te paso el resumen de las horas realizadas esta semana (${formatDateSpanish(period.startDate, { short: true })} a ${formatDateSpanish(period.endDate, { short: true })}):

${entryListStr}

Total semanal: ${formatCurrency(period.totalAmount, currency)}

Gracias.`;
  }

  // Frecuencia mensual o personalizada
  const monthTitle = client.billingFrequency === 'monthly'
    ? getMonthName(period.startDate)
    : `periodo del ${formatDateSpanish(period.startDate, { short: true })} al ${formatDateSpanish(period.endDate, { short: true })}`;

  if (isProfessional) {
    return `Estimado/a ${client.name},

Adjunto le hago llegar el desglose de horas correspondientes al ${monthTitle}:

${entryListStr}

Resumen del periodo:
- Importe total a abonar: ${formatCurrency(period.totalAmount, currency)}

Quedo a su disposición para cualquier duda.

Atentamente.`;
  }

  return `Hola ${clientName},

Te paso el resumen de las horas realizadas durante ${monthTitle}:

${entryListStr}

Total del periodo: ${formatCurrency(period.totalAmount, currency)}

Gracias.`;
}
