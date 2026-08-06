import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../features/auth/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy loading views
const Login = lazy(() => import('../features/auth/Login'));
const DashboardHome = lazy(() => import('../features/dashboard/DashboardHome'));

// Assets Module
const ComputersList = lazy(() => import('../features/computers/ComputersList'));
const ComputerDetail = lazy(() => import('../features/computers/ComputerDetail'));
const NetworkDevicesList = lazy(() => import('../features/network/NetworkDevicesList'));
const ConsumablesList = lazy(() => import('../features/consumables/ConsumablesList'));
const SoftwareList = lazy(() => import('../features/software/SoftwareList'));

// Operations Module
const MaintenanceJobsList = lazy(() => import('../features/maintenance/MaintenanceJobsList'));
const TicketsList = lazy(() => import('../features/maintenance/TicketsList'));
const IncidentsList = lazy(() => import('../features/maintenance/IncidentsList'));

// Network Module
const TopologyMap = lazy(() => import('../features/network/TopologyMap'));
const IpamList = lazy(() => import('../features/network/IpamList'));
const VlanList = lazy(() => import('../features/network/VlanList'));
const DhcpScopesList = lazy(() => import('../features/network/DhcpScopesList'));
const DnsRecordsList = lazy(() => import('../features/network/DnsRecordsList'));
const SwitchPortsList = lazy(() => import('../features/network/SwitchPortsList'));

// General Module
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));

// Loading spinner fallback
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
    <div className="relative w-12 h-12">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-sky-200 dark:border-sky-950 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

// Protected Route Wrapper for Auth & RBAC
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected dashboard views */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home */}
            <Route index element={<DashboardHome />} />

            <Route path="computers" element={<ComputersList />} />
            <Route path="computers/:id" element={<ComputerDetail />} />
            
            <Route 
              path="network/devices" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <NetworkDevicesList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="consumables" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran']}>
                  <ConsumablesList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="software" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <SoftwareList />
                </ProtectedRoute>
              } 
            />

            {/* Operations Group */}
            <Route 
              path="maintenance/jobs" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Teknisi']}>
                  <MaintenanceJobsList />
                </ProtectedRoute>
              } 
            />
            <Route path="maintenance/tickets" element={<TicketsList />} />
            <Route 
              path="maintenance/incidents" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Teknisi']}>
                  <IncidentsList />
                </ProtectedRoute>
              } 
            />

            {/* Network Group */}
            <Route 
              path="network/topology" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <TopologyMap />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="network/ipam" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <IpamList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="network/vlan" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <VlanList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="network/dhcp" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <DhcpScopesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="network/dns" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <DnsRecordsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="network/ports" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <SwitchPortsList />
                </ProtectedRoute>
              } 
            />

            {/* General Group */}
            <Route 
              path="reports" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Laboran', 'Teknisi']}>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
export default AppRouter;
