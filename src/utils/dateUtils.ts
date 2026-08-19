/**
 * Utilidades de cálculo y formateo de fechas
 */

export function getTodayFormatted(): string {
  const d = new Date();
  return formatDateToISO(d);
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateSpanish(dateStr: string, options: { short?: boolean; includeYear?: boolean } = {}): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  if (options.short) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return options.includeYear ? `${day}/${month}/${d.getFullYear()}` : `${day}/${month}`;
  }
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: options.includeYear !== false ? 'numeric' : undefined,
  });
}

export function getMonthName(dateStr: string): string {
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export function addDays(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateToISO(d);
}

export function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseISODate(dateStr1);
  const d2 = parseISODate(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

/**
 * Calcula las horas netas considerando hora de inicio, hora de fin y minutos de descanso.
 * Soporta tramos que cruzan la medianoche (ej: 22:00 a 02:00 -> 4h).
 */
export function calculateHoursFromTimeRange(startTime: string, endTime: string, breakMinutes: number = 0): number {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startTotalM = startH * 60 + startM;
  let endTotalM = endH * 60 + endM;

  // Si hora de fin es menor que hora de inicio, cruzó la medianoche
  if (endTotalM < startTotalM) {
    endTotalM += 24 * 60;
  }

  const durationMinutes = endTotalM - startTotalM - breakMinutes;
  if (durationMinutes <= 0) return 0;

  // Retornar en formato horas con 2 decimales
  return Math.round((durationMinutes / 60) * 100) / 100;
}

/**
 * Obtiene el rango [inicio, fin] de la semana ISO (Lunes a Domingo) que contiene la fecha dada.
 */
export function getWeekRange(dateStr: string): { startDate: string; endDate: string } {
  const d = parseISODate(dateStr);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDateToISO(monday),
    endDate: formatDateToISO(sunday),
  };
}

/**
 * Obtiene el rango [inicio, fin] del mes calendario que contiene la fecha dada.
 */
export function getMonthRange(dateStr: string): { startDate: string; endDate: string } {
  const [year, month] = dateStr.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  return {
    startDate: formatDateToISO(firstDay),
    endDate: formatDateToISO(lastDay),
  };
}

/**
 * Obtiene el rango [inicio, fin] para un periodo personalizado de X días partiendo de ancla `billingStartDate`.
 */
export function getCustomPeriodRange(dateStr: string, anchorDateStr: string, customDays: number): { startDate: string; endDate: string } {
  if (!customDays || customDays <= 0) {
    return { startDate: dateStr, endDate: dateStr };
  }

  const anchor = parseISODate(anchorDateStr);
  const target = parseISODate(dateStr);

  const diffMs = target.getTime() - anchor.getTime();
  const diffDaysCount = Math.floor(diffMs / (1000 * 3600 * 24));

  let cycleIndex = 0;
  if (diffDaysCount >= 0) {
    cycleIndex = Math.floor(diffDaysCount / customDays);
  } else {
    cycleIndex = Math.floor(diffDaysCount / customDays);
  }

  const periodStart = new Date(anchor);
  periodStart.setDate(anchor.getDate() + cycleIndex * customDays);

  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + customDays - 1);

  return {
    startDate: formatDateToISO(periodStart),
    endDate: formatDateToISO(periodEnd),
  };
}

/**
 * Comprueba si dateStr está en el rango [startDate, endDate] inclusive
 */
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  return dateStr >= startDate && dateStr <= endDate;
}
