import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SQLGame from "./pages/SQLGame";
import CryptoPuzzles from "./pages/CryptoPuzzles";
import Terminal from "./pages/Terminal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSettings from "./pages/ProfileSettings";
import Leaderboard from "./pages/Leaderboard";
import Chat from "./pages/Chat";
import Achievements from "./pages/Achievements";
import SherlockCourse from "./pages/SherlockCourse";
import PracticalLabs from "./pages/PracticalLabs";
import CareerPath from "./pages/CareerPath";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BottomNav />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/path/:slug" element={<CareerPath />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/sql-game" element={
                <ProtectedRoute>
                  <SQLGame />
                </ProtectedRoute>
              } />
              <Route path="/crypto-puzzles" element={
                <ProtectedRoute>
                  <CryptoPuzzles />
                </ProtectedRoute>
              } />
              <Route path="/terminal" element={
                <ProtectedRoute>
                  <Terminal />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/achievements" element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              } />
              <Route path="/sherlock-course" element={
                <ProtectedRoute>
                  <SherlockCourse />
                </ProtectedRoute>
              } />
              <Route path="/practical-labs" element={
                <ProtectedRoute>
                  <PracticalLabs />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
