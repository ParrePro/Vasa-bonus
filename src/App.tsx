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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
