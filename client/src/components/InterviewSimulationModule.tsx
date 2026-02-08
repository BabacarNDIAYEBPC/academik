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
  useSimulateResponse,
  useSimulateBatch,
  useImproveQuestion,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, MessageSquare, Save, Check, X, FileDown,
  Lightbulb, RefreshCw, Sparkles, Plus, Trash2, ListOrdered, Import, Upload,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface InterviewSimulationModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
  dataCollectionSection?: ProjectSection;
}

interface SimulationEntry {
  id: string;
  question: string;
  profile: string;
  response: string;
  suggestions: string[];
  improvements: { type: string; improved: string; explanation: string }[];
}

interface BatchQuestion {
  id: string;
  question: string;
  prerequisites: string;
}

interface SavedState {
  entries: SimulationEntry[];
  currentQuestion: string;
  currentProfile: string;
  currentTone: string;
  batchQuestions: BatchQuestion[];
  batchProfile: string;
  batchTone: string;
  contextInstructions: string;
}

const getImprovementTypes = (t: (key: string) => string) => [
  { value: "clarify", label: t("modules.interviewSimulation.improveClarify") },
  { value: "remove_bias", label: t("modules.interviewSimulation.improveRemoveBias") },
  { value: "make_open", label: t("modules.interviewSimulation.improveMakeOpen") },
  { value: "make_targeted", label: t("modules.interviewSimulation.improveMakeTargeted") },
  { value: "suggest_relances", label: t("modules.interviewSimulation.improveSuggestFollowUp") },
];

export default function InterviewSimulationModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
  dataCollectionSection,
}: InterviewSimulationModuleProps) {
  const [entries, setEntries] = useState<SimulationEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentProfile, setCurrentProfile] = useState("");
  const [currentTone, setCurrentTone] = useState("professionnel");
  const [batchQuestions, setBatchQuestions] = useState<BatchQuestion[]>([]);
  const [batchProfile, setBatchProfile] = useState("");
  const [batchTone, setBatchTone] = useState("professionnel");
  const [simMode, setSimMode] = useState("single");
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const simulateMutation = useSimulateResponse();
  const batchMutation = useSimulateBatch();
  const improveMutation = useImproveQuestion();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ entries, currentQuestion, currentProfile, currentTone, batchQuestions, batchProfile, batchTone, contextInstructions });
  useEffect(() => {
    stateRef.current = { entries, currentQuestion, currentProfile, currentTone, batchQuestions, batchProfile, batchTone, contextInstructions };
  }, [entries, currentQuestion, currentProfile, currentTone, batchQuestions, batchProfile, batchTone, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      entries: s.entries,
      currentQuestion: s.currentQuestion,
      currentProfile: s.currentProfile,
      currentTone: s.currentTone,
      batchQuestions: s.batchQuestions,
      batchProfile: s.batchProfile,
      batchTone: s.batchTone,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { simulationState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.simulationState) {
      const s = cfg.simulationState as SavedState;
      if (s.entries) setEntries(s.entries);
      if (s.currentQuestion) setCurrentQuestion(s.currentQuestion);
      if (s.currentProfile) setCurrentProfile(s.currentProfile);
      if (s.currentTone) setCurrentTone(s.currentTone);
      if (s.batchQuestions) setBatchQuestions(s.batchQuestions);
      if (s.batchProfile) setBatchProfile(s.batchProfile);
      if (s.batchTone) setBatchTone(s.batchTone);
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
  }, [entries, currentQuestion, currentProfile, currentTone, batchQuestions, batchProfile, batchTone, contextInstructions, stateLoaded, doSave]);

  const handleSimulate = () => {
    if (!currentQuestion.trim() || !currentProfile.trim()) {
      toast({ title: t("modules.interviewSimulation.fillRequired"), description: t("modules.interviewSimulation.questionRequired"), variant: "destructive" });
      return;
    }
    simulateMutation.mutate(
      { projectId, question: currentQuestion, intervieweeProfile: currentProfile, tone: currentTone, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          const entry: SimulationEntry = {
            id: Date.now().toString(),
            question: currentQuestion,
            profile: currentProfile,
            response: data.response,
            suggestions: data.suggestions || [],
            improvements: [],
          };
          setEntries(prev => [entry, ...prev]);
          toast({ title: t("modules.interviewSimulation.simulationGenerated"), description: t("modules.interviewSimulation.simulationGeneratedDesc") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.interviewSimulation.simulationError"), variant: "destructive" });
        },
      }
    );
  };

  const guideContent = useMemo(() => {
    if (!dataCollectionSection) return "";
    const cfg = dataCollectionSection.config as any;
    return cfg?.collectionState?.guideContent || "";
  }, [dataCollectionSection]);

  const parseGuideQuestions = useCallback((text: string): BatchQuestion[] => {
    if (!text.trim()) return [];
    const htmlStripped = text.replace(/<[^>]+>/g, "\n");
    const lines = htmlStripped.split("\n").filter(l => l.trim());
    const questions: BatchQuestion[] = [];
    const questionStems = [
      "comment", "quel", "quelle", "quels", "quelles", "pourquoi",
      "pouvez", "décrivez", "expliquez", "parlez", "racontez",
      "dans quelle mesure", "de quelle manière", "selon vous",
      "pensez", "estimez", "considérez", "avez-vous", "êtes-vous",
      "qu'est-ce", "que pensez", "que signifie", "en quoi",
      "à quel point", "combien",
    ];
    for (const line of lines) {
      const cleaned = line.replace(/^[\s\-\*•→▸◦]+/, "").replace(/^\d+[\.\)\-]\s*/, "").trim();
      if (cleaned.length < 10) continue;
      const lower = cleaned.toLowerCase();
      const endsWithQuestion = cleaned.endsWith("?");
      const startsWithStem = questionStems.some(stem => lower.startsWith(stem));
      if (endsWithQuestion || startsWithStem) {
        questions.push({ id: `guide_${Date.now()}_${questions.length}`, question: cleaned, prerequisites: "" });
      }
    }
    return questions;
  }, []);

  const handleImportFromGuide = () => {
    if (!guideContent.trim()) {
      toast({ title: t("modules.interviewSimulation.noGuideAvailable"), description: t("modules.interviewSimulation.noGuideAvailableDesc"), variant: "destructive" });
      return;
    }
    const parsed = parseGuideQuestions(guideContent);
    if (parsed.length === 0) {
      toast({ title: t("modules.interviewSimulation.noQuestionsDetected"), description: t("modules.interviewSimulation.noQuestionsDetectedDesc"), variant: "destructive" });
      return;
    }
    setBatchQuestions(parsed);
    toast({ title: t("modules.interviewSimulation.questionsImported"), description: `${parsed.length} ${t("modules.interviewSimulation.questionsImportedFromGuide")}` });
  };

  const handleImportGuideFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".docx,.pdf,.txt,.rtf,.md,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingGuide(true);
      try {
        let text = "";
        const needsServerParse = /\.(docx|pdf|rtf)$/i.test(file.name);
        if (needsServerParse) {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/parse-file", { method: "POST", body: formData, credentials: "include" });
          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({ message: t("modules.common.serverError") }));
            throw new Error(errData.message || t("modules.common.cannotReadFile"));
          }
          const data = await resp.json();
          text = data.text;
        } else {
          text = await file.text();
        }
        if (!text.trim()) {
          toast({ title: t("modules.interviewSimulation.emptyFile"), description: t("modules.interviewSimulation.emptyFileDesc"), variant: "destructive" });
          setUploadingGuide(false);
          return;
        }
        const parsed = parseGuideQuestions(text);
        if (parsed.length === 0) {
          toast({ title: t("modules.interviewSimulation.noQuestionsDetected"), description: t("modules.interviewSimulation.noQuestionsInFile"), variant: "destructive" });
          setUploadingGuide(false);
          return;
        }
        setBatchQuestions(parsed);
        setSimMode("batch");
        toast({ title: t("modules.interviewSimulation.guideImportedFile"), description: `${parsed.length} ${t("modules.interviewSimulation.questionsExtractedFromFile")} "${file.name}".` });
      } catch (err: any) {
        toast({ title: t("modules.interviewSimulation.importError"), description: err.message || t("modules.common.cannotReadFile"), variant: "destructive" });
      } finally {
        setUploadingGuide(false);
      }
    };
    input.click();
  };

  const handleAddBatchQuestion = () => {
    setBatchQuestions(prev => [...prev, { id: Date.now().toString(), question: "", prerequisites: "" }]);
  };

  const handleRemoveBatchQuestion = (id: string) => {
    setBatchQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleUpdateBatchQuestion = (id: string, field: "question" | "prerequisites", value: string) => {
    setBatchQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSimulateBatch = () => {
    const validQuestions = batchQuestions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
      toast({ title: t("modules.interviewSimulation.questionsRequired"), description: t("modules.interviewSimulation.questionsRequiredDesc"), variant: "destructive" });
      return;
    }
    if (!batchProfile.trim()) {
      toast({ title: t("modules.interviewSimulation.profileRequired"), description: t("modules.interviewSimulation.profileRequiredDesc"), variant: "destructive" });
      return;
    }
    batchMutation.mutate(
      {
        projectId,
        questions: validQuestions.map(q => ({ question: q.question, prerequisites: q.prerequisites || undefined })),
        intervieweeProfile: batchProfile,
        tone: batchTone,
        extraContext: combinedContext || undefined,
      },
      {
        onSuccess: (data) => {
          const newEntries: SimulationEntry[] = (data.responses || []).map((r: any, i: number) => ({
            id: `batch_${Date.now()}_${i}`,
            question: r.question,
            profile: batchProfile,
            response: r.response,
            suggestions: r.suggestions || [],
            improvements: [],
          }));
          setEntries(prev => [...newEntries, ...prev]);
          toast({ title: t("modules.interviewSimulation.batchSimComplete"), description: `${newEntries.length} ${t("modules.interviewSimulation.batchSimulatedDesc")}` });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.interviewSimulation.batchSimError"), variant: "destructive" });
        },
      }
    );
  };

  const handleImprove = (entryId: string, improvementType: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    improveMutation.mutate(
      { projectId, question: entry.question, improvementType, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setEntries(prev => prev.map(e =>
            e.id === entryId
              ? { ...e, improvements: [...e.improvements, { type: improvementType, improved: data.improved, explanation: data.explanation }] }
              : e
          ));
          toast({ title: t("modules.interviewSimulation.improvementGenerated") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.interviewSimulation.improveError"), variant: "destructive" });
        },
      }
    );
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.sectionValidated") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.validationRemoved") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast({ title: t("modules.common.nothingToExport"), variant: "destructive" });
      return;
    }
    const sections = entries.map((e, i) => ({
      label: `${t("modules.interviewSimulation.simulationLabel")} ${i + 1}: ${e.question.substring(0, 50)}...`,
      content: `**Question:** ${e.question}\n\n**Profil:** ${e.profile}\n\n**${t("modules.interviewSimulation.simulatedResponse")}:**\n${e.response}\n\n${e.suggestions.length > 0 ? `**${t("modules.interviewSimulation.followUpSuggestions")}:**\n${e.suggestions.map((s, j) => `${j + 1}. ${s}`).join("\n")}\n\n` : ""}${e.improvements.length > 0 ? `**${t("modules.interviewSimulation.proposedImprovements")}:**\n${e.improvements.map(imp => `- ${getImprovementTypes(t).find(it => it.value === imp.type)?.label || imp.type}: ${imp.improved}\n  _${imp.explanation}_`).join("\n\n")}` : ""}`,
    }));
    exportToWord(t("modules.interviewSimulation.exportTitle"), sections, "simulation_entretiens.docx");
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">{t("modules.interviewSimulation.title")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-simulation">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-simulation">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="button-validate-simulation">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate-simulation">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="context-instructions-simulation" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="context-instructions-simulation"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="textarea-context-instructions-simulation"
          />
        </div>

        <Tabs value={simMode} onValueChange={setSimMode}>
          <TabsList className="mb-4">
            <TabsTrigger value="single" data-testid="tab-sim-single">
              <MessageSquare className="w-4 h-4 mr-1" /> {t("modules.interviewSimulation.singleTab")}
            </TabsTrigger>
            <TabsTrigger value="batch" data-testid="tab-sim-batch">
              <ListOrdered className="w-4 h-4 mr-1" /> {t("modules.interviewSimulation.batchTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("modules.interviewSimulation.singleDesc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>{t("modules.interviewSimulation.questionLabel")}</Label>
                      <Textarea
                        value={currentQuestion}
                        onChange={e => setCurrentQuestion(e.target.value)}
                        placeholder={t("modules.interviewSimulation.questionPlaceholder")}
                        className="h-24 text-sm"
                        data-testid="textarea-sim-question"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>{t("modules.interviewSimulation.profileLabel")}</Label>
                      <Input
                        value={currentProfile}
                        onChange={e => setCurrentProfile(e.target.value)}
                        placeholder={t("modules.interviewSimulation.profilePlaceholder")}
                        data-testid="input-sim-profile"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("modules.interviewSimulation.toneLabel")}</Label>
                      <Select value={currentTone} onValueChange={setCurrentTone}>
                        <SelectTrigger data-testid="select-sim-tone"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professionnel">{t("modules.interviewSimulation.toneProfessionnel")}</SelectItem>
                          <SelectItem value="enthousiaste">{t("modules.interviewSimulation.toneEnthousiaste")}</SelectItem>
                          <SelectItem value="reserve">{t("modules.interviewSimulation.toneReserve")}</SelectItem>
                          <SelectItem value="critique">{t("modules.interviewSimulation.toneCritique")}</SelectItem>
                          <SelectItem value="neutre">{t("modules.interviewSimulation.toneNeutre")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSimulate}
                  disabled={simulateMutation.isPending || !currentQuestion.trim() || !currentProfile.trim()}
                  data-testid="button-simulate"
                >
                  {simulateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {t("modules.interviewSimulation.simulateResponse")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-sm text-muted-foreground flex-1 min-w-0">
                    {t("modules.interviewSimulation.batchDesc")}
                    {" "}{t("modules.interviewSimulation.batchDescSub")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportGuideFile}
                    disabled={uploadingGuide}
                    data-testid="button-import-guide-file"
                  >
                    {uploadingGuide ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {t("modules.interviewSimulation.importGuideBtn")}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("modules.interviewSimulation.batchProfileLabel")}</Label>
                    <Input
                      value={batchProfile}
                      onChange={e => setBatchProfile(e.target.value)}
                      placeholder={t("modules.interviewSimulation.batchProfilePlaceholder")}
                      data-testid="input-batch-profile"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("modules.interviewSimulation.batchToneLabel")}</Label>
                    <Select value={batchTone} onValueChange={setBatchTone}>
                      <SelectTrigger data-testid="select-batch-tone"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professionnel">{t("modules.interviewSimulation.toneProfessionnel")}</SelectItem>
                        <SelectItem value="enthousiaste">{t("modules.interviewSimulation.toneEnthousiaste")}</SelectItem>
                        <SelectItem value="reserve">{t("modules.interviewSimulation.toneReserve")}</SelectItem>
                        <SelectItem value="critique">{t("modules.interviewSimulation.toneCritique")}</SelectItem>
                        <SelectItem value="neutre">{t("modules.interviewSimulation.toneNeutre")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label>{t("modules.interviewSimulation.questionsLabel")} ({batchQuestions.length})</Label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {guideContent && (
                        <Button variant="outline" size="sm" onClick={handleImportFromGuide} data-testid="button-import-guide">
                          <Import className="w-4 h-4 mr-1" /> {t("modules.interviewSimulation.importFromGuide")}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleAddBatchQuestion} data-testid="button-add-batch-question">
                        <Plus className="w-4 h-4 mr-1" /> {t("modules.interviewSimulation.addQuestion")}
                      </Button>
                    </div>
                  </div>

                  {batchQuestions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-md space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground/50" />
                      <p>
                        {guideContent
                          ? t("modules.interviewSimulation.emptyWithGuide")
                          : t("modules.interviewSimulation.emptyWithoutGuide")}
                      </p>
                      <Button variant="outline" size="sm" onClick={handleImportGuideFile} disabled={uploadingGuide} data-testid="button-import-guide-file-empty">
                        {uploadingGuide ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        {t("modules.interviewSimulation.importFileBtn")}
                      </Button>
                    </div>
                  )}

                  {batchQuestions.map((q, idx) => (
                    <div key={q.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">Q{idx + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBatchQuestion(q.id)}
                          data-testid={`button-remove-batch-q-${idx}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <Textarea
                        value={q.question}
                        onChange={e => handleUpdateBatchQuestion(q.id, "question", e.target.value)}
                        placeholder={t("modules.interviewSimulation.questionPlaceholderBatch")}
                        className="h-16 text-sm"
                        data-testid={`textarea-batch-q-${idx}`}
                      />
                      <Input
                        value={q.prerequisites}
                        onChange={e => handleUpdateBatchQuestion(q.id, "prerequisites", e.target.value)}
                        placeholder={t("modules.interviewSimulation.prerequisitesPlaceholder")}
                        className="text-sm"
                        data-testid={`input-batch-prereq-${idx}`}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSimulateBatch}
                  disabled={batchMutation.isPending || batchQuestions.filter(q => q.question.trim()).length === 0 || !batchProfile.trim()}
                  data-testid="button-simulate-batch"
                >
                  {batchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {t("modules.interviewSimulation.simulateAllBtn")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {entries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{t("modules.interviewSimulation.simulationsCount")} ({entries.length})</h3>
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium">{entry.question}</p>
                      <Badge variant="outline" className="text-xs">{entry.profile}</Badge>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{t("modules.interviewSimulation.simulatedResponse")}</p>
                    <p className="text-sm whitespace-pre-wrap">{entry.response}</p>
                  </div>

                  {entry.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">{t("modules.interviewSimulation.followUpSuggestions")}</p>
                      <ul className="space-y-1">
                        {entry.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-1.5 flex-wrap">
                    {getImprovementTypes(t).map(imp => (
                      <Button
                        key={imp.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleImprove(entry.id, imp.value)}
                        disabled={improveMutation.isPending}
                        data-testid={`button-improve-${imp.value}-${entry.id}`}
                      >
                        {improveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                        {imp.label}
                      </Button>
                    ))}
                  </div>

                  {entry.improvements.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground">{t("modules.interviewSimulation.proposedImprovements")}</p>
                      {entry.improvements.map((imp, i) => (
                        <div key={i} className="bg-muted/20 rounded-md p-3 space-y-1">
                          <Badge variant="secondary" className="text-xs">{getImprovementTypes(t).find(it => it.value === imp.type)?.label || imp.type}</Badge>
                          <p className="text-sm font-medium mt-1">{imp.improved}</p>
                          <p className="text-xs text-muted-foreground italic">{imp.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
