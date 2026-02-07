import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuota, useSurplusPurchase } from "@/hooks/use-quota";
import { useI18n } from "@/lib/i18n";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface QuotaExceededModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exceededType?: "words" | "actions" | "projects";
}

export default function QuotaExceededModal({ open, onOpenChange, exceededType }: QuotaExceededModalProps) {
  const { data: quota } = useQuota();
  const surplusMutation = useSurplusPurchase();
  const { toast } = useToast();
  const { t, language } = useI18n();

  if (!quota) return null;

  const locale = language === "fr" ? "fr-FR" : "en-US";

  const relevantSurplus = Object.entries(quota.surplusOptions || {}).filter(
    ([_, opt]) => !exceededType || opt.type === exceededType
  );

  const handleBuySurplus = async (key: string) => {
    try {
      await surplusMutation.mutateAsync(key);
      toast({ title: t("quota.surplusActivated"), description: t("quota.surplusActivatedDesc") });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t("settings.keyError"), description: err.message || t("quota.surplusError"), variant: "destructive" });
    }
  };

  const title = exceededType === "words" 
    ? t("quota.wordsExceeded")
    : exceededType === "actions"
    ? t("quota.actionsExceeded")
    : exceededType === "projects"
    ? t("quota.projectsExceeded")
    : t("quota.exceeded");

  const description = exceededType === "words"
    ? language === "fr"
      ? `Vous avez utilisé ${quota.wordsUsed.toLocaleString(locale)} mots sur ${quota.wordsLimit.toLocaleString(locale)} ce mois-ci.`
      : `You have used ${quota.wordsUsed.toLocaleString(locale)} words out of ${quota.wordsLimit.toLocaleString(locale)} this month.`
    : exceededType === "actions"
    ? language === "fr"
      ? `Vous avez effectué ${quota.actionsUsed} actions IA sur ${quota.actionsLimit} ce mois-ci.`
      : `You have used ${quota.actionsUsed} AI actions out of ${quota.actionsLimit} this month.`
    : exceededType === "projects"
    ? language === "fr"
      ? `Vous avez ${quota.activeProjects} projets actifs sur ${quota.activeProjectsLimit} autorisés.`
      : `You have ${quota.activeProjects} active projects out of ${quota.activeProjectsLimit} allowed.`
    : t("quota.monthlyLimitReached");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-quota-exceeded">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <p className="text-sm font-medium">{t("quota.increaseQuota")}</p>
          {relevantSurplus.map(([key, opt]) => (
            <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-md border">
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <Badge variant="secondary" className="mt-1">
                  {(opt.price / 100).toFixed(0)} €
                </Badge>
              </div>
              <Button 
                size="sm"
                onClick={() => handleBuySurplus(key)}
                disabled={surplusMutation.isPending}
                data-testid={`button-buy-surplus-${key}`}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {t("quota.buy")}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Link href="/billing">
            <Button variant="outline" className="w-full" data-testid="link-billing" onClick={() => onOpenChange(false)}>
              {t("billing.viewBilling")}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
