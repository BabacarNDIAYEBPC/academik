import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateBibliographyFull,
  useCheckBibliographyCoherence,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, Library, Save, Check, X, FileDown,
  AlertTriangle, CheckCircle, Info, RefreshCw, Copy, Upload, Trash2,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface BibliographyModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface BibSource {
  author: string;
  year: string;
  title: string;
  type: string;
  reference: string;
}

interface CoherenceAlert {
  type: string;
  message: string;
}

interface SavedState {
  bibliography: string;
  norm: string;
  sources: BibSource[];
  alerts: CoherenceAlert[];
  coherenceSuggestions: string[];
  contextInstructions: string;
  importedBibliography: string;
}

const NORM_KEYS = [
  { key: "apa7", labelKey: "modules.bibliography.normApa7" },
  { key: "vancouver", labelKey: "modules.bibliography.normVancouver" },
  { key: "mla", labelKey: "modules.bibliography.normMla" },
  { key: "chicago", labelKey: "modules.bibliography.normChicago" },
];

const ALERT_ICONS: Record<string, any> = {
  missing_entry: AlertTriangle,
  orphan_reference: Info,
  format_error: AlertTriangle,
  inconsistency: AlertTriangle,
  info: Info,
};

const ALERT_COLORS: Record<string, string> = {
  missing_entry: "text-red-500",
  orphan_reference: "text-yellow-500",
  format_error: "text-orange-500",
  inconsistency: "text-red-400",
  info: "text-blue-500",
};

export default function BibliographyModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: BibliographyModuleProps) {
  const [bibliography, setBibliography] = useState("");
  const [norm, setNorm] = useState("apa7");
  const [sources, setSources] = useState<BibSource[]>([]);
  const [alerts, setAlerts] = useState<CoherenceAlert[]>([]);
  const [coherenceSuggestions, setCoherenceSuggestions] = useState<string[]>([]);
  const [contextInstructions, setContextInstructions] = useState("");
  const [importedBibliography, setImportedBibliography] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { t, lang } = useI18n();
  const { toast } = useToast();
  const generateMutation = useGenerateBibliographyFull();
  const checkMutation = useCheckBibliographyCoherence();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions, importedBibliography ? `\n=== BIBLIOGRAPHIE IMPORTÉE ===\n${importedBibliography}` : ""].filter(Boolean).join("\n");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStateRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (section?.config && !stateLoaded) {
      const saved = section.config as unknown as SavedState;
      if (saved.bibliography !== undefined) setBibliography(saved.bibliography);
      if (saved.norm) setNorm(saved.norm);
      if (saved.sources) setSources(saved.sources);
      if (saved.alerts) setAlerts(saved.alerts);
      if (saved.coherenceSuggestions) setCoherenceSuggestions(saved.coherenceSuggestions);
      if (saved.contextInstructions) setContextInstructions(saved.contextInstructions);
      if (saved.importedBibliography) setImportedBibliography(saved.importedBibliography);
      setStateLoaded(true);
    } else if (!section?.config) {
      setStateLoaded(true);
    }
  }, [section?.config, stateLoaded]);

  const saveState = useCallback(() => {
    if (!section?.id || !stateLoaded) return;
    const state: SavedState = { bibliography, norm, sources, alerts, coherenceSuggestions, contextInstructions, importedBibliography };
    saveConfigMutation.mutate({ sectionId: section.id, config: state as any, projectId });
  }, [section?.id, bibliography, norm, sources, alerts, coherenceSuggestions, contextInstructions, importedBibliography, stateLoaded, projectId]);

  useEffect(() => { saveStateRef.current = saveState; }, [saveState]);

  useEffect(() => {
    return () => { saveStateRef.current(); };
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveState, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [bibliography, norm, sources, alerts, coherenceSuggestions, contextInstructions, importedBibliography, stateLoaded]);

  const getNormLabel = (normKey: string) => {
    const found = NORM_KEYS.find(n => n.key === normKey);
    return found ? t(found.labelKey) : normKey;
  };

  const handleGenerate = () => {
    generateMutation.mutate(
      { projectId, norm: norm as any, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setBibliography(data.content);
          setSources(data.sources || []);
          setAlerts([]);
          setCoherenceSuggestions([]);
          toast({ title: t("modules.bibliography.toastGenerated"), description: `${data.sources?.length || 0} ${t("modules.bibliography.toastGeneratedDesc")} ${getNormLabel(norm)}` });
        },
        onError: (error: any) => {
          toast({ title: t("modules.bibliography.toastError"), description: error.message || t("modules.bibliography.toastGenerationError"), variant: "destructive" });
        },
      }
    );
  };

  const handleCheckCoherence = () => {
    if (!bibliography.trim()) {
      toast({ title: t("modules.bibliography.toastBibRequired"), description: t("modules.bibliography.toastBibRequiredDesc"), variant: "destructive" });
      return;
    }
    checkMutation.mutate(
      { projectId, bibliography, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setAlerts(data.alerts || []);
          setCoherenceSuggestions(data.suggestions || []);
          const errorCount = data.alerts?.filter(a => a.type !== "info").length || 0;
          toast({
            title: errorCount === 0 ? t("modules.bibliography.toastCoherent") : `${errorCount} ${t("modules.bibliography.toastAlertsDetected")}`,
            description: errorCount === 0 ? t("modules.bibliography.toastCoherentDesc") : t("modules.bibliography.toastAlertsDesc"),
            variant: errorCount === 0 ? "default" : "destructive",
          });
        },
        onError: (error: any) => {
          toast({ title: t("modules.bibliography.toastError"), description: error.message || t("modules.bibliography.toastVerifError"), variant: "destructive" });
        },
      }
    );
  };

  const handleCopy = () => {
    if (bibliography) {
      navigator.clipboard.writeText(bibliography);
      toast({ title: t("modules.bibliography.toastCopied"), description: t("modules.bibliography.toastCopiedDesc") });
    }
  };

  const handleExportWord = () => {
    if (!bibliography) return;
    exportToWord(
      t("modules.bibliography.exportLabel"),
      [{ label: `${t("modules.bibliography.exportLabel")} (${getNormLabel(norm)})`, content: bibliography }],
      `bibliographie_${norm}`
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Library className="w-5 h-5 text-primary" />
              <CardTitle className="text-base md:text-lg">{t("modules.bibliography.title")}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isValidated ? (
                <Button
                  variant="outline"
                  onClick={() => section?.id && unvalidateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={unvalidateMutation.isPending}
                  data-testid="button-unvalidate-bibliography"
                >
                  <X className="w-4 h-4 mr-1" /> {t("modules.bibliography.unvalidate")}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => section?.id && validateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={validateMutation.isPending || !bibliography}
                  data-testid="button-validate-bibliography"
                >
                  <Check className="w-4 h-4 mr-1" /> {t("modules.bibliography.validate")}
                </Button>
              )}
              <Button variant="outline" onClick={handleExportWord} disabled={!bibliography} data-testid="button-export-bibliography">
                <FileDown className="w-4 h-4 mr-1" /> Word
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="context-instructions-bibliography" className="text-base font-semibold">{t("modules.bibliography.contextLabel")}</Label>
            <Textarea
              id="context-instructions-bibliography"
              value={contextInstructions}
              onChange={e => setContextInstructions(e.target.value)}
              placeholder={t("modules.bibliography.contextPlaceholder")}
              className="min-h-[80px] text-sm"
              data-testid="textarea-context-instructions-bibliography"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="text-base font-semibold">{t("modules.bibliography.importExistingLabel")}</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".txt,.csv,.bib";
                    input.onchange = async (ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        setImportedBibliography(prev => {
                          const combined = [prev, `--- ${file.name} ---\n${text}`].filter(Boolean).join("\n\n");
                          return combined;
                        });
                        toast({ title: t("modules.bibliography.toastImportSuccess"), description: `"${file.name}" ${t("modules.bibliography.toastImportSuccessDesc")}` });
                      } catch {
                        toast({ title: t("modules.bibliography.toastImportError"), description: t("modules.bibliography.toastImportErrorDesc"), variant: "destructive" });
                      }
                    };
                    input.click();
                  }}
                  data-testid="button-import-bibliography"
                >
                  <Upload className="w-4 h-4 mr-1" />{t("modules.bibliography.importFile")}
                </Button>
                {importedBibliography && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImportedBibliography("");
                      toast({ title: t("modules.bibliography.toastImportCleared") });
                    }}
                    data-testid="button-clear-imported-bib"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />{t("modules.bibliography.clear")}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("modules.bibliography.importDesc")}
            </p>
            {importedBibliography && (
              <Textarea
                value={importedBibliography}
                onChange={e => setImportedBibliography(e.target.value)}
                className="min-h-[100px] text-sm font-mono"
                placeholder={t("modules.bibliography.importedPlaceholder")}
                data-testid="textarea-imported-bibliography"
              />
            )}
          </div>

          <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
            {t("modules.bibliography.infoText")}
            {importedBibliography && t("modules.bibliography.importedAlsoConsidered")}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <Label>{t("modules.bibliography.normLabel")}</Label>
              <Select value={norm} onValueChange={setNorm}>
                <SelectTrigger data-testid="select-bibliography-norm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NORM_KEYS.map(({ key, labelKey }) => (
                    <SelectItem key={key} value={key}>{t(labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-bibliography"
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {t("modules.bibliography.generate")}
            </Button>
          </div>

          {bibliography && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label>{t("modules.bibliography.generatedLabel")}</Label>
                  {sources.length > 0 && (
                    <Badge variant="outline" className="text-xs">{sources.length} {t("modules.bibliography.sources")}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy-bibliography">
                  <Copy className="w-4 h-4 mr-1" /> {t("modules.bibliography.copy")}
                </Button>
              </div>
              <Textarea
                value={bibliography}
                onChange={(e) => setBibliography(e.target.value)}
                className="min-h-[300px] resize-y font-mono text-sm"
                data-testid="textarea-bibliography"
              />
            </div>
          )}

          {bibliography && (
            <Button
              variant="outline"
              onClick={handleCheckCoherence}
              disabled={checkMutation.isPending}
              data-testid="button-check-coherence"
            >
              {checkMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              {t("modules.bibliography.checkCoherence")}
            </Button>
          )}

          {alerts.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-sm">{t("modules.bibliography.coherenceAlerts")} ({alerts.length})</span>
                </div>
                {alerts.map((alert, i) => {
                  const Icon = ALERT_ICONS[alert.type] || Info;
                  const color = ALERT_COLORS[alert.type] || "text-muted-foreground";
                  return (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <span>{alert.message}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {coherenceSuggestions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">{t("modules.bibliography.improvementSuggestions")}</span>
                </div>
                <ul className="space-y-2">
                  {coherenceSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {sources.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <span className="font-medium text-sm mb-3 block">{t("modules.bibliography.identifiedSources")} ({sources.length})</span>
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm p-2 rounded-md bg-muted/30">
                      <Badge variant="outline" className="text-xs shrink-0">{source.type}</Badge>
                      <div>
                        <p className="font-medium">{source.author} ({source.year})</p>
                        <p className="text-muted-foreground italic">{source.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
