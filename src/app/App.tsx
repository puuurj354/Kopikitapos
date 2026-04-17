import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { POSView } from './pages/POSView';
import { OrdersView } from './pages/OrdersView';
import { MenuManagementView } from './pages/MenuManagementView';
import { ReportsView } from './pages/ReportsView';
import { StaffView } from './pages/StaffView';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import type { ViewType } from './types/pos';

// Views only accessible to admin
const ADMIN_ONLY_VIEWS: ViewType[] = ['dashboard', 'menu', 'reports', 'staff'];

function MainContent() {
  const { currentView, setCurrentView } = usePOS();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Guard: redirect barista away from admin-only views
  const isBlocked = !isAdmin && ADMIN_ONLY_VIEWS.includes(currentView);
  const safeView: ViewType = isBlocked ? 'pos' : currentView;

  if (isBlocked) {
    // Silently correct the view
    setCurrentView('pos');
  }

  return (
    <div className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 bg-[#FAFAFA] min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={safeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {safeView === 'dashboard' && <DashboardView />}
          {safeView === 'pos' && <POSView />}
          {safeView === 'orders' && <OrdersView />}
          {safeView === 'menu' && <MenuManagementView />}
          {safeView === 'reports' && <ReportsView />}
          {safeView === 'staff' && <StaffView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function POSApp() {
  const { user } = useAuth();
  const initialView: ViewType = user?.role === 'admin' ? 'dashboard' : 'pos';

  return (
    <POSProvider initialView={initialView}>
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <Sidebar />
        <MainContent />
      </div>
    </POSProvider>
  );
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isAuthenticated) {
    return <POSApp />;
  }

  if (showAuth) {
    return <AuthPage />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
