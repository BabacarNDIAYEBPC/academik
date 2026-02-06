import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuota, useSurplusPurchase } from "@/hooks/use-quota";
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

  if (!quota) return null;

  const relevantSurplus = Object.entries(quota.surplusOptions || {}).filter(
    ([_, opt]) => !exceededType || opt.type === exceededType
  );

  const handleBuySurplus = async (key: string) => {
    try {
      await surplusMutation.mutateAsync(key);
      toast({ title: "Surplus activé", description: "Votre quota a été augmenté." });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'acheter le surplus", variant: "destructive" });
    }
  };

  const title = exceededType === "words" 
    ? "Quota de mots atteint"
    : exceededType === "actions"
    ? "Quota d'actions IA atteint"
    : exceededType === "projects"
    ? "Limite de projets atteinte"
    : "Quota atteint";

  const description = exceededType === "words"
    ? `Vous avez utilisé ${quota.wordsUsed.toLocaleString("fr-FR")} mots sur ${quota.wordsLimit.toLocaleString("fr-FR")} ce mois-ci.`
    : exceededType === "actions"
    ? `Vous avez effectué ${quota.actionsUsed} actions IA sur ${quota.actionsLimit} ce mois-ci.`
    : exceededType === "projects"
    ? `Vous avez ${quota.activeProjects} projets actifs sur ${quota.activeProjectsLimit} autorisés.`
    : "Vous avez atteint une de vos limites mensuelles.";

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
          <p className="text-sm font-medium">Augmentez votre quota :</p>
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
                Acheter
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Link href="/billing">
            <Button variant="outline" className="w-full" data-testid="link-billing" onClick={() => onOpenChange(false)}>
              Voir ma facturation
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
