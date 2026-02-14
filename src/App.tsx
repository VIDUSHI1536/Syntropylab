import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Benchmark from '@/pages/dashboard/Benchmark';


import Auth from "./pages/Auth";
import AcceptInvite from "./pages/AcceptInvite";
import DashboardLayout from "./components/layout/DashboardLayout";
import Projects from "./pages/dashboard/Projects";
import ProjectDetail from "./pages/dashboard/ProjectDetail";
import Playground from "./pages/dashboard/Playground";
import Organizations from "./pages/dashboard/Organizations";
import Datasets from "./pages/dashboard/Datasets";
import Evaluators from "./pages/dashboard/Evaluators";
import Analytics from "./pages/dashboard/Analytics";
import NotFound from "./pages/NotFound";
import Settings from "./pages/dashboard/Settings";
import ProjectAudio from "./pages/dashboard/ProjectAudio";
import ProjectAudiofile from "./pages/dashboard/ProjectAudiofile";
import ProjectVideoPlayground from "./pages/dashboard/ProjectVideoPlayground";
import ProjectImagePlayground from "./pages/dashboard/ProjectImagePlayground";
import ProjectImageFiles from "./pages/dashboard/ProjectImageFiles";
import ProjectVideoFiles from "./pages/dashboard/ProjectVideoFiles";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/accept-invite"
              element={
                <ProtectedRoute>
                  <AcceptInvite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/projects" replace />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectId" element={<ProjectDetail />} />
              <Route
                path="/dashboard/projects/:projectId/playground"
                element={<Playground />}
              />
              <Route path="organizations" element={<Organizations />} />
              <Route path="datasets" element={<Datasets />} />
              <Route path="evaluators" element={<Evaluators />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="benchmark" element={<Benchmark />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/projectaudioplay" element={<ProjectAudio />} />
              <Route path="/dashboard/projectaudio" element={<ProjectAudiofile />} />
              <Route path="/dashboard/projectvideo" element={<ProjectVideoPlayground />} />
              <Route path="/dashboard/projectimageplayground" element={<ProjectImagePlayground />} />
              <Route path="/dashboard/projectimage" element={<ProjectImageFiles />} />
              <Route path="/dashboard/projectvideofile" element={<ProjectVideoFiles />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
