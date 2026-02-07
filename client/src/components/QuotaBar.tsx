import { useQuota, getQuotaPercentage, isQuotaExceeded } from "@/hooks/use-quota";
import { useI18n } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";
import { Zap, FileText, FolderOpen } from "lucide-react";

export default function QuotaBar() {
  const { data: quota, isLoading } = useQuota();
  const { t, language } = useI18n();

  if (isLoading || !quota) return null;

  const locale = language === "fr" ? "fr-FR" : "en-US";
  const wordsPct = getQuotaPercentage(quota.wordsUsed, quota.wordsLimit);
  const actionsPct = getQuotaPercentage(quota.actionsUsed, quota.actionsLimit);
  const projectsPct = getQuotaPercentage(quota.activeProjects, quota.activeProjectsLimit);
  const wordsExceeded = isQuotaExceeded(quota.wordsUsed, quota.wordsLimit);
  const actionsExceeded = isQuotaExceeded(quota.actionsUsed, quota.actionsLimit);

  return (
    <div className="space-y-3 px-2" data-testid="quota-bar">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("quota.title")}</p>
      
      <QuotaItem
        icon={<FileText className="w-3.5 h-3.5" />}
        label={t("quota.words")}
        used={quota.wordsUsed.toLocaleString(locale)}
        limit={quota.wordsLimit.toLocaleString(locale)}
        percentage={wordsPct}
        exceeded={wordsExceeded}
        testId="quota-words"
      />
      
      <QuotaItem
        icon={<Zap className="w-3.5 h-3.5" />}
        label={t("quota.aiActions")}
        used={String(quota.actionsUsed)}
        limit={String(quota.actionsLimit)}
        percentage={actionsPct}
        exceeded={actionsExceeded}
        testId="quota-actions"
      />
      
      <QuotaItem
        icon={<FolderOpen className="w-3.5 h-3.5" />}
        label={t("quota.projects")}
        used={String(quota.activeProjects)}
        limit={String(quota.activeProjectsLimit)}
        percentage={projectsPct}
        exceeded={quota.activeProjects >= quota.activeProjectsLimit}
        testId="quota-projects"
      />

      {quota.periodEnd && (
        <p className="text-xs text-muted-foreground text-center mt-1" data-testid="quota-renewal">
          {t("quota.renewal")} : {new Date(quota.periodEnd).toLocaleDateString(locale)}
        </p>
      )}
    </div>
  );
}

function QuotaItem({ icon, label, used, limit, percentage, exceeded, testId }: {
  icon: React.ReactNode;
  label: string;
  used: string;
  limit: string;
  percentage: number;
  exceeded: boolean;
  testId: string;
}) {
  return (
    <div className="space-y-1" data-testid={testId}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={exceeded ? "text-destructive" : "text-muted-foreground"}>{icon}</span>
          <span className={exceeded ? "text-destructive font-medium" : "text-muted-foreground"}>{label}</span>
        </div>
        <span className={`tabular-nums ${exceeded ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {used} / {limit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-1.5 ${exceeded ? "[&>div]:bg-destructive" : percentage > 80 ? "[&>div]:bg-orange-500" : ""}`}
      />
    </div>
  );
}
