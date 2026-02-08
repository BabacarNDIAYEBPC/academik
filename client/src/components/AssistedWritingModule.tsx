import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAssistWriting,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, PenTool, Save, Check, X, FileDown,
  RefreshCw, Lightbulb, Copy,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface AssistedWritingModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedState {
  inputText: string;
  outputText: string;
  mode: string;
  sectionTarget: string;
  suggestions: string[];
  contextInstructions: string;
}

const MODE_KEYS = ["reformulate", "clarify", "structure", "improve_style", "check_coherence"] as const;

const MODE_LABEL_MAP: Record<string, { labelKey: string; descKey: string }> = {
  reformulate: { labelKey: "modules.assistedWriting.modeReformulateLabel", descKey: "modules.assistedWriting.modeReformulateDesc" },
  clarify: { labelKey: "modules.assistedWriting.modeClarifyLabel", descKey: "modules.assistedWriting.modeClarifyDesc" },
  structure: { labelKey: "modules.assistedWriting.modeStructureLabel", descKey: "modules.assistedWriting.modeStructureDesc" },
  improve_style: { labelKey: "modules.assistedWriting.modeImproveStyleLabel", descKey: "modules.assistedWriting.modeImproveStyleDesc" },
  check_coherence: { labelKey: "modules.assistedWriting.modeCheckCoherenceLabel", descKey: "modules.assistedWriting.modeCheckCoherenceDesc" },
};

const SECTION_TARGET_KEYS = [
  { key: "introduction", labelKey: "modules.assistedWriting.sectionIntroduction" },
  { key: "revue_litterature", labelKey: "modules.assistedWriting.sectionLiteratureReview" },
  { key: "cadre_theorique", labelKey: "modules.assistedWriting.sectionTheoreticalFramework" },
  { key: "methodologie", labelKey: "modules.assistedWriting.sectionMethodology" },
  { key: "resultats", labelKey: "modules.assistedWriting.sectionResults" },
  { key: "discussion", labelKey: "modules.assistedWriting.sectionDiscussion" },
  { key: "conclusion", labelKey: "modules.assistedWriting.sectionConclusion" },
];

export default function AssistedWritingModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: AssistedWritingModuleProps) {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("reformulate");
  const [sectionTarget, setSectionTarget] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { t, lang } = useI18n();
  const { toast } = useToast();
  const assistMutation = useAssistWriting();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStateRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (section?.config && !stateLoaded) {
      const saved = section.config as unknown as SavedState;
      if (saved.inputText !== undefined) setInputText(saved.inputText);
      if (saved.outputText !== undefined) setOutputText(saved.outputText);
      if (saved.mode) setMode(saved.mode);
      if (saved.sectionTarget) setSectionTarget(saved.sectionTarget);
      if (saved.suggestions) setSuggestions(saved.suggestions);
      if (saved.contextInstructions) setContextInstructions(saved.contextInstructions);
      setStateLoaded(true);
    } else if (!section?.config) {
      setStateLoaded(true);
    }
  }, [section?.config, stateLoaded]);

  const saveState = useCallback(() => {
    if (!section?.id || !stateLoaded) return;
    const state: SavedState = { inputText, outputText, mode, sectionTarget, suggestions, contextInstructions };
    saveConfigMutation.mutate({ sectionId: section.id, config: state as any, projectId });
  }, [section?.id, inputText, outputText, mode, sectionTarget, suggestions, contextInstructions, stateLoaded, projectId]);

  useEffect(() => { saveStateRef.current = saveState; }, [saveState]);

  useEffect(() => {
    return () => { saveStateRef.current(); };
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveState, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [inputText, outputText, mode, sectionTarget, suggestions, contextInstructions, stateLoaded]);

  const getModeLabel = (m: string) => {
    const map = MODE_LABEL_MAP[m];
    return map ? t(map.labelKey) : m;
  };

  const getModeDesc = (m: string) => {
    const map = MODE_LABEL_MAP[m];
    return map ? t(map.descKey) : "";
  };

  const handleAssist = () => {
    if (!inputText.trim()) {
      toast({ title: t("modules.assistedWriting.toastTextRequired"), description: t("modules.assistedWriting.toastTextRequiredDesc"), variant: "destructive" });
      return;
    }
    assistMutation.mutate(
      { projectId, text: inputText, mode, sectionTarget: sectionTarget || undefined, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setOutputText(data.content);
          setSuggestions(data.suggestions || []);
          toast({ title: t("modules.assistedWriting.toastImproved"), description: `${t("modules.assistedWriting.toastImprovedDesc")} ${getModeLabel(mode)}` });
        },
        onError: (error: any) => {
          toast({ title: t("modules.assistedWriting.toastError"), description: error.message || t("modules.assistedWriting.toastErrorDesc"), variant: "destructive" });
        },
      }
    );
  };

  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({ title: t("modules.assistedWriting.toastCopied"), description: t("modules.assistedWriting.toastCopiedDesc") });
    }
  };

  const handleReplaceInput = () => {
    if (outputText) {
      setInputText(outputText);
      setOutputText("");
      setSuggestions([]);
      toast({ title: t("modules.assistedWriting.toastReplaced"), description: t("modules.assistedWriting.toastReplacedDesc") });
    }
  };

  const handleExportWord = () => {
    if (!outputText) return;
    exportToWord(
      t("modules.assistedWriting.exportTitle"),
      [
        { label: t("modules.assistedWriting.exportOriginal"), content: inputText },
        { label: `${t("modules.assistedWriting.exportImproved")} (${getModeLabel(mode)})`, content: outputText },
        ...(suggestions.length > 0 ? [{ label: t("modules.assistedWriting.exportSuggestions"), content: suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n") }] : []),
      ],
      `redaction_assistee_${mode}`
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PenTool className="w-5 h-5 text-primary" />
              <CardTitle className="text-base md:text-lg">{t("modules.assistedWriting.title")}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isValidated ? (
                <Button
                  variant="outline"
                  onClick={() => section?.id && unvalidateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={unvalidateMutation.isPending}
                  data-testid="button-unvalidate-writing"
                >
                  <X className="w-4 h-4 mr-1" /> {t("modules.assistedWriting.unvalidate")}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => section?.id && validateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={validateMutation.isPending || !outputText}
                  data-testid="button-validate-writing"
                >
                  <Check className="w-4 h-4 mr-1" /> {t("modules.assistedWriting.validate")}
                </Button>
              )}
              <Button variant="outline" onClick={handleExportWord} disabled={!outputText} data-testid="button-export-writing">
                <FileDown className="w-4 h-4 mr-1" /> Word
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="context-instructions-writing" className="text-base font-semibold">{t("modules.assistedWriting.contextLabel")}</Label>
            <Textarea
              id="context-instructions-writing"
              value={contextInstructions}
              onChange={e => setContextInstructions(e.target.value)}
              placeholder={t("modules.assistedWriting.contextPlaceholder")}
              className="min-h-[80px] text-sm"
              data-testid="textarea-context-instructions-writing"
            />
          </div>

          <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
            {t("modules.assistedWriting.infoText")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("modules.assistedWriting.modeLabel")}</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger data-testid="select-writing-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>{getModeLabel(key)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getModeDesc(mode)}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("modules.assistedWriting.sectionTargetLabel")}</Label>
              <Select value={sectionTarget} onValueChange={setSectionTarget}>
                <SelectTrigger data-testid="select-section-target">
                  <SelectValue placeholder={t("modules.assistedWriting.allSections")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("modules.assistedWriting.allSections")}</SelectItem>
                  {SECTION_TARGET_KEYS.map(({ key, labelKey }) => (
                    <SelectItem key={key} value={key}>{t(labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("modules.assistedWriting.yourText")}</Label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("modules.assistedWriting.textPlaceholder")}
              className="min-h-[200px] resize-y"
              data-testid="textarea-input-text"
            />
            <p className="text-xs text-muted-foreground">
              {inputText.split(/\s+/).filter(Boolean).length} {t("modules.assistedWriting.words")}
            </p>
          </div>

          <Button
            onClick={handleAssist}
            disabled={assistMutation.isPending || !inputText.trim()}
            data-testid="button-assist-writing"
          >
            {assistMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenTool className="w-4 h-4 mr-2" />}
            {t("modules.assistedWriting.improveText")}
          </Button>

          {outputText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Label>{t("modules.assistedWriting.improvedText")}</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleCopyOutput} data-testid="button-copy-output">
                    <Copy className="w-4 h-4 mr-1" /> {t("modules.assistedWriting.copy")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReplaceInput} data-testid="button-replace-input">
                    <RefreshCw className="w-4 h-4 mr-1" /> {t("modules.assistedWriting.replaceOriginal")}
                  </Button>
                </div>
              </div>
              <div className="bg-card border rounded-md p-4 whitespace-pre-wrap text-sm leading-relaxed" data-testid="text-output-writing">
                {outputText}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-sm">{t("modules.assistedWriting.additionalSuggestions")}</span>
                </div>
                <ul className="space-y-2">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
