import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMetrics from "./pages/AdminMetrics";
import AdminAgents from "./pages/AdminAgents";
import AdminApiKeys from "./pages/AdminApiKeys";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/metrics" element={<AdminMetrics />} />
          <Route path="/admin/agents" element={<AdminAgents />} />
          <Route path="/admin/api-keys" element={<AdminApiKeys />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
