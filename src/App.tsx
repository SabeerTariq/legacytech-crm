import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Messages from "./pages/Messages";
import SalesForm from "./pages/SalesForm";
import MarketingAutomation from "./pages/MarketingAutomation";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Payments from './pages/Payments';  // New Payments page import

// Department Pages
import Design from "./pages/departments/Design";
import Development from "./pages/departments/Development";
import Marketing from "./pages/departments/Marketing";
import Content from "./pages/departments/Content";
import BusinessDevelopment from "./pages/departments/BusinessDevelopment";
import ProjectManagement from "./pages/departments/ProjectManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/sales-form" element={<ProtectedRoute><SalesForm /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><MarketingAutomation /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            
            {/* Department routes */}
            <Route path="/departments/design" element={<ProtectedRoute><Design /></ProtectedRoute>} />
            <Route path="/departments/development" element={<ProtectedRoute><Development /></ProtectedRoute>} />
            <Route path="/departments/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
            <Route path="/departments/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
            <Route path="/departments/business-development" element={<ProtectedRoute><BusinessDevelopment /></ProtectedRoute>} />
            <Route path="/departments/project-management" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
