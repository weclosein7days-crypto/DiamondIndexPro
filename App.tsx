/*
 * Diamond Index™ — App Root
 * Light theme, white background
 * Role-based routing: users → /vault, graders → /grader-dashboard
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CardProfile from "./pages/CardProfile";
import GraderProgram from "./pages/GraderProgram";
import Grade from "./pages/Grade";
import Grader from "./pages/Grader";
import Investors from "./pages/Investors";
import Vault from "./pages/Vault";
import Verify from "./pages/Verify";
import GraderDashboard from "./pages/GraderDashboard";
import GraderApproval from "./pages/GraderApproval";
import Showcase from "./pages/Showcase";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./_core/hooks/useAuth";

/**
 * RoleRedirect — after login, route graders to /grader-dashboard,
 * regular users to /vault. Public visitors stay on home.
 */
function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role === "grader" || user?.role === "admin") {
    return <Redirect to="/grader-dashboard" />;
  }

  if (user) {
    return <Redirect to="/vault" />;
  }

  // Not logged in — show home page
  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RoleRedirect} />
      <Route path="/card/:id" component={CardProfile} />
      <Route path="/card" component={CardProfile} />
      <Route path="/grader-program" component={GraderProgram} />
      <Route path="/grade" component={Grade} />
      <Route path="/grader" component={Grader} />
      <Route path="/investors" component={Investors} />
      <Route path="/vault" component={Vault} />
      <Route path="/grader-dashboard" component={GraderDashboard} />
      <Route path="/grader-approved" component={GraderApproval} />
      <Route path="/showcase" component={Showcase} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/verify/:certId" component={Verify} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
