import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateInterviewGuide,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, FileText, Save, Check, X, FileDown, MessageSquare,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

interface GuideEntretienModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
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

interface SavedState {
  guideContent: string;
  guideConfig: GuideConfig;
  contextInstructions: string;
}

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

export default function GuideEntretienModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: GuideEntretienModuleProps) {
  const [guideContent, setGuideContent] = useState("");
  const [gConfig, setGConfig] = useState<GuideConfig>(DEFAULT_G_CONFIG);
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const guideMutation = useGenerateInterviewGuide();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ guideContent, gConfig, contextInstructions });
  useEffect(() => {
    stateRef.current = { guideContent, gConfig, contextInstructions };
  }, [guideContent, gConfig, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      guideContent: s.guideContent,
      guideConfig: s.gConfig,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { guideEntretienState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.guideEntretienState) {
      const s = cfg.guideEntretienState as SavedState;
      if (s.guideContent) setGuideContent(s.guideContent);
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
  }, [guideContent, gConfig, contextInstructions, stateLoaded, doSave]);

  const handleGenerateGuide = () => {
    guideMutation.mutate(
      { projectId, config: gConfig, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setGuideContent(data.content);
          toast({ title: t("modules.interviewGuide.guideGenerated"), description: t("modules.interviewGuide.guideGeneratedDesc") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.interviewGuide.guideError"), variant: "destructive" });
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
    if (guideContent) sections.push({ label: t("modules.interviewGuide.resultLabel"), content: guideContent });
    if (sections.length === 0) {
      toast({ title: t("modules.common.nothingToExport"), description: t("modules.interviewGuide.guideError"), variant: "destructive" });
      return;
    }
    exportToWord(t("modules.interviewGuide.title"), sections, "guide_entretien.docx");
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{t("modules.interviewGuide.title")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="guide-entretien-button-save">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="guide-entretien-button-export">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="guide-entretien-button-validate">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="guide-entretien-button-unvalidate">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="guide-entretien-context-instructions" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="guide-entretien-context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="guide-entretien-textarea-context-instructions"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t("modules.interviewGuide.interviewTypeLabel")}</Label>
                <Select value={gConfig.interviewType} onValueChange={v => setGConfig(p => ({ ...p, interviewType: v }))}>
                  <SelectTrigger data-testid="guide-entretien-select-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semi_directif">{t("modules.interviewGuide.semiDirective")}</SelectItem>
                    <SelectItem value="directif">{t("modules.interviewGuide.directive")}</SelectItem>
                    <SelectItem value="non_directif">{t("modules.interviewGuide.nonDirective")}</SelectItem>
                    <SelectItem value="comprehensif">{t("modules.interviewGuide.comprehensive")}</SelectItem>
                    <SelectItem value="focus_group">{t("modules.interviewGuide.focusGroup")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("modules.interviewGuide.interviewDurationLabel")}</Label>
                <Select value={gConfig.targetDuration} onValueChange={v => setGConfig(p => ({ ...p, targetDuration: v }))}>
                  <SelectTrigger data-testid="guide-entretien-select-duration"><SelectValue /></SelectTrigger>
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
                  data-testid="guide-entretien-input-themes"
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
                  data-testid="guide-entretien-input-questions-per-theme"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t("modules.dataCollection.toneLabel")}</Label>
                <Select value={gConfig.tone} onValueChange={v => setGConfig(p => ({ ...p, tone: v }))}>
                  <SelectTrigger data-testid="guide-entretien-select-tone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professionnel">{t("modules.interviewGuide.toneProfessional")}</SelectItem>
                    <SelectItem value="empathique">{t("modules.interviewGuide.toneEmpathetic")}</SelectItem>
                    <SelectItem value="neutre">{t("modules.interviewGuide.toneNeutral")}</SelectItem>
                    <SelectItem value="convivial">{t("modules.interviewGuide.toneFriendly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("modules.dataCollection.intervieweeProfileLabel")}</Label>
                <Input
                  value={gConfig.intervieweeProfile}
                  onChange={e => setGConfig(p => ({ ...p, intervieweeProfile: e.target.value }))}
                  placeholder={t("modules.dataCollection.intervieweeProfilePlaceholder")}
                  data-testid="guide-entretien-input-profile"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("modules.dataCollection.intervieweeFunctionLabel")}</Label>
                <Input
                  value={gConfig.intervieweeFunction}
                  onChange={e => setGConfig(p => ({ ...p, intervieweeFunction: e.target.value }))}
                  placeholder={t("modules.dataCollection.intervieweeFunctionPlaceholder")}
                  data-testid="guide-entretien-input-function"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("modules.dataCollection.structureTypeLabel")}</Label>
                <Input
                  value={gConfig.structureType}
                  onChange={e => setGConfig(p => ({ ...p, structureType: e.target.value }))}
                  placeholder={t("modules.dataCollection.structureTypePlaceholder")}
                  data-testid="guide-entretien-input-structure"
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
              data-testid="guide-entretien-textarea-instructions"
            />
          </div>
          <Button
            onClick={handleGenerateGuide}
            disabled={guideMutation.isPending}
            data-testid="guide-entretien-button-generate"
          >
            {guideMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            {t("modules.interviewGuide.generateGuide")}
          </Button>

          {guideContent && (
            <div className="space-y-1.5">
              <Label className="text-base font-semibold">{t("modules.interviewGuide.resultLabel")}</Label>
              <Textarea
                value={guideContent}
                onChange={e => setGuideContent(e.target.value)}
                className="min-h-[400px] text-sm font-mono"
                data-testid="guide-entretien-textarea-content"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
