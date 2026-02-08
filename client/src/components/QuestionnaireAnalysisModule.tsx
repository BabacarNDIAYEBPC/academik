import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ProjectSection } from "@shared/schema";
import {
  ClipboardList, Loader2, Save, Check, X, FileDown, History, BarChart3,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/lib/i18n";

interface QuestionnaireAnalysisModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
  questionnaireSection?: ProjectSection;
}

interface HistoryEntry {
  id: string;
  type: string;
  createdAt: string;
  preview: string;
  fullResult: string;
}

interface SavedState {
  responseData: string;
  analysisResult: string;
  analysisType: string;
  respondentCount: number;
  customInstructions: string;
  history: HistoryEntry[];
}

export default function QuestionnaireAnalysisModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
  questionnaireSection,
}: QuestionnaireAnalysisModuleProps) {
  const [responseData, setResponseData] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisType, setAnalysisType] = useState("depouillement");
  const [respondentCount, setRespondentCount] = useState(30);
  const [customInstructions, setCustomInstructions] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t, language } = useI18n();

  const ANALYSIS_TYPES = useMemo(() => [
    { value: "depouillement", label: t("modules.questionnaireAnalysis.typeDepouillement") },
    { value: "tri_plat", label: t("modules.questionnaireAnalysis.typeTriPlat") },
    { value: "tri_croise", label: t("modules.questionnaireAnalysis.typeTriCroise") },
    { value: "analyse_thematique", label: t("modules.questionnaireAnalysis.typeThematique") },
  ], [t, language]);
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const analyzeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/sections/questionnaire-analysis/generate`, data);
      return res.json();
    },
  });

  const questionnaireContent = useMemo(() => {
    if (!questionnaireSection) return "";
    const cfg = questionnaireSection.config as any;
    return cfg?.questionnaireState?.questionnaireContent || "";
  }, [questionnaireSection]);

  const stateRef = useRef({ responseData, analysisResult, analysisType, respondentCount, customInstructions, history });
  useEffect(() => {
    stateRef.current = { responseData, analysisResult, analysisType, respondentCount, customInstructions, history };
  }, [responseData, analysisResult, analysisType, respondentCount, customInstructions, history]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      responseData: s.responseData,
      analysisResult: s.analysisResult,
      analysisType: s.analysisType,
      respondentCount: s.respondentCount,
      customInstructions: s.customInstructions,
      history: s.history,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { questionnaireAnalysisState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.questionnaireAnalysisState) {
      const s = cfg.questionnaireAnalysisState as SavedState;
      if (s.responseData) setResponseData(s.responseData);
      if (s.analysisResult) setAnalysisResult(s.analysisResult);
      if (s.analysisType) setAnalysisType(s.analysisType);
      if (s.respondentCount) setRespondentCount(s.respondentCount);
      if (s.customInstructions) setCustomInstructions(s.customInstructions);
      if (s.history) setHistory(s.history);
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
  }, [responseData, analysisResult, analysisType, respondentCount, customInstructions, history, stateLoaded, doSave]);

  const handleAnalyze = () => {
    if (!responseData.trim()) {
      toast({ title: t("modules.questionnaireAnalysis.toastDataRequired"), description: t("modules.questionnaireAnalysis.toastPasteResponses"), variant: "destructive" });
      return;
    }
    const combinedContext = [extraContext, customInstructions].filter(Boolean).join("\n");
    analyzeMutation.mutate(
      {
        projectId,
        analysisType,
        respondentCount,
        responseData,
        questionnaireContent: questionnaireContent || undefined,
        extraContext: combinedContext || undefined,
        variables,
        projectType,
      },
      {
        onSuccess: (data: any) => {
          const result = data.content || data.analysis || "";
          setAnalysisResult(result);
          const typeLabel = ANALYSIS_TYPES.find(at => at.value === analysisType)?.label || analysisType;
          const entry: HistoryEntry = {
            id: Date.now().toString(),
            type: typeLabel,
            createdAt: new Date().toISOString(),
            preview: result.substring(0, 150).replace(/\n/g, " ") + (result.length > 150 ? "..." : ""),
            fullResult: result,
          };
          setHistory(prev => [entry, ...prev]);
          toast({ title: t("modules.questionnaireAnalysis.toastAnalysisComplete"), description: t("modules.questionnaireAnalysis.toastAnalysisGenerated") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.questionnaireAnalysis.toastError"), description: error.message || t("modules.questionnaireAnalysis.toastAnalysisError"), variant: "destructive" });
        },
      }
    );
  };

  const handleRestoreHistory = (entry: HistoryEntry) => {
    setAnalysisResult(entry.fullResult);
    toast({ title: t("modules.questionnaireAnalysis.toastResultRestored"), description: `${entry.type} - ${new Date(entry.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}` });
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.questionnaireAnalysis.toastSectionValidated") }),
        onError: () => toast({ title: t("modules.questionnaireAnalysis.toastError"), variant: "destructive" }),
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.questionnaireAnalysis.toastValidationRemoved") }),
        onError: () => toast({ title: t("modules.questionnaireAnalysis.toastError"), variant: "destructive" }),
      }
    );
  };

  const handleExport = () => {
    if (!analysisResult) {
      toast({ title: t("modules.questionnaireAnalysis.toastNothingToExport"), description: t("modules.questionnaireAnalysis.toastGenerateFirst"), variant: "destructive" });
      return;
    }
    const typeLabel = ANALYSIS_TYPES.find(at => at.value === analysisType)?.label || analysisType;
    exportToWord(
      t("modules.questionnaireAnalysis.exportTitle"),
      [{ label: typeLabel, content: analysisResult }],
      "depouillement_questionnaire.docx"
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ClipboardList className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">{t("modules.questionnaireAnalysis.title")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.questionnaireAnalysis.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-analysis">
            <Save className="w-4 h-4 mr-1" />{t("modules.questionnaireAnalysis.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-analysis">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.questionnaireAnalysis.exportBtn")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="button-validate-analysis">
              <Check className="w-4 h-4 mr-1" />{t("modules.questionnaireAnalysis.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate-analysis">
              <X className="w-4 h-4 mr-1" />{t("modules.questionnaireAnalysis.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questionnaireContent && (
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {t("modules.questionnaireAnalysis.questionnaireSource")}
            </Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-muted/30">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-questionnaire-preview">
                {questionnaireContent.length > 500
                  ? questionnaireContent.substring(0, 500) + "..."
                  : questionnaireContent}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="analysis-type">{t("modules.questionnaireAnalysis.analysisType")}</Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger data-testid="select-analysis-type" id="analysis-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANALYSIS_TYPES.map(at => (
                  <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="respondent-count">{t("modules.questionnaireAnalysis.respondentCount")}</Label>
            <Input
              id="respondent-count"
              type="number"
              min={1}
              value={respondentCount}
              onChange={e => setRespondentCount(parseInt(e.target.value) || 1)}
              data-testid="input-respondent-count"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="response-data" className="text-base font-semibold">{t("modules.questionnaireAnalysis.responseData")}</Label>
          <Textarea
            id="response-data"
            value={responseData}
            onChange={e => setResponseData(e.target.value)}
            placeholder={t("modules.questionnaireAnalysis.responseDataPlaceholder") as string}
            className="min-h-[200px] text-sm"
            data-testid="textarea-response-data"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="custom-instructions">{t("modules.questionnaireAnalysis.customInstructions")}</Label>
          <Textarea
            id="custom-instructions"
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder={t("modules.questionnaireAnalysis.customInstructionsPlaceholder") as string}
            className="min-h-[80px] text-sm"
            data-testid="textarea-custom-instructions"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzeMutation.isPending || !responseData.trim()}
          data-testid="button-analyze"
        >
          {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
          {t("modules.questionnaireAnalysis.analyzeResponses")}
        </Button>

        {analysisResult && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">{t("modules.questionnaireAnalysis.analysisResults")}</Label>
            <div className="border rounded-md p-4 prose prose-sm dark:prose-invert prose-academic max-w-none" data-testid="text-analysis-result">
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="flex items-center gap-2"
              data-testid="button-toggle-history"
            >
              <History className="w-4 h-4" />
              {t("modules.questionnaireAnalysis.analysisHistory")} ({history.length})
              <span className="text-xs text-muted-foreground">{historyExpanded ? "▲" : "▼"}</span>
            </Button>
            {historyExpanded && (
              <div className="space-y-2" data-testid="list-analysis-history">
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-3 hover-elevate cursor-pointer"
                    onClick={() => handleRestoreHistory(entry)}
                    data-testid={`history-entry-${entry.id}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{entry.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.preview}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
