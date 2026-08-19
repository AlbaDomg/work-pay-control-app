import { BillingPeriod, Client, Collaborator, Payment, PaymentItem, UserProfile, WorkEntry } from '../types';
import { INITIAL_CLIENTS, INITIAL_PAYMENTS, INITIAL_PAYMENT_ITEMS, INITIAL_WORK_ENTRIES } from './mockData';

const STORAGE_KEYS = {
  CLIENTS: 'control_pagos_clients_v1',
  WORK_ENTRIES: 'control_pagos_work_entries_v1',
  BILLING_PERIODS: 'control_pagos_billing_periods_v1',
  PAYMENTS: 'control_pagos_payments_v1',
  PAYMENT_ITEMS: 'control_pagos_payment_items_v1',
  USER_PROFILE: 'control_pagos_user_profile_v1',
  COLLABORATORS: 'control_pagos_collaborators_v1',
};

const DEFAULT_USER_PROFILE: UserProfile = {
  mainWorkerName: '',
  isConfigured: false,
};

export function loadUserProfileFromStorage(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading user profile:', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function loadCollaboratorsFromStorage(): Collaborator[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLABORATORS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading collaborators:', err);
    return [];
  }
}

export function saveCollaboratorsToStorage(collaborators: Collaborator[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLABORATORS, JSON.stringify(collaborators));
  } catch (err) {
    console.error('Error saving collaborators:', err);
  }
}

export function loadClientsFromStorage(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      saveClientsToStorage(INITIAL_CLIENTS);
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading clients from storage:', err);
    return INITIAL_CLIENTS;
  }
}

export function saveClientsToStorage(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients to storage:', err);
  }
}

export function loadWorkEntriesFromStorage(): WorkEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORK_ENTRIES);
    if (!raw) {
      saveWorkEntriesToStorage(INITIAL_WORK_ENTRIES);
      return INITIAL_WORK_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading work entries from storage:', err);
    return INITIAL_WORK_ENTRIES;
  }
}

export function saveWorkEntriesToStorage(entries: WorkEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving work entries to storage:', err);
  }
}

export function loadBillingPeriodsFromStorage(): BillingPeriod[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILLING_PERIODS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading billing periods from storage:', err);
    return [];
  }
}

export function saveBillingPeriodsToStorage(periods: BillingPeriod[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BILLING_PERIODS, JSON.stringify(periods));
  } catch (err) {
    console.error('Error saving billing periods to storage:', err);
  }
}

export function loadPaymentsFromStorage(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      savePaymentsToStorage(INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading payments from storage:', err);
    return INITIAL_PAYMENTS;
  }
}

export function savePaymentsToStorage(payments: Payment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (err) {
    console.error('Error saving payments to storage:', err);
  }
}

export function loadPaymentItemsFromStorage(): PaymentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_ITEMS);
    if (!raw) {
      savePaymentItemsToStorage(INITIAL_PAYMENT_ITEMS);
      return INITIAL_PAYMENT_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading payment items from storage:', err);
    return INITIAL_PAYMENT_ITEMS;
  }
}

export function savePaymentItemsToStorage(items: PaymentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving payment items to storage:', err);
  }
}

export function exportBackupJSON(): string {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userProfile: loadUserProfileFromStorage(),
    collaborators: loadCollaboratorsFromStorage(),
    clients: loadClientsFromStorage(),
    workEntries: loadWorkEntriesFromStorage(),
    billingPeriods: loadBillingPeriodsFromStorage(),
    payments: loadPaymentsFromStorage(),
    paymentItems: loadPaymentItemsFromStorage(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.userProfile) saveUserProfileToStorage(data.userProfile);
    if (data.collaborators) saveCollaboratorsToStorage(data.collaborators);
    if (data.clients) saveClientsToStorage(data.clients);
    if (data.workEntries) saveWorkEntriesToStorage(data.workEntries);
    if (data.billingPeriods) saveBillingPeriodsToStorage(data.billingPeriods);
    if (data.payments) savePaymentsToStorage(data.payments);
    if (data.paymentItems) savePaymentItemsToStorage(data.paymentItems);
    return true;
  } catch (err) {
    console.error('Error importing backup:', err);
    return false;
  }
}

export function resetToDemoData(): void {
  saveClientsToStorage([]);
  saveWorkEntriesToStorage([]);
  saveBillingPeriodsToStorage([]);
  savePaymentsToStorage([]);
  savePaymentItemsToStorage([]);
}

export function clearAllData(): void {
  saveClientsToStorage([]);
  saveWorkEntriesToStorage([]);
  saveBillingPeriodsToStorage([]);
  savePaymentsToStorage([]);
  savePaymentItemsToStorage([]);
  saveCollaboratorsToStorage([]);
}
