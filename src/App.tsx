import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { CustomStatsProvider } from "@/contexts/CustomStatsContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import MatchSelection from "./pages/MatchSelection";
import MatchDetails from "./pages/MatchDetails";
import Overview from "./pages/Overview";
import PlayerStats from "./pages/PlayerStats";
import TeamAnalytics from "./pages/TeamAnalytics";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import UpcomingMatches from "./pages/UpcomingMatches";
import MatchSchedule from "./pages/MatchSchedule";
import StatsGlossary from "./pages/StatsGlossary";

// Auth Pages
import LoginSelection from "./pages/auth/LoginSelection";
import AdminLogin from "./pages/auth/AdminLogin";
import CoachLogin from "./pages/auth/CoachLogin";
import PlayerLogin from "./pages/auth/PlayerLogin";

// Dashboard Pages
import CoachDashboard from "./pages/CoachDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
} as const;

// Component to handle root redirect based on auth state
// Component to handle root redirect based on auth state
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      // Redirect based on role
      switch (user?.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'coach':
          navigate('/dashboard', { replace: true });
          break;
        case 'player':
          navigate(`/player/${user.playerId || 'overview'}`, { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading state while checking
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        <Routes location={location}>
          {/* Root - redirects based on auth */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/coach" element={<CoachLogin />} />
          <Route path="/login/player" element={<PlayerLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Coach Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />

          {/* Match Selection - Coach and Admin */}
          <Route
            path="/matches"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <MatchSelection />
              </ProtectedRoute>
            }
          />

          {/* Upcoming Matches - Coach and Admin */}
          <Route
            path="/matches/upcoming"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <UpcomingMatches />
              </ProtectedRoute>
            }
          />

          {/* Match Schedule - Coach and Admin */}
          <Route
            path="/matches/schedule"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <MatchSchedule />
              </ProtectedRoute>
            }
          />

          {/* Match Details - Coach and Admin */}
          <Route
            path="/match/:matchId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <MatchDetails />
              </ProtectedRoute>
            }
          />

          {/* Profile - Coach and Admin */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Overview - Coach and Admin */}
          <Route
            path="/overview"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <Overview />
              </ProtectedRoute>
            }
          />

          {/* Player Stats - All authenticated users */}
          <Route
            path="/player"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach', 'player']}>
                <PlayerStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach', 'player']}>
                <PlayerStats />
              </ProtectedRoute>
            }
          />

          {/* Team Analytics - Coach and Admin */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach']}>
                <TeamAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Stats Glossary - All authenticated users */}
          <Route
            path="/stats-glossary"
            element={
              <ProtectedRoute allowedRoles={['admin', 'coach', 'player']}>
                <StatsGlossary />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SidebarProvider>
              <CustomStatsProvider>
                <AnimatedRoutes />
              </CustomStatsProvider>
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
