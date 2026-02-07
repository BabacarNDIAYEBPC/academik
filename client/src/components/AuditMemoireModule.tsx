import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  useAuditMemoire,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  ShieldCheck, Upload, Sparkles, Save, Check, X, FileDown,
  Loader2, AlertTriangle, CheckCircle, Info, Target,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface AuditMemoireModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface AuditResult {
  structural: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
  methodological: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
  theoretical: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
  priorities: string[];
  score?: number;
}

interface SavedState {
  memoireContent: string;
  guideContent: string;
  tutorInstructions: string;
  auditResult: AuditResult | null;
  checkedPriorities: string[];
  contextInstructions: string;
}

export default function AuditMemoireModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: AuditMemoireModuleProps) {
  const [memoireContent, setMemoireContent] = useState("");
  const [guideContent, setGuideContent] = useState("");
  const [tutorInstructions, setTutorInstructions] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [checkedPriorities, setCheckedPriorities] = useState<string[]>([]);
  const [contextInstructions, setContextInstructions] = useState("");
  const [activeTab, setActiveTab] = useState("structural");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { t, lang } = useI18n();
  const { toast } = useToast();
  const auditMutation = useAuditMemoire();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ memoireContent, guideContent, tutorInstructions, auditResult, checkedPriorities, contextInstructions });
  useEffect(() => {
    stateRef.current = { memoireContent, guideContent, tutorInstructions, auditResult, checkedPriorities, contextInstructions };
  }, [memoireContent, guideContent, tutorInstructions, auditResult, checkedPriorities, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      memoireContent: s.memoireContent,
      guideContent: s.guideContent,
      tutorInstructions: s.tutorInstructions,
      auditResult: s.auditResult,
      checkedPriorities: s.checkedPriorities,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { auditMemoireState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.auditMemoireState) {
      const s = cfg.auditMemoireState as SavedState;
      if (s.memoireContent) setMemoireContent(s.memoireContent);
      if (s.guideContent) setGuideContent(s.guideContent);
      if (s.tutorInstructions) setTutorInstructions(s.tutorInstructions);
      if (s.auditResult) setAuditResult(s.auditResult);
      if (s.checkedPriorities) setCheckedPriorities(s.checkedPriorities);
      if (s.contextInstructions) setContextInstructions(s.contextInstructions);
    }
    setStateLoaded(true);
  }, [section, stateLoaded]);

  const doSaveRef = useRef(doSave);
  useEffect(() => { doSaveRef.current = doSave; }, [doSave]);
  useEffect(() => {
    return () => { doSaveRef.current(); };
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    const timer = setTimeout(doSave, 3000);
    return () => clearTimeout(timer);
  }, [memoireContent, guideContent, tutorInstructions, auditResult, checkedPriorities, contextInstructions, stateLoaded, doSave]);

  const handleImportFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.md,.rtf";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        setMemoireContent(text);
        toast({ title: t("modules.audit.toastFileImported"), description: `"${file.name}" ${t("modules.audit.toastFileImportedDesc")}` });
      } catch {
        toast({ title: t("modules.audit.toastImportError"), description: t("modules.audit.toastImportErrorDesc"), variant: "destructive" });
      }
    };
    input.click();
  };

  const handleLaunchAudit = () => {
    if (!memoireContent.trim()) {
      toast({ title: t("modules.audit.toastContentRequired"), description: t("modules.audit.toastContentRequiredDesc"), variant: "destructive" });
      return;
    }
    auditMutation.mutate(
      {
        projectId,
        memoireContent,
        guideContent: guideContent || undefined,
        tutorInstructions: tutorInstructions || undefined,
        extraContext: combinedContext || undefined,
      },
      {
        onSuccess: (data) => {
          setAuditResult(data);
          setCheckedPriorities([]);
          toast({ title: t("modules.audit.toastAuditComplete"), description: t("modules.audit.toastAuditCompleteDesc") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.audit.toastError"), description: error.message || t("modules.audit.toastErrorDesc"), variant: "destructive" });
        },
      }
    );
  };

  const handleTogglePriority = (priority: string) => {
    setCheckedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const handleExportWord = () => {
    if (!auditResult) return;
    const sections = [
      {
        label: t("modules.audit.exportStructural"),
        content: formatAuditAxis(auditResult.structural, t),
      },
      {
        label: t("modules.audit.exportMethodological"),
        content: formatAuditAxis(auditResult.methodological, t),
      },
      {
        label: t("modules.audit.exportTheoretical"),
        content: formatAuditAxis(auditResult.theoretical, t),
      },
      {
        label: t("modules.audit.exportPriorities"),
        content: auditResult.priorities.map((p, i) => `${i + 1}. ${checkedPriorities.includes(p) ? `[${t("modules.audit.done")}] ` : ""}${p}`).join("\n"),
      },
    ];
    if (auditResult.score !== undefined) {
      sections.push({ label: t("modules.audit.exportScore"), content: `${auditResult.score} / 100` });
    }
    exportToWord(t("modules.audit.exportDocTitle"), sections, "audit_memoire");
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.audit.toastValidated") }),
        onError: (error: any) => toast({ title: t("modules.audit.toastError"), description: error.message, variant: "destructive" }),
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.audit.toastUnvalidated") }),
        onError: (error: any) => toast({ title: t("modules.audit.toastError"), description: error.message, variant: "destructive" }),
      }
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle>{t("modules.audit.title")}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isValidated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnvalidate}
                  disabled={unvalidateMutation.isPending}
                  data-testid="button-unvalidate-audit"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t("modules.audit.removeValidation")}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleValidate}
                  disabled={!auditResult || validateMutation.isPending}
                  data-testid="button-validate-audit"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {t("modules.audit.validate")}
                </Button>
              )}
              {section?.status && (
                <Badge variant={isValidated ? "default" : "secondary"} data-testid="badge-audit-status">
                  {isValidated ? t("modules.audit.validated") : section.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="text-sm font-semibold">{t("modules.audit.memoireContentLabel")}</Label>
              <Button variant="outline" size="sm" onClick={handleImportFile} data-testid="button-import-memoir-audit">
                <Upload className="w-4 h-4 mr-1" />
                {t("modules.audit.importFile")}
              </Button>
            </div>
            <Textarea
              value={memoireContent}
              onChange={(e) => setMemoireContent(e.target.value)}
              className="min-h-[200px] text-sm"
              placeholder={t("modules.audit.memoirePlaceholder")}
              data-testid="textarea-memoir-content"
            />
            {memoireContent && (
              <p className="text-xs text-muted-foreground" data-testid="text-memoir-length">
                {memoireContent.length.toLocaleString()} {t("modules.audit.characters")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("modules.audit.guideLabel")}</Label>
            <Textarea
              value={guideContent}
              onChange={(e) => setGuideContent(e.target.value)}
              className="min-h-[100px] text-sm"
              placeholder={t("modules.audit.guidePlaceholder")}
              data-testid="textarea-guide-content"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("modules.audit.tutorLabel")}</Label>
            <Textarea
              value={tutorInstructions}
              onChange={(e) => setTutorInstructions(e.target.value)}
              className="min-h-[100px] text-sm"
              placeholder={t("modules.audit.tutorPlaceholder")}
              data-testid="textarea-tutor-instructions"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("modules.audit.contextLabel")}</Label>
            <Textarea
              value={contextInstructions}
              onChange={(e) => setContextInstructions(e.target.value)}
              className="min-h-[80px] text-sm"
              placeholder={t("modules.audit.contextPlaceholder")}
              data-testid="textarea-context-instructions"
            />
          </div>

          <Button
            onClick={handleLaunchAudit}
            disabled={!memoireContent.trim() || auditMutation.isPending}
            data-testid="button-launch-audit"
          >
            {auditMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {auditMutation.isPending ? t("modules.audit.auditInProgress") : t("modules.audit.launchAudit")}
          </Button>
        </CardContent>
      </Card>

      {auditResult && (
        <>
          {auditResult.score !== undefined && (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">{t("modules.audit.globalScore")}</span>
                    </div>
                    <span className="text-2xl font-bold" data-testid="text-audit-score">
                      {auditResult.score} / 100
                    </span>
                  </div>
                  <Progress value={auditResult.score} className="h-3" data-testid="progress-audit-score" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("modules.audit.auditResults")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full" data-testid="tabs-audit-axes">
                  <TabsTrigger value="structural" className="flex-1" data-testid="tab-structural">
                    {t("modules.audit.tabStructural")}
                  </TabsTrigger>
                  <TabsTrigger value="methodological" className="flex-1" data-testid="tab-methodological">
                    {t("modules.audit.tabMethodological")}
                  </TabsTrigger>
                  <TabsTrigger value="theoretical" className="flex-1" data-testid="tab-theoretical">
                    {t("modules.audit.tabTheoretical")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="structural" className="space-y-4 mt-4">
                  <AuditAxisDisplay axis={auditResult.structural} />
                </TabsContent>

                <TabsContent value="methodological" className="space-y-4 mt-4">
                  <AuditAxisDisplay axis={auditResult.methodological} />
                </TabsContent>

                <TabsContent value="theoretical" className="space-y-4 mt-4">
                  <AuditAxisDisplay axis={auditResult.theoretical} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {auditResult.priorities.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-base">{t("modules.audit.priorityCorrections")}</CardTitle>
                  <Badge variant="secondary" data-testid="badge-priorities-count">
                    {checkedPriorities.length} / {auditResult.priorities.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditResult.priorities.map((priority, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-md border p-3"
                    data-testid={`priority-item-${idx}`}
                  >
                    <Checkbox
                      checked={checkedPriorities.includes(priority)}
                      onCheckedChange={() => handleTogglePriority(priority)}
                      data-testid={`checkbox-priority-${idx}`}
                    />
                    <span
                      className={`text-sm flex-1 ${checkedPriorities.includes(priority) ? "line-through text-muted-foreground" : ""}`}
                      data-testid={`text-priority-${idx}`}
                    >
                      {priority}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportWord} data-testid="button-export-audit-word">
              <FileDown className="w-4 h-4 mr-2" />
              {t("modules.audit.exportWord")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function formatAuditAxis(axis: { strengths: string[]; weaknesses: string[]; recommendations: string[] }, t: (key: string) => string): string {
  const parts: string[] = [];
  if (axis.strengths.length > 0) {
    parts.push(`## ${t("modules.audit.strengths")}\n` + axis.strengths.map((s) => `- ${s}`).join("\n"));
  }
  if (axis.weaknesses.length > 0) {
    parts.push(`## ${t("modules.audit.weaknesses")}\n` + axis.weaknesses.map((w) => `- ${w}`).join("\n"));
  }
  if (axis.recommendations.length > 0) {
    parts.push(`## ${t("modules.audit.recommendations")}\n` + axis.recommendations.map((r) => `- ${r}`).join("\n"));
  }
  return parts.join("\n\n");
}

function AuditAxisDisplay({ axis }: { axis: { strengths: string[]; weaknesses: string[]; recommendations: string[] } }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      {axis.strengths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">{t("modules.audit.strengths")}</span>
          </div>
          <ul className="space-y-1 pl-6">
            {axis.strengths.map((item, i) => (
              <li
                key={i}
                className="text-sm text-green-700 dark:text-green-400 list-disc"
                data-testid={`strength-item-${i}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {axis.weaknesses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">{t("modules.audit.weaknesses")}</span>
          </div>
          <ul className="space-y-1 pl-6">
            {axis.weaknesses.map((item, i) => (
              <li
                key={i}
                className="text-sm text-red-700 dark:text-red-400 list-disc"
                data-testid={`weakness-item-${i}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {axis.recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{t("modules.audit.recommendations")}</span>
          </div>
          <ul className="space-y-1 pl-6">
            {axis.recommendations.map((item, i) => (
              <li
                key={i}
                className="text-sm text-blue-700 dark:text-blue-400 list-disc"
                data-testid={`recommendation-item-${i}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
