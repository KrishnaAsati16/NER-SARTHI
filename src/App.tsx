import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { AIChatbot } from './components/chat/AIChatbot';
import { EmergencyAlertBanner } from './components/alerts/EmergencyAlertBanner';

import { DashboardPage } from './pages/DashboardPage';
import { RouteIntelligencePage } from './pages/RouteIntelligencePage';
import { LogisticsPlannerPage } from './pages/LogisticsPlannerPage';
import { OfficersPage } from './pages/OfficersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExplorePage } from './pages/ExplorePage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { activeTab, theme } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'routes':
        return <RouteIntelligencePage />;
      case 'logistics':
        return <LogisticsPlannerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'explore':
        return <ExplorePage />;
      case 'login':
      case 'subscribe':
        return <LoginPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white'
        : 'bg-slate-100 text-slate-900 selection:bg-cyan-600 selection:text-white'
    }`}>
      {/* Top Header with Operational Modules Navbar, Language Selector, & Notification Center */}
      <Header />

      {/* Floating Emergency Alert Banner */}
      <EmergencyAlertBanner />

      {/* Main Full-Width Content Container */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-8 overflow-x-hidden">
        <MobileNav />
        <main className="mt-2 lg:mt-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
