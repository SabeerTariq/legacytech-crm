
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SalesPage } from "./pages/SalesPage";
import NotFound from "./pages/NotFound";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { MessagesPage } from "./pages/MessagesPage";
import { LeadsPage } from "./pages/LeadsPage";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { ExamplesPage } from "./pages/ExamplesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AuthDebug />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              } />

              {/* Routes accessible by all authenticated users */}
              <Route path="/customers" element={
                <AppLayout>
                  <CustomersPage />
                </AppLayout>
              } />

              {/* Routes accessible by admin and sales */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'sales']} />}>
                <Route path="/sales" element={
                  <AppLayout>
                    <SalesPage />
                  </AppLayout>
                } />
                <Route path="/leads" element={
                  <AppLayout>
                    <LeadsPage />
                  </AppLayout>
                } />
              </Route>

              {/* Routes accessible by admin and project_manager */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'project_manager']} />}>
                <Route path="/projects" element={
                  <AppLayout>
                    <ProjectsPage />
                  </AppLayout>
                } />
              </Route>

              {/* Routes accessible by admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/performance" element={
                  <AppLayout>
                    <PerformancePage />
                  </AppLayout>
                } />
              </Route>

              {/* Messages accessible by all authenticated users */}
              <Route path="/messages" element={
                <AppLayout>
                  <MessagesPage />
                </AppLayout>
              } />

              {/* API Examples page - accessible by all authenticated users */}
              <Route path="/examples" element={
                <AppLayout>
                  <ExamplesPage />
                </AppLayout>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
