import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { I18nProvider } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NewProject from "@/pages/NewProject";
import ProjectDetails from "@/pages/ProjectDetails";
import Settings from "@/pages/Settings";
import Billing from "@/pages/Billing";
import Admin from "@/pages/Admin";
import Blog from "@/pages/Blog";
import PublicForm from "@/pages/PublicForm";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import CookieConsent from "@/components/CookieConsent";
import TermsAcceptance from "@/components/TermsAcceptance";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const hasPaymentParams = params.has("payment") || params.has("surplus");
      if (hasPaymentParams && location !== "/billing") {
        const queryString = window.location.search;
        setLocation(`/billing${queryString}`);
      }
    }
  }, [user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/projects/new" component={() => <ProtectedRoute component={NewProject} />} />
      <Route path="/projects/:id" component={() => <ProtectedRoute component={ProjectDetails} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/billing" component={() => <ProtectedRoute component={Billing} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
      <Route path="/f/:publicId" component={PublicForm} />
      <Route path="/legal/:page" component={Legal} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/blog" component={Blog} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <TermsAcceptance>
            <Toaster />
            <Router />
            <CookieConsent />
          </TermsAcceptance>
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
