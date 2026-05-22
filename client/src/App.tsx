import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Revue from "@/pages/Revue";
import Billing from "@/pages/Billing";
import Admin from "@/pages/Admin";
import BibliographieApa from "@/pages/seo/BibliographieApa";
import ApaCitationGenerator from "@/pages/seo/ApaCitationGenerator";
import RevueLitterature from "@/pages/seo/RevueLitterature";
import LiteratureReview from "@/pages/seo/LiteratureReview";
import BiblioVancouver from "@/pages/seo/BiblioVancouver";
import VancouverCitation from "@/pages/seo/VancouverCitation";
import BiblioMla from "@/pages/seo/BiblioMla";
import MlaCitation from "@/pages/seo/MlaCitation";
import BiblioChicago from "@/pages/seo/BiblioChicago";
import ChicagoCitation from "@/pages/seo/ChicagoCitation";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!user) {
    setLocation("/connexion");
    return null;
  }

  return <Component />;
}

function HomeRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Landing />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/connexion" component={Auth} />
      <Route path="/revue" component={() => <ProtectedRoute component={Revue} />} />
      <Route path="/billing" component={() => <ProtectedRoute component={Billing} />} />
      <Route path="/admin" component={Admin} />
      <Route path="/bibliographie-apa" component={BibliographieApa} />
      <Route path="/en/apa-citation-generator" component={ApaCitationGenerator} />
      <Route path="/revue-litterature" component={RevueLitterature} />
      <Route path="/en/literature-review" component={LiteratureReview} />
      <Route path="/bibliographie-vancouver" component={BiblioVancouver} />
      <Route path="/en/vancouver-citation" component={VancouverCitation} />
      <Route path="/bibliographie-mla" component={BiblioMla} />
      <Route path="/en/mla-citation" component={MlaCitation} />
      <Route path="/bibliographie-chicago" component={BiblioChicago} />
      <Route path="/en/chicago-citation" component={ChicagoCitation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
