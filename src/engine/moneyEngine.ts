/**
 * Motor de Precisión Monetaria
 * Evita fallos de redondeo de punto flotante típicos en JavaScript (0.1 + 0.2 != 0.3)
 */

export function roundMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function addMoney(a: number, b: number): number {
  return roundMoney(roundMoney(a) + roundMoney(b));
}

export function subtractMoney(a: number, b: number): number {
  return roundMoney(roundMoney(a) - roundMoney(b));
}

export function multiplyMoney(amount: number, factor: number): number {
  return roundMoney(roundMoney(amount) * factor);
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const safeAmount = roundMoney(amount);
  const formattedNumber = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  switch (currency.toUpperCase()) {
    case 'EUR':
      return `${formattedNumber} €`;
    case 'USD':
      return `$${formattedNumber}`;
    case 'GBP':
      return `£${formattedNumber}`;
    case 'MXN':
      return `$${formattedNumber} MXN`;
    case 'ARS':
      return `$${formattedNumber} ARS`;
    case 'CLP':
      return `$${formattedNumber} CLP`;
    case 'COP':
      return `$${formattedNumber} COP`;
    case 'PEN':
      return `S/ ${formattedNumber}`;
    default:
      return `${formattedNumber} ${currency}`;
  }
}

export function formatHours(hours: number): string {
  const safeHours = Math.round((hours + Number.EPSILON) * 100) / 100;
  const formattedNumber = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 2,
  }).format(safeHours);
  return `${formattedNumber} h`;
}
