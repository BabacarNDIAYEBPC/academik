import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateQuestionnaire,
  useGenerateInterviewGuide,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, ClipboardList, Save, Check, X, FileDown, MessageSquare,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface DataCollectionModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedState {
  questionnaireContent: string;
  traceabilityContent: string;
  guideContent: string;
  questionnaireConfig: QuestionnaireConfig;
  guideConfig: GuideConfig;
  contextInstructions: string;
}

interface QuestionnaireConfig {
  questionnaireType: string;
  questionCount: number;
  questionFormats: string[];
  targetDuration: string;
  respondentProfile: string;
  instructions: string;
}

interface GuideConfig {
  interviewType: string;
  targetDuration: string;
  themeCount: number;
  questionsPerTheme: number;
  tone: string;
  intervieweeProfile: string;
  intervieweeFunction: string;
  structureType: string;
  instructions: string;
}

const getQuestionFormats = (t: (key: string) => string) => [
  { value: "likert_5", label: t("modules.dataCollection.formatLikert5") },
  { value: "likert_4", label: t("modules.dataCollection.formatLikert4") },
  { value: "choix_multiple", label: t("modules.dataCollection.formatMultipleChoice") },
  { value: "choix_unique", label: t("modules.dataCollection.formatSingleChoice") },
  { value: "oui_non", label: t("modules.dataCollection.formatYesNo") },
  { value: "question_ouverte", label: t("modules.dataCollection.formatOpenQuestion") },
  { value: "classement", label: t("modules.dataCollection.formatRanking") },
  { value: "numerique", label: t("modules.dataCollection.formatNumericScale") },
];

const DEFAULT_Q_CONFIG: QuestionnaireConfig = {
  questionnaireType: "enquete",
  questionCount: 25,
  questionFormats: ["likert_5", "choix_multiple", "question_ouverte"],
  targetDuration: "15-20 minutes",
  respondentProfile: "",
  instructions: "",
};

const DEFAULT_G_CONFIG: GuideConfig = {
  interviewType: "semi_directif",
  targetDuration: "45-60 minutes",
  themeCount: 4,
  questionsPerTheme: 3,
  tone: "professionnel",
  intervieweeProfile: "",
  intervieweeFunction: "",
  structureType: "",
  instructions: "",
};

export default function DataCollectionModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: DataCollectionModuleProps) {
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [questionnaireContent, setQuestionnaireContent] = useState("");
  const [traceabilityContent, setTraceabilityContent] = useState("");
  const [guideContent, setGuideContent] = useState("");
  const [qConfig, setQConfig] = useState<QuestionnaireConfig>(DEFAULT_Q_CONFIG);
  const [gConfig, setGConfig] = useState<GuideConfig>(DEFAULT_G_CONFIG);
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const questionnaireMutation = useGenerateQuestionnaire();
  const guideMutation = useGenerateInterviewGuide();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ questionnaireContent, traceabilityContent, guideContent, qConfig, gConfig, contextInstructions });
  useEffect(() => {
    stateRef.current = { questionnaireContent, traceabilityContent, guideContent, qConfig, gConfig, contextInstructions };
  }, [questionnaireContent, traceabilityContent, guideContent, qConfig, gConfig, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      questionnaireContent: s.questionnaireContent,
      traceabilityContent: s.traceabilityContent,
      guideContent: s.guideContent,
      questionnaireConfig: s.qConfig,
      guideConfig: s.gConfig,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { dataCollectionState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.dataCollectionState) {
      const s = cfg.dataCollectionState as SavedState;
      if (s.questionnaireContent) setQuestionnaireContent(s.questionnaireContent);
      if (s.traceabilityContent) setTraceabilityContent(s.traceabilityContent);
      if (s.guideContent) setGuideContent(s.guideContent);
      if (s.questionnaireConfig) setQConfig({ ...DEFAULT_Q_CONFIG, ...s.questionnaireConfig });
      if (s.guideConfig) setGConfig({ ...DEFAULT_G_CONFIG, ...s.guideConfig });
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
  }, [questionnaireContent, traceabilityContent, guideContent, qConfig, gConfig, contextInstructions, stateLoaded, doSave]);

  const handleGenerateQuestionnaire = () => {
    questionnaireMutation.mutate(
      { projectId, config: qConfig, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setQuestionnaireContent(data.content);
          setTraceabilityContent(data.traceability);
          toast({ title: t("modules.dataCollection.toastQuestionnaireGenerated"), description: t("modules.dataCollection.toastQuestionnaireGeneratedDesc") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataCollection.toastErrorGenerating"), variant: "destructive" });
        },
      }
    );
  };

  const handleGenerateGuide = () => {
    guideMutation.mutate(
      { projectId, config: gConfig, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setGuideContent(data.content);
          toast({ title: t("modules.dataCollection.toastGuideGenerated"), description: t("modules.dataCollection.toastGuideGeneratedDesc") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataCollection.toastErrorGenerating"), variant: "destructive" });
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
    const sections = [];
    if (questionnaireContent) sections.push({ label: t("modules.dataCollection.exportQuestionnaire"), content: questionnaireContent });
    if (traceabilityContent) sections.push({ label: t("modules.dataCollection.exportTraceability"), content: traceabilityContent });
    if (guideContent) sections.push({ label: t("modules.dataCollection.exportGuide"), content: guideContent });
    if (sections.length === 0) {
      toast({ title: t("modules.common.nothingToExport"), description: t("modules.dataCollection.nothingToExportDesc"), variant: "destructive" });
      return;
    }
    exportToWord(t("modules.dataCollection.exportTitle"), sections, "collecte_donnees.docx");
  };

  const toggleFormat = (format: string) => {
    setQConfig(prev => ({
      ...prev,
      questionFormats: prev.questionFormats.includes(format)
        ? prev.questionFormats.filter(f => f !== format)
        : [...prev.questionFormats, format],
    }));
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{t("modules.dataCollection.exportTitle")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-collection">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-collection">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="button-validate-collection">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate-collection">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="context-instructions-collection" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="context-instructions-collection"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="textarea-context-instructions-collection"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="questionnaire" className="gap-1" data-testid="tab-questionnaire">
              <ClipboardList className="w-4 h-4" />{t("modules.dataCollection.questionnaireTabLabel")}
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-1" data-testid="tab-guide">
              <MessageSquare className="w-4 h-4" />{t("modules.dataCollection.interviewGuideTabLabel")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questionnaire" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.questionnaireTypeLabel")}</Label>
                  <Select value={qConfig.questionnaireType} onValueChange={v => setQConfig(p => ({ ...p, questionnaireType: v }))}>
                    <SelectTrigger data-testid="select-q-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enquete">{t("modules.dataCollection.typeEnquete")}</SelectItem>
                      <SelectItem value="satisfaction">{t("modules.dataCollection.typeSatisfaction")}</SelectItem>
                      <SelectItem value="evaluation">{t("modules.dataCollection.typeEvaluation")}</SelectItem>
                      <SelectItem value="diagnostic">{t("modules.dataCollection.typeDiagnostic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.questionCountLabel")}</Label>
                  <Input
                    type="number"
                    value={qConfig.questionCount}
                    onChange={e => setQConfig(p => ({ ...p, questionCount: parseInt(e.target.value) || 20 }))}
                    min={5}
                    max={60}
                    data-testid="input-q-count"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.targetDurationLabel")}</Label>
                  <Select value={qConfig.targetDuration} onValueChange={v => setQConfig(p => ({ ...p, targetDuration: v }))}>
                    <SelectTrigger data-testid="select-q-duration"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10 minutes">5-10 minutes</SelectItem>
                      <SelectItem value="10-15 minutes">10-15 minutes</SelectItem>
                      <SelectItem value="15-20 minutes">15-20 minutes</SelectItem>
                      <SelectItem value="20-30 minutes">20-30 minutes</SelectItem>
                      <SelectItem value="30+ minutes">30+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.respondentProfileLabel")}</Label>
                  <Input
                    value={qConfig.respondentProfile}
                    onChange={e => setQConfig(p => ({ ...p, respondentProfile: e.target.value }))}
                    placeholder={t("modules.dataCollection.respondentProfilePlaceholder")}
                    data-testid="input-q-profile"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.questionFormatsLabel")}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {getQuestionFormats(t).map(f => (
                      <Badge
                        key={f.value}
                        variant={qConfig.questionFormats.includes(f.value) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleFormat(f.value)}
                        data-testid={`badge-format-${f.value}`}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("modules.dataCollection.additionalInstructions")}</Label>
              <Textarea
                value={qConfig.instructions}
                onChange={e => setQConfig(p => ({ ...p, instructions: e.target.value }))}
                placeholder={t("modules.dataCollection.additionalInstructionsPlaceholder")}
                className="h-20 text-sm"
                data-testid="textarea-q-instructions"
              />
            </div>
            <Button
              onClick={handleGenerateQuestionnaire}
              disabled={questionnaireMutation.isPending || !qConfig.respondentProfile}
              data-testid="button-generate-questionnaire"
            >
              {questionnaireMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ClipboardList className="w-4 h-4 mr-2" />}
              {t("modules.dataCollection.generateQuestionnaireBtn")}
            </Button>

            {questionnaireContent && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-base font-semibold">{t("modules.dataCollection.generatedQuestionnaireLabel")}</Label>
                  <Textarea
                    value={questionnaireContent}
                    onChange={e => setQuestionnaireContent(e.target.value)}
                    className="min-h-[300px] text-sm font-mono"
                    data-testid="textarea-questionnaire-content"
                  />
                </div>
                {traceabilityContent && (
                  <div className="space-y-1.5">
                    <Label className="text-base font-semibold">{t("modules.dataCollection.traceabilityLabel")}</Label>
                    <Textarea
                      value={traceabilityContent}
                      onChange={e => setTraceabilityContent(e.target.value)}
                      className="min-h-[200px] text-sm font-mono"
                      data-testid="textarea-traceability-content"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guide" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.interviewTypeLabel")}</Label>
                  <Select value={gConfig.interviewType} onValueChange={v => setGConfig(p => ({ ...p, interviewType: v }))}>
                    <SelectTrigger data-testid="select-g-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semi_directif">{t("modules.dataCollection.typeSemiDirectif")}</SelectItem>
                      <SelectItem value="directif">{t("modules.dataCollection.typeDirectif")}</SelectItem>
                      <SelectItem value="non_directif">{t("modules.dataCollection.typeNonDirectif")}</SelectItem>
                      <SelectItem value="comprehensif">{t("modules.dataCollection.typeComprehensif")}</SelectItem>
                      <SelectItem value="focus_group">{t("modules.dataCollection.typeFocusGroup")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.targetDurationLabel")}</Label>
                  <Select value={gConfig.targetDuration} onValueChange={v => setGConfig(p => ({ ...p, targetDuration: v }))}>
                    <SelectTrigger data-testid="select-g-duration"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20-30 minutes">20-30 minutes</SelectItem>
                      <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                      <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                      <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.themeCountLabel")}</Label>
                  <Input
                    type="number"
                    value={gConfig.themeCount}
                    onChange={e => setGConfig(p => ({ ...p, themeCount: parseInt(e.target.value) || 4 }))}
                    min={2}
                    max={8}
                    data-testid="input-g-themes"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.questionsPerThemeLabel")}</Label>
                  <Input
                    type="number"
                    value={gConfig.questionsPerTheme}
                    onChange={e => setGConfig(p => ({ ...p, questionsPerTheme: parseInt(e.target.value) || 3 }))}
                    min={1}
                    max={6}
                    data-testid="input-g-questions-per-theme"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.toneLabel")}</Label>
                  <Select value={gConfig.tone} onValueChange={v => setGConfig(p => ({ ...p, tone: v }))}>
                    <SelectTrigger data-testid="select-g-tone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professionnel">{t("modules.dataCollection.toneProfessionnel")}</SelectItem>
                      <SelectItem value="empathique">{t("modules.dataCollection.toneEmpathique")}</SelectItem>
                      <SelectItem value="neutre">{t("modules.dataCollection.toneNeutre")}</SelectItem>
                      <SelectItem value="convivial">{t("modules.dataCollection.toneConvivial")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.intervieweeProfileLabel")}</Label>
                  <Input
                    value={gConfig.intervieweeProfile}
                    onChange={e => setGConfig(p => ({ ...p, intervieweeProfile: e.target.value }))}
                    placeholder={t("modules.dataCollection.intervieweeProfilePlaceholder")}
                    data-testid="input-g-profile"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.intervieweeFunctionLabel")}</Label>
                  <Input
                    value={gConfig.intervieweeFunction}
                    onChange={e => setGConfig(p => ({ ...p, intervieweeFunction: e.target.value }))}
                    placeholder={t("modules.dataCollection.intervieweeFunctionPlaceholder")}
                    data-testid="input-g-function"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("modules.dataCollection.structureTypeLabel")}</Label>
                  <Input
                    value={gConfig.structureType}
                    onChange={e => setGConfig(p => ({ ...p, structureType: e.target.value }))}
                    placeholder={t("modules.dataCollection.structureTypePlaceholder")}
                    data-testid="input-g-structure"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("modules.dataCollection.additionalInstructions")}</Label>
              <Textarea
                value={gConfig.instructions}
                onChange={e => setGConfig(p => ({ ...p, instructions: e.target.value }))}
                placeholder={t("modules.dataCollection.guideInstructionsPlaceholder")}
                className="h-20 text-sm"
                data-testid="textarea-g-instructions"
              />
            </div>
            <Button
              onClick={handleGenerateGuide}
              disabled={guideMutation.isPending}
              data-testid="button-generate-guide"
            >
              {guideMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              {t("modules.dataCollection.generateGuideBtn")}
            </Button>

            {guideContent && (
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">{t("modules.dataCollection.generatedGuideLabel")}</Label>
                <Textarea
                  value={guideContent}
                  onChange={e => setGuideContent(e.target.value)}
                  className="min-h-[400px] text-sm font-mono"
                  data-testid="textarea-guide-content"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
