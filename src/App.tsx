import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherClassView from "./pages/TeacherClassView";
import StudentDashboard from "./pages/StudentDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import DeveloperSchoolView from "./pages/DeveloperSchoolView";
import DeveloperClassView from "./pages/DeveloperClassView";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import GlobalHelpButton from "./components/help/GlobalHelpButton";
import SmartGuideOverlay from "./components/help/SmartGuideOverlay";
import { smartGuides } from "./components/help/smart-guides";

const queryClient = new QueryClient();

const App = () => {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/class/:classId" element={<TeacherClassView />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/developer" element={<DeveloperDashboard />} />
            <Route path="/developer/school/:schoolId" element={<DeveloperSchoolView />} />
            <Route path="/developer/class/:classId" element={<DeveloperClassView />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          
          {/* Global help system */}
          <GlobalHelpButton onStartGuide={setActiveGuide} />
          <SmartGuideOverlay
            isOpen={activeGuide !== null}
            steps={activeGuide ? smartGuides[activeGuide] || [] : []}
            onClose={() => setActiveGuide(null)}
            onGuideComplete={() => setActiveGuide(null)}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
