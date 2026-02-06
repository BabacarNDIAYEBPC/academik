import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuota, useSurplusPurchase, getQuotaPercentage, isQuotaExceeded } from "@/hooks/use-quota";
import { useToast } from "@/hooks/use-toast";
import { FileText, Zap, FolderOpen, Calendar, ShoppingCart, Loader2, TrendingUp } from "lucide-react";

export default function Billing() {
  const { data: quota, isLoading } = useQuota();
  const surplusMutation = useSurplusPurchase();
  const { toast } = useToast();

  const handleBuySurplus = async (key: string) => {
    try {
      await surplusMutation.mutateAsync(key);
      toast({ title: "Surplus activé", description: "Votre quota a été augmenté." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'acheter le surplus", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quota) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Impossible de charger les quotas.</p>
        </div>
      </Layout>
    );
  }

  const wordsPct = getQuotaPercentage(quota.wordsUsed, quota.wordsLimit);
  const actionsPct = getQuotaPercentage(quota.actionsUsed, quota.actionsLimit);
  const projectsPct = getQuotaPercentage(quota.activeProjects, quota.activeProjectsLimit);

  return (
    <Layout>
      <div className="space-y-6" data-testid="page-billing">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-billing-title">Facturation & Quotas</h1>
          <p className="text-muted-foreground mt-1">Gérez votre consommation et achetez des suppléments</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-words-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mots générés</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-words-used">
                {quota.wordsUsed.toLocaleString("fr-FR")}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.wordsLimit.toLocaleString("fr-FR")} mots / mois
              </p>
              <Progress 
                value={wordsPct} 
                className={`mt-3 h-2 ${isQuotaExceeded(quota.wordsUsed, quota.wordsLimit) ? "[&>div]:bg-destructive" : wordsPct > 80 ? "[&>div]:bg-orange-500" : ""}`}
              />
            </CardContent>
          </Card>

          <Card data-testid="card-actions-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions IA</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-actions-used">
                {quota.actionsUsed}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.actionsLimit} actions / mois
              </p>
              <Progress 
                value={actionsPct} 
                className={`mt-3 h-2 ${isQuotaExceeded(quota.actionsUsed, quota.actionsLimit) ? "[&>div]:bg-destructive" : actionsPct > 80 ? "[&>div]:bg-orange-500" : ""}`}
              />
            </CardContent>
          </Card>

          <Card data-testid="card-projects-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-projects-count">
                {quota.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.activeProjectsLimit} projets actifs
              </p>
              <Progress 
                value={projectsPct} 
                className={`mt-3 h-2 ${quota.activeProjects >= quota.activeProjectsLimit ? "[&>div]:bg-destructive" : ""}`}
              />
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-period-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Période en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Début de période</p>
                <p className="font-medium" data-testid="text-period-start">
                  {quota.periodStart ? new Date(quota.periodStart).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prochain renouvellement</p>
                <p className="font-medium" data-testid="text-period-end">
                  {quota.periodEnd ? new Date(quota.periodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-surplus-options">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Packs supplémentaires
            </CardTitle>
            <CardDescription>Augmentez vos quotas en achetant des packs à la carte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(quota.surplusOptions || {}).map(([key, opt]) => (
                <div key={key} className="flex items-center justify-between gap-3 p-4 rounded-md border">
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <Badge variant="secondary" className="mt-1">
                      {(opt.price / 100).toFixed(0)} €
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleBuySurplus(key)}
                    disabled={surplusMutation.isPending}
                    data-testid={`button-buy-${key}`}
                  >
                    {surplusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-1" />
                    )}
                    Acheter
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
