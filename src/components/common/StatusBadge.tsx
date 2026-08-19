import React from 'react';
import { BillingStatus } from '../../types';

interface StatusBadgeProps {
  status: BillingStatus;
  customText?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customText }) => {
  const getBadgeInfo = () => {
    switch (status) {
      case 'open':
        return { label: customText || 'Abierto', className: 'badge-open' };
      case 'pending_send':
        return { label: customText || 'Pendiente enviar', className: 'badge-pending_send' };
      case 'sent':
        return { label: customText || 'Solicitud enviada', className: 'badge-sent' };
      case 'partial_payment':
        return { label: customText || 'Pago parcial', className: 'badge-partial_payment' };
      case 'paid':
        return { label: customText || 'Pagado', className: 'badge-paid' };
      case 'overdue':
        return { label: customText || 'Vencido', className: 'badge-overdue' };
      default:
        return { label: status, className: 'badge-open' };
    }
  };

  const { label, className } = getBadgeInfo();

  return <span className={`badge ${className}`}>{label}</span>;
};
