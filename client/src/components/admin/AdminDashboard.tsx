import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminUsers, useAiLogStats, useAdminPayments } from "@/hooks/use-admin";
import { Users, BarChart3, CreditCard, Zap, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: aiStats, isLoading: statsLoading } = useAiLogStats();
  const { data: payments, isLoading: paymentsLoading } = useAdminPayments();

  const isLoading = usersLoading || statsLoading || paymentsLoading;

  const totalUsers = users?.length || 0;
  const paidUsers = users?.filter(u => u.status === "paid").length || 0;
  const trialUsers = totalUsers - paidUsers;
  const totalRevenue = payments?.purchases?.reduce((sum: number, p: any) => sum + (p.price || 0), 0) || 0;
  const surplusRevenue = payments?.surplus?.reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <h2 className="text-2xl font-bold">Tableau de bord</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{paidUsers} payant(s) / {trialUsers} essai</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalRevenue + surplusRevenue) / 100).toFixed(2)} &euro;</div>
            <p className="text-xs text-muted-foreground">{(totalRevenue / 100).toFixed(2)} achats + {(surplusRevenue / 100).toFixed(2)} surplus</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-ai-requests">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requêtes IA</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">{aiStats?.totalErrors || 0} erreur(s)</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-avg-duration">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Temps moyen IA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats?.avgDuration || 0} ms</div>
            <p className="text-xs text-muted-foreground">Temps de réponse moyen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
