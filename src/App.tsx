
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

// Auth Pages
import Login from "./pages/auth/Login";

// Admin Pages
import AdminUserManagement from "./pages/admin/UserManagement";
import RoleManagement from "./pages/admin/RoleManagement";

// Pages
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Messages from "./pages/Messages";
import SalesForm from "./pages/SalesForm";
import MarketingAutomation from "./pages/MarketingAutomation";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import CustomerProfile from "./pages/CustomerProfile";
import ProjectAssignment from "./pages/projects/ProjectAssignment";
import MyProjects from "./pages/projects/MyProjects";
import ProjectDetail from "./pages/projects/ProjectDetail";
import AllProjects from "./pages/projects/AllProjects";

// Recurring Services
import RecurringServices from "./pages/RecurringServices";
import RecurringServiceDetail from "./pages/RecurringServiceDetail";

import Payments from './pages/Payments';

// Department Pages
import Development from "./pages/departments/Development";
import FrontSales from "./pages/departments/FrontSales";
import HR from "./pages/departments/HR";
import Marketing from "./pages/departments/Marketing";
import Other from "./pages/departments/Other";
import Production from "./pages/departments/Production";
import Upseller from "./pages/departments/Upseller";
import BetterAskSaul from "./pages/BetterAskSaul";
import Employees from "./pages/hr/Employees";
import Upsell from "./pages/sales/Upsell";

// Front Seller Dashboard
import { FrontSellerDashboard } from "./pages/dashboard/FrontSellerDashboard";

// Management Pages
import FrontSalesManagement from "./pages/management/FrontSalesManagement";

// Kanban Page
import Kanban from "./pages/Kanban";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <MainLayout>
            <AdminUserManagement />
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
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
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
      <Route path="/customers" element={
        <ProtectedRoute>
          <MainLayout>
            <Customers />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/customers/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <CustomerProfile />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <MainLayout>
            <Messages />
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
      <Route path="/front-seller-dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <FrontSellerDashboard />
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
      <Route path="/automation" element={
        <ProtectedRoute>
          <MainLayout>
            <MarketingAutomation />
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
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
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
      <Route path="/better-ask-saul" element={
        <ProtectedRoute>
          <MainLayout>
            <BetterAskSaul />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Project Management Routes */}
      <Route path="/projects" element={
        <ProtectedRoute>
          <MainLayout>
            <AllProjects />
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
      <Route path="/projects/my-projects" element={
        <ProtectedRoute>
          <MainLayout>
            <MyProjects />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <MainLayout>
            <ProjectDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Kanban Board Routes */}
      <Route path="/kanban" element={
        <ProtectedRoute>
          <MainLayout>
            <Kanban />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Recurring Services Routes */}
      <Route path="/recurring-services" element={
        <ProtectedRoute>
          <MainLayout>
            <RecurringServices />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/recurring-services/:serviceId" element={
        <ProtectedRoute>
          <MainLayout>
            <RecurringServiceDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* HR Routes */}
      <Route path="/hr/employees" element={
        <ProtectedRoute>
          <MainLayout>
            <Employees />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Department Routes */}
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
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PermissionProvider>
            <AppContent />
          </PermissionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
