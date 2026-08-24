export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type BillingStatus = 
  | 'open'
  | 'pending_send'
  | 'sent'
  | 'partial_payment'
  | 'paid'
  | 'overdue';

export type PaymentMethod = 'bank_transfer' | 'cash' | 'bizum' | 'other';

export type MessageTone = 'informal' | 'professional' | 'reminder' | 'second_reminder';

export type DateFilterRange = 
  | 'today'
  | 'week'
  | 'month'
  | 'last_month'
  | 'year'
  | 'custom';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  hourlyRate: number;
  currency: string; // e.g. 'EUR', 'USD'
  billingFrequency: BillingFrequency;
  customBillingDays?: number;
  billingStartDate: string; // YYYY-MM-DD
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface WorkEntryCollaborator {
  id: string;
  name: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  isCustom?: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  phone?: string;
  defaultHourlyRate: number;
  notes?: string;
}

export interface UserProfile {
  mainWorkerName: string;
  isConfigured?: boolean;
}

export interface WorkEntry {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  breakMinutes: number;
  hours: number; // Horas trabajador principal
  hourlyRate: number; // Tarifa inmutable del principal
  amount: number; // Importe principal (hours * hourlyRate)
  mainWorkerName?: string; // Nombre real del principal
  collaborators?: WorkEntryCollaborator[]; // Lista de ayudantes
  materialCost?: number; // Gasto en compra de materiales
  totalAmount?: number; // Importe total cobrado al cliente (Principal + Ayudantes + Materiales)
  description?: string;
  createdAt: string;
}

export interface BillingPeriod {
  id: string;
  clientId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  frequency: BillingFrequency;
  workEntryIds: string[];
  totalHours: number;
  totalAmount: number;
  paidAmount: number;
  status: BillingStatus;
  dueDate: string; // YYYY-MM-DD
  sentAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface PaymentItem {
  id: string;
  paymentId: string;
  billingPeriodId: string;
  amount: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  tone: MessageTone;
  contentPattern: string;
}

export interface AppStats {
  totalGenerated: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  totalHours: number;
  activeClientsCount: number;
  prevMonthGenerated: number;
  currentMonthGenerated: number;
  growthPercentage: number;
  averageHourlyRate: number;
}
