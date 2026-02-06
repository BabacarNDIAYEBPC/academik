import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAdminCheck } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Users, Package, CreditCard, Settings2, FileText, BarChart3 } from "lucide-react";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminAISettings from "@/components/admin/AdminAISettings";
import AdminLogs from "@/components/admin/AdminLogs";
import AdminDashboard from "@/components/admin/AdminDashboard";

const TABS = [
  { key: "dashboard", label: "Tableau de bord", icon: BarChart3 },
  { key: "users", label: "Utilisateurs", icon: Users },
  { key: "plans", label: "Offres", icon: Package },
  { key: "payments", label: "Paiements", icon: CreditCard },
  { key: "ai", label: "Paramétrage IA", icon: Settings2 },
  { key: "logs", label: "Logs & Audit", icon: FileText },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: adminCheck, isLoading: adminLoading } = useAdminCheck();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas les droits d'administration.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex" data-testid="page-admin">
      <aside className="hidden lg:block w-60 bg-background border-r border-border fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Console</p>
            </div>
          </div>

          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  data-testid={`tab-admin-${tab.key}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer w-full text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                      : "text-muted-foreground hover-elevate"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setLocation("/")}
              data-testid="button-admin-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'app
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-shrink-0"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "plans" && <AdminPlans />}
          {activeTab === "payments" && <AdminPayments />}
          {activeTab === "ai" && <AdminAISettings />}
          {activeTab === "logs" && <AdminLogs />}
        </div>
      </main>
    </div>
  );
}
