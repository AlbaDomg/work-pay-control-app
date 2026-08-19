import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { BillingCenterView } from './components/billing/BillingCenterView';
import { WorkEntryListView } from './components/work/WorkEntryListView';
import { ClientListView } from './components/clients/ClientListView';
import { CalendarView } from './components/calendar/CalendarView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';

import { WorkEntryModal } from './components/work/WorkEntryModal';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { PaymentModal } from './components/billing/PaymentModal';
import { MessageGeneratorModal } from './components/billing/MessageGeneratorModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { WelcomeModal } from './components/common/WelcomeModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'billing':
        return <BillingCenterView />;
      case 'work':
        return <WorkEntryListView />;
      case 'clients':
        return <ClientListView />;
      case 'calendar':
        return <CalendarView />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-wrapper">{renderTabContent()}</main>
        <BottomNav />
      </div>

      {/* Global Modals & Notifications */}
      <WelcomeModal />
      <WorkEntryModal />
      <ClientFormModal />
      <PaymentModal />
      <MessageGeneratorModal />
      <ConfirmModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
