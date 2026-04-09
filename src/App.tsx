import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import Login from "./pages/Login";
import KYBPending from "./pages/KYBPending";
import EventLogging from "./pages/EventLogging";
import NetworkGovernance from "./pages/NetworkGovernance";
import ConsortiumInventory from "./pages/ConsortiumInventory";
import SmartSettlements from "./pages/SmartSettlements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/kyb-pending" element={<KYBPending />} />
            <Route path="/events" element={<EventLogging />} />
            <Route path="/network" element={<NetworkGovernance />} />
            <Route path="/inventory" element={<ConsortiumInventory />} />
            <Route path="/settlements" element={<SmartSettlements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
