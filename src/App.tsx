import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";
import { AchievementNotificationProvider } from "@/components/AchievementNotificationContainer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import { ChatBot } from "@/components/ChatBot";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SQLGame from "./pages/SQLGame";
import CryptoPuzzles from "./pages/CryptoPuzzles";
import Terminal from "./pages/Terminal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Chat from "./pages/Chat";
import Achievements from "./pages/Achievements";
import SherlockCourse from "./pages/SherlockCourse";
import PracticalLabs from "./pages/PracticalLabs";
import CareerPath from "./pages/CareerPath";
import CareerRoles from "./pages/CareerRoles";
import AdminRoles from "./pages/AdminRoles";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import Roadmap from "./pages/Roadmap";
import CyberGame from "./pages/CyberGame";
import CyberNews from "./pages/CyberNews";
import CyberTimeTravel from "./pages/CyberTimeTravel";
import CyberJobs from "./pages/CyberJobs";
import AboutUs from "./pages/AboutUs";
import CyberEvents from "./pages/CyberEvents";
import { useThemeCustomization } from "./hooks/useThemeCustomization";

const queryClient = new QueryClient();

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useThemeCustomization();
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="cyberquest-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AchievementNotificationProvider>
        <GameProvider>
          <ThemeInitializer>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BottomNav />
              <ChatBot />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/sql-game" element={<ProtectedRoute><SQLGame /></ProtectedRoute>} />
                <Route path="/crypto-puzzles" element={<ProtectedRoute><CryptoPuzzles /></ProtectedRoute>} />
                <Route path="/terminal" element={<ProtectedRoute><Terminal /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                <Route path="/sherlock" element={<ProtectedRoute><SherlockCourse /></ProtectedRoute>} />
                <Route path="/labs" element={<ProtectedRoute><PracticalLabs /></ProtectedRoute>} />
                <Route path="/career-path" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
                <Route path="/path/:slug" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
                <Route path="/career-roles" element={<ProtectedRoute><CareerRoles /></ProtectedRoute>} />
                <Route path="/career-roles/:slug" element={<ProtectedRoute><CareerRoles /></ProtectedRoute>} />
                <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
                <Route path="/moderator" element={<ProtectedRoute><ModeratorDashboard /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
                <Route path="/cyber-game" element={<ProtectedRoute><CyberGame /></ProtectedRoute>} />
                <Route path="/cyber-news" element={<ProtectedRoute><CyberNews /></ProtectedRoute>} />
                <Route path="/time-travel" element={<ProtectedRoute><CyberTimeTravel /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><CyberJobs /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><CyberEvents /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </ThemeInitializer>
        </GameProvider>
        </AchievementNotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
