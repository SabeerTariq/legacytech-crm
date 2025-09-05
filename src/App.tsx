
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AuthProvider } from './contexts/AuthContextJWT';
import { PermissionProvider } from './contexts/PermissionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import { FrontSellerDashboard } from './pages/dashboard/FrontSellerDashboard';
import { UpsellerDashboard } from './pages/dashboard/UpsellerDashboard';
import EnhancedMessages from './pages/EnhancedMessages';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import SalesForm from './pages/SalesForm';
import Upsell from './pages/sales/Upsell';
import RecurringServices from './pages/RecurringServices';
import RecurringServiceDetail from './pages/RecurringServiceDetail';
import Kanban from './pages/Kanban';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import CustomerPaymentDetails from './pages/CustomerPaymentDetails';
import Settings from './pages/Settings';
import BetterAskSaul from './pages/BetterAskSaul';
import MarketingAutomation from './pages/MarketingAutomation';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Employees from './pages/hr/Employees';
import AllProjects from './pages/projects/AllProjects';
import MyProjects from './pages/projects/MyProjects';
import ProjectAssignment from './pages/projects/ProjectAssignment';
import ProjectDetail from './pages/projects/ProjectDetail';
import Development from './pages/departments/Development';
import FrontSales from './pages/departments/FrontSales';
import HR from './pages/departments/HR';
import Marketing from './pages/departments/Marketing';
import Other from './pages/departments/Other';
import Production from './pages/departments/Production';
import Upseller from './pages/departments/Upseller';
import FrontSalesManagement from './pages/management/FrontSalesManagement';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import UpsellerManagement from './pages/admin/UpsellerManagement';
import CustomerProfile from './pages/CustomerProfile';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <PermissionProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <RoleBasedRedirect>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </RoleBasedRedirect>
                  </ProtectedRoute>
                } />
                <Route path="/front-seller-dashboard" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <FrontSellerDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/upseller-dashboard" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UpsellerDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <EnhancedMessages />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Customers />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/leads" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Leads />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/sales-form" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SalesForm />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/upsell" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Upsell />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recurring-services" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RecurringServices />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recurring-service/:id" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RecurringServiceDetail />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/kanban" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Kanban />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Calendar />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Documents />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/payments" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Payments />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/payments/customer/:customerName" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CustomerPaymentDetails />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/better-ask-saul" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BetterAskSaul />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/automation" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MarketingAutomation />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/index" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Index />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/hr/employees" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Employees />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/projects" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AllProjects />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/projects/my-projects" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MyProjects />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/projects/assignment" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProjectAssignment />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/project/:id" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProjectDetail />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/development" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Development />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/front-sales" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <FrontSales />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/hr" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <HR />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/marketing" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Marketing />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/other" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Other />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/production" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Production />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/departments/upseller" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Upseller />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/front-sales-management" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <FrontSalesManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/roles" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RoleManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/upseller-management" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UpsellerManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/:id" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CustomerProfile />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PermissionProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
