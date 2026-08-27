import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncBillingPeriods } from '../engine/billingEngine';
import {
  exportBackupJSON,
  importBackupJSON,
  loadClientsFromStorage,
  loadCollaboratorsFromStorage,
  loadPaymentItemsFromStorage,
  loadPaymentsFromStorage,
  loadUserProfileFromStorage,
  loadWorkEntriesFromStorage,
  resetToDemoData,
  saveClientsToStorage,
  saveCollaboratorsToStorage,
  savePaymentItemsToStorage,
  savePaymentsToStorage,
  saveUserProfileToStorage,
  saveWorkEntriesToStorage,
} from '../services/storage';
import {
  BillingPeriod,
  Client,
  Collaborator,
  DateFilterRange,
  Payment,
  PaymentItem,
  PaymentMethod,
  UserProfile,
  WorkEntry,
  WorkEntryCollaborator,
} from '../types';
import { getTodayFormatted } from '../utils/dateUtils';
import { subtractMoney } from '../engine/moneyEngine';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // State
  clients: Client[];
  workEntries: WorkEntry[];
  billingPeriods: BillingPeriod[];
  payments: Payment[];
  paymentItems: PaymentItem[];
  collaborators: Collaborator[];
  userProfile: UserProfile;
  activeTab: string;
  dateFilter: DateFilterRange;
  customDateRange: { startDate: string; endDate: string };
  selectedClientId: string | null;
  toasts: Toast[];

  // Modals state
  isWorkModalOpen: boolean;
  editingWorkEntry: WorkEntry | null;
  isClientModalOpen: boolean;
  editingClient: Client | null;
  isPaymentModalOpen: boolean;
  selectedPeriodForPayment: BillingPeriod | null;
  isMessageModalOpen: boolean;
  selectedPeriodForMessage: BillingPeriod | null;
  confirmModal: { isOpen: boolean; title: string; message: string; onConfirm: () => void } | null;

  // Actions
  setActiveTab: (tab: string) => void;
  setDateFilter: (filter: DateFilterRange) => void;
  setCustomDateRange: (range: { startDate: string; endDate: string }) => void;
  setSelectedClientId: (id: string | null) => void;
  
  // Toast actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Modals actions
  openWorkModal: (entry?: WorkEntry | null, defaultClientId?: string) => void;
  closeWorkModal: () => void;
  openClientModal: (client?: Client | null) => void;
  closeClientModal: () => void;
  openPaymentModal: (period?: BillingPeriod | null) => void;
  closePaymentModal: () => void;
  openMessageModal: (period: BillingPeriod) => void;
  closeMessageModal: () => void;
  showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmModal: () => void;

  // Domain Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  saveCollaborator: (collabData: Partial<Collaborator>) => void;
  deleteCollaborator: (collabId: string) => void;

  saveClient: (clientData: Partial<Client>) => void;
  toggleClientActive: (clientId: string) => void;
  deleteClient: (clientId: string) => void;

  saveWorkEntry: (entryData: Partial<WorkEntry>) => void;
  deleteWorkEntry: (entryId: string) => void;

  recordPayment: (paymentData: {
    clientId: string;
    billingPeriodId?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;

  updatePeriodStatus: (periodId: string, status: BillingPeriod['status']) => void;

  resetDemoData: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ mainWorkerName: 'Juan' });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilterRange>('month');
  const [customDateRange, setCustomDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: getTodayFormatted(),
    endDate: getTodayFormatted(),
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals state
  const [isWorkModalOpen, setIsWorkModalOpen] = useState<boolean>(false);
  const [editingWorkEntry, setEditingWorkEntry] = useState<WorkEntry | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedPeriodForPayment, setSelectedPeriodForPayment] = useState<BillingPeriod | null>(null);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  const [selectedPeriodForMessage, setSelectedPeriodForMessage] = useState<BillingPeriod | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    setClients(loadClientsFromStorage());
    setWorkEntries(loadWorkEntriesFromStorage());
    setPayments(loadPaymentsFromStorage());
    setPaymentItems(loadPaymentItemsFromStorage());
    setCollaborators(loadCollaboratorsFromStorage());
    setUserProfile(loadUserProfileFromStorage());
  }, []);

  // Sincronizar periodos de cobro automáticamente cuando cambian los trabajos, clientes o pagos
  useEffect(() => {
    const synced = syncBillingPeriods(clients, workEntries, billingPeriods, paymentItems);
    setBillingPeriods(synced);
  }, [clients, workEntries, paymentItems]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Modals helpers
  const openWorkModal = (entry?: WorkEntry | null) => {
    setEditingWorkEntry(entry || null);
    setIsWorkModalOpen(true);
  };

  const closeWorkModal = () => {
    setIsWorkModalOpen(false);
    setEditingWorkEntry(null);
  };

  const openClientModal = (client?: Client | null) => {
    setEditingClient(client || null);
    setIsClientModalOpen(true);
  };

  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const openPaymentModal = (period?: BillingPeriod | null) => {
    setSelectedPeriodForPayment(period || null);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPeriodForPayment(null);
  };

  const openMessageModal = (period: BillingPeriod) => {
    setSelectedPeriodForMessage(period);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedPeriodForMessage(null);
  };

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirmModal();
      },
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  // --- ACCIONES DE PERFIL Y AYUDANTES ---
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    saveUserProfileToStorage(updated);
    showToast('Perfil actualizado correctamente.');
  };

  const saveCollaborator = (collabData: Partial<Collaborator>) => {
    let updated: Collaborator[];
    if (collabData.id) {
      updated = collaborators.map(c => (c.id === collabData.id ? { ...c, ...collabData } as Collaborator : c));
      showToast(`Ayudante "${collabData.name}" actualizado.`);
    } else {
      const newCollab: Collaborator = {
        id: `collab_${Date.now()}`,
        name: collabData.name || 'Nuevo Ayudante',
        phone: collabData.phone || '',
        defaultHourlyRate: collabData.defaultHourlyRate || 15,
        notes: collabData.notes || '',
      };
      updated = [...collaborators, newCollab];
      showToast(`Ayudante "${newCollab.name}" añadido.`);
    }
    setCollaborators(updated);
    saveCollaboratorsToStorage(updated);
  };

  const deleteCollaborator = (collabId: string) => {
    const updated = collaborators.filter(c => c.id !== collabId);
    setCollaborators(updated);
    saveCollaboratorsToStorage(updated);
    showToast('Ayudante eliminado.', 'info');
  };

  // --- ACCIONES DE CLIENTE ---
  const saveClient = (clientData: Partial<Client>) => {
    let updatedClients: Client[];
    if (clientData.id) {
      updatedClients = clients.map(c => (c.id === clientData.id ? { ...c, ...clientData } as Client : c));
      showToast(`Cliente "${clientData.name}" actualizado correctamente.`);
    } else {
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: clientData.name || 'Nuevo Cliente',
        company: clientData.company || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        hourlyRate: clientData.hourlyRate || 20,
        currency: clientData.currency || 'EUR',
        billingFrequency: clientData.billingFrequency || 'monthly',
        customBillingDays: clientData.customBillingDays,
        billingStartDate: clientData.billingStartDate || getTodayFormatted(),
        notes: clientData.notes || '',
        active: true,
        createdAt: getTodayFormatted(),
      };
      updatedClients = [...clients, newClient];
      showToast(`Cliente "${newClient.name}" creado con éxito.`);
    }
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    closeClientModal();
  };

  const toggleClientActive = (clientId: string) => {
    const updated = clients.map(c => (c.id === clientId ? { ...c, active: !c.active } : c));
    setClients(updated);
    saveClientsToStorage(updated);
    const client = clients.find(c => c.id === clientId);
    showToast(`Cliente ${client?.name} ${client?.active ? 'desactivado' : 'activado'}.`, 'info');
  };

  const deleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const updated = clients.filter(c => c.id !== clientId);
    setClients(updated);
    saveClientsToStorage(updated);
    showToast(`Cliente "${client?.name}" eliminado.`, 'info');
  };

  // --- ACCIONES DE REGISTRO DE TRABAJO ---
  const saveWorkEntry = (entryData: Partial<WorkEntry>) => {
    if (!entryData.clientId) {
      showToast('Selecciona un cliente válido.', 'error');
      return;
    }

    const client = clients.find(c => c.id === entryData.clientId);
    if (!client) {
      showToast('Cliente no encontrado.', 'error');
      return;
    }

    const hourlyRate = entryData.hourlyRate !== undefined ? entryData.hourlyRate : client.hourlyRate;
    const hours = entryData.hours || 0;
    const mainWorkerAmount = Math.round(hours * hourlyRate * 100) / 100;
    const mainWorkerName = entryData.mainWorkerName || userProfile.mainWorkerName || 'Juan';

    const collaborators: WorkEntryCollaborator[] = (entryData.collaborators || []).map(c => {
      const cHours = Number(c.hours) || 0;
      let cRate = Number(c.hourlyRate) || 0;
      let cAmount = Number(c.amount) || 0;

      if (cAmount > 0 && cRate === 0 && cHours > 0) {
        cRate = Math.round((cAmount / cHours) * 100) / 100;
      } else if (cHours > 0 && cRate > 0 && cAmount === 0) {
        cAmount = Math.round(cHours * cRate * 100) / 100;
      } else if (cAmount > 0 && cHours > 0 && cRate === 0) {
        cRate = Math.round((cAmount / cHours) * 100) / 100;
      }

      return {
        ...c,
        hours: cHours,
        hourlyRate: cRate,
        amount: cAmount,
      };
    });

    const collabsTotalAmount = collaborators.reduce((sum, c) => sum + c.amount, 0);
    const materialCost = Math.round((Number(entryData.materialCost) || 0) * 100) / 100;
    const totalAmount = Math.round((mainWorkerAmount + collabsTotalAmount + materialCost) * 100) / 100;

    let updatedEntries: WorkEntry[];
    if (entryData.id) {
      updatedEntries = workEntries.map(w =>
        w.id === entryData.id
          ? ({
              ...w,
              ...entryData,
              hourlyRate,
              amount: mainWorkerAmount,
              mainWorkerName,
              collaborators,
              materialCost,
              totalAmount,
            } as WorkEntry)
          : w
      );
      showToast('Jornada de trabajo actualizada.');
    } else {
      const newEntry: WorkEntry = {
        id: `work_${Date.now()}`,
        clientId: entryData.clientId,
        date: entryData.date || getTodayFormatted(),
        startTime: entryData.startTime || '',
        endTime: entryData.endTime || '',
        breakMinutes: entryData.breakMinutes || 0,
        hours,
        hourlyRate,
        amount: mainWorkerAmount,
        mainWorkerName,
        collaborators,
        materialCost,
        materials: entryData.materials || [],
        totalAmount,
        description: entryData.description || '',
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [newEntry, ...workEntries];
      showToast(`Trabajo registrado: ${totalAmount} ${client.currency}`);
    }

    setWorkEntries(updatedEntries);
    saveWorkEntriesToStorage(updatedEntries);
    closeWorkModal();
  };

  const deleteWorkEntry = (entryId: string) => {
    const updated = workEntries.filter(w => w.id !== entryId);
    setWorkEntries(updated);
    saveWorkEntriesToStorage(updated);
    showToast('Registro de trabajo eliminado.', 'info');
  };

  // --- REGISTRO DE PAGOS ---
  const recordPayment = (paymentData: {
    clientId: string;
    billingPeriodId?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    if (paymentData.amount <= 0) {
      showToast('El importe del pago debe ser mayor que 0.', 'error');
      return;
    }

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      clientId: paymentData.clientId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes || '',
      createdAt: new Date().toISOString(),
    };

    const newPaymentItems: PaymentItem[] = [];

    if (paymentData.billingPeriodId) {
      newPaymentItems.push({
        id: `pi_${Date.now()}_1`,
        paymentId: newPayment.id,
        billingPeriodId: paymentData.billingPeriodId,
        amount: paymentData.amount,
      });
    } else {
      let remainingToAssign = paymentData.amount;
      const clientPendingPeriods = billingPeriods
        .filter(p => p.clientId === paymentData.clientId && p.status !== 'paid')
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

      let counter = 1;
      for (const period of clientPendingPeriods) {
        if (remainingToAssign <= 0) break;
        const periodPending = subtractMoney(period.totalAmount, period.paidAmount);
        const assignAmount = Math.min(remainingToAssign, periodPending);

        newPaymentItems.push({
          id: `pi_${Date.now()}_${counter++}`,
          paymentId: newPayment.id,
          billingPeriodId: period.id,
          amount: assignAmount,
        });

        remainingToAssign = subtractMoney(remainingToAssign, assignAmount);
      }
    }

    const updatedPayments = [newPayment, ...payments];
    const updatedItems = [...paymentItems, ...newPaymentItems];

    setPayments(updatedPayments);
    setPaymentItems(updatedItems);
    savePaymentsToStorage(updatedPayments);
    savePaymentItemsToStorage(updatedItems);

    showToast(`Pago de ${paymentData.amount} € registrado correctamente.`);
    closePaymentModal();
  };

  const updatePeriodStatus = (periodId: string, status: BillingPeriod['status']) => {
    setBillingPeriods(prev =>
      prev.map(p => (p.id === periodId ? { ...p, status, sentAt: status === 'sent' ? getTodayFormatted() : p.sentAt } : p))
    );
    showToast(`Estado del periodo actualizado a "${status}".`);
  };

  const resetDemoData = () => {
    resetToDemoData();
    setClients([]);
    setWorkEntries([]);
    setPayments([]);
    setPaymentItems([]);
    setBillingPeriods([]);
    showToast('Todos los datos han sido eliminados.', 'info');
  };

  const exportData = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_pagos_backup_${getTodayFormatted()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada.');
  };

  const importData = (jsonStr: string): boolean => {
    const ok = importBackupJSON(jsonStr);
    if (ok) {
      setClients(loadClientsFromStorage());
      setWorkEntries(loadWorkEntriesFromStorage());
      setPayments(loadPaymentsFromStorage());
      setPaymentItems(loadPaymentItemsFromStorage());
      setCollaborators(loadCollaboratorsFromStorage());
      setUserProfile(loadUserProfileFromStorage());
      showToast('Copia de seguridad importada con éxito.');
      return true;
    }
    showToast('Error al importar el archivo JSON.', 'error');
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        workEntries,
        billingPeriods,
        payments,
        paymentItems,
        collaborators,
        userProfile,
        activeTab,
        dateFilter,
        customDateRange,
        selectedClientId,
        toasts,
        isWorkModalOpen,
        editingWorkEntry,
        isClientModalOpen,
        editingClient,
        isPaymentModalOpen,
        selectedPeriodForPayment,
        isMessageModalOpen,
        selectedPeriodForMessage,
        confirmModal,
        setActiveTab,
        setDateFilter,
        setCustomDateRange,
        setSelectedClientId,
        showToast,
        removeToast,
        openWorkModal,
        closeWorkModal,
        openClientModal,
        closeClientModal,
        openPaymentModal,
        closePaymentModal,
        openMessageModal,
        closeMessageModal,
        showConfirmModal,
        closeConfirmModal,
        updateUserProfile,
        saveCollaborator,
        deleteCollaborator,
        saveClient,
        toggleClientActive,
        deleteClient,
        saveWorkEntry,
        deleteWorkEntry,
        recordPayment,
        updatePeriodStatus,
        resetDemoData,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
