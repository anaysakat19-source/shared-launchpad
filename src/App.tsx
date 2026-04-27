import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import BasicInfo from "./pages/onboarding/BasicInfo";
import Goals from "./pages/onboarding/Goals";
import HealthConditions from "./pages/onboarding/HealthConditions";
import DietaryPreferences from "./pages/onboarding/DietaryPreferences";
import Dashboard from "./pages/Dashboard";
import Meals from "./pages/Meals";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Chat from "./pages/Chat";
import Wearables from "./pages/Wearables";
import DietitianList from "./pages/dietitians/DietitianList";
import DietitianDetail from "./pages/dietitians/DietitianDetail";
import MessagesList from "./pages/messages/MessagesList";
import ConversationView from "./pages/messages/ConversationView";
import ExpertAuth from "./pages/expert/ExpertAuth";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding/basic" element={<BasicInfo />} />
          <Route path="/onboarding/goals" element={<Goals />} />
          <Route path="/onboarding/health" element={<HealthConditions />} />
          <Route path="/onboarding/diet" element={<DietaryPreferences />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/wearables" element={<Wearables />} />
          <Route path="/dietitians" element={<DietitianList />} />
          <Route path="/dietitians/:id" element={<DietitianDetail />} />
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/messages/:id" element={<ConversationView />} />
          <Route path="/expert" element={<ExpertAuth />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
