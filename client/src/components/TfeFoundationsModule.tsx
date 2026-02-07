import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import {
  useGenerateSection,
  useSections,
  useSectionVersions,
  useValidatedContents,
  useSaveSectionConfig,
} from "@/hooks/use-sections";
import SectionEditor from "@/components/SectionEditor";
import type { ProjectSection } from "@shared/schema";
import {
  Sparkles,
  Loader2,
  FileText,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Stethoscope,
} from "lucide-react";

const GUIDED_QUESTION_KEYS = [
  "guidedQ1", "guidedQ2", "guidedQ3", "guidedQ4",
  "guidedQ5", "guidedQ6", "guidedQ7", "guidedQ8",
] as const;

interface TfeFoundationsModuleProps {
  project: any;
  sections: ProjectSection[];
}

export default function TfeFoundationsModule({ project, sections }: TfeFoundationsModuleProps) {
  const { t } = useI18n();

  const situationSection = sections.find(s => s.key === "situation_appel");
  const constructionSection = sections.find(s => s.key === "construction_sujet");
  const situationValidated = situationSection?.status === "validated" || situationSection?.status === "final_version";

  return (
    <div className="space-y-8">
      <SituationAppelSection
        project={project}
        section={situationSection}
        sections={sections}
      />
      <ConstructionSujetSection
        project={project}
        section={constructionSection}
        sections={sections}
        situationValidated={situationValidated}
      />
    </div>
  );
}

function SituationAppelSection({
  project,
  section,
  sections,
}: {
  project: any;
  section?: ProjectSection;
  sections: ProjectSection[];
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const generateMutation = useGenerateSection();
  const saveConfigMutation = useSaveSectionConfig();

  const [mode, setMode] = useState<"import" | "guided">("guided");
  const [importText, setImportText] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>(Array(8).fill(""));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    if (!section?.config || configLoaded) return;
    const cfg = section.config as any;
    if (cfg?.tfeMode) setMode(cfg.tfeMode);
    if (cfg?.guidedAnswers && Array.isArray(cfg.guidedAnswers)) {
      setGuidedAnswers(cfg.guidedAnswers);
    }
    if (cfg?.importText) setImportText(cfg.importText);
    setConfigLoaded(true);
  }, [section?.config, configLoaded]);

  const saveConfig = useCallback((updates: Record<string, any>) => {
    if (!section) return;
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: {
        ...(section.config as any || {}),
        ...updates,
      },
      projectId: project.id,
    });
  }, [section, project.id]);

  const handleModeChange = (newMode: "import" | "guided") => {
    setMode(newMode);
    saveConfig({ tfeMode: newMode });
  };

  const handleImportTextChange = (text: string) => {
    setImportText(text);
  };

  const handleImportTextBlur = () => {
    saveConfig({ importText });
  };

  const handleAnswerChange = (idx: number, value: string) => {
    const updated = [...guidedAnswers];
    updated[idx] = value;
    setGuidedAnswers(updated);
  };

  const handleAnswerBlur = () => {
    saveConfig({ guidedAnswers });
  };

  const buildExtraContext = () => {
    if (mode === "import") {
      return `MODE: Import direct\n\nSituation d'appel fournie par l'étudiant(e) :\n${importText}\n\nReformule cette situation d'appel pour la rendre académiquement correcte, claire et professionnelle, tout en conservant le sens et les éléments importants du vécu de l'étudiant(e).`;
    }

    const questionLabels = [
      "Situation vécue",
      "Service et contexte de soins",
      "Rôle de l'étudiant(e)",
      "Faits interpellants",
      "Ressenti",
      "Problème identifié",
      "Difficultés/limites observées",
      "Justification de la réflexion",
    ];

    let ctx = "MODE: Construction guidée\n\nRéponses de l'étudiant(e) au questionnaire :\n\n";
    guidedAnswers.forEach((answer, idx) => {
      if (answer.trim()) {
        ctx += `**${questionLabels[idx]}** : ${answer}\n\n`;
      }
    });
    ctx += "\nÀ partir de ces réponses, rédige une situation d'appel complète, structurée et académiquement conforme.";
    return ctx;
  };

  const canGenerate = mode === "import"
    ? importText.trim().length > 50
    : guidedAnswers.filter(a => a.trim().length > 0).length >= 3;

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        projectId: project.id,
        sectionKey: "situation_appel",
        mode: "initial",
        extraContext: buildExtraContext(),
      },
      {
        onSuccess: () => {
          toast({ title: t("section.generationSuccess") });
        },
        onError: (error: any) => {
          toast({ title: t("project.errorTitle"), description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const { data: versions } = useSectionVersions(section?.id);
  const activeVersion = useMemo(() => {
    if (!versions || !section?.activeVersionId) return undefined;
    return versions.find(v => v.isActive);
  }, [versions, section?.activeVersionId]);

  const hasContent = !!activeVersion?.content;

  return (
    <Card data-testid="card-situation-appel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Stethoscope className="w-5 h-5 text-primary" />
          {t("project.situationAppelTitle")}
        </CardTitle>
        <CardDescription>{t("project.situationAppelDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasContent && (
          <>
            <div className="flex gap-2" data-testid="mode-toggle-situation">
              <Button
                variant={mode === "import" ? "default" : "outline"}
                onClick={() => handleModeChange("import")}
                data-testid="button-mode-import"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("project.modeImport")}
              </Button>
              <Button
                variant={mode === "guided" ? "default" : "outline"}
                onClick={() => handleModeChange("guided")}
                data-testid="button-mode-guided"
              >
                <MessageSquareText className="w-4 h-4 mr-2" />
                {t("project.modeGuided")}
              </Button>
            </div>

            {mode === "import" ? (
              <ImportMode
                importText={importText}
                onTextChange={handleImportTextChange}
                onTextBlur={handleImportTextBlur}
                canGenerate={canGenerate}
                isPending={generateMutation.isPending}
                onGenerate={handleGenerate}
              />
            ) : (
              <GuidedMode
                answers={guidedAnswers}
                currentQuestion={currentQuestion}
                onAnswerChange={handleAnswerChange}
                onAnswerBlur={handleAnswerBlur}
                onQuestionChange={setCurrentQuestion}
                canGenerate={canGenerate}
                isPending={generateMutation.isPending}
                onGenerate={handleGenerate}
              />
            )}
          </>
        )}

        {hasContent && (
          <SectionEditor
            projectId={project.id}
            sectionKey="situation_appel"
            section={section}
            activeVersion={activeVersion}
            projectType={project.type}
            getExtraContext={buildExtraContext}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ImportMode({
  importText,
  onTextChange,
  onTextBlur,
  canGenerate,
  isPending,
  onGenerate,
}: {
  importText: string;
  onTextChange: (text: string) => void;
  onTextBlur: () => void;
  canGenerate: boolean;
  isPending: boolean;
  onGenerate: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("project.modeImportDesc")}</p>
      <Textarea
        value={importText}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onTextBlur}
        placeholder={t("project.importPlaceholder")}
        className="min-h-[200px] text-sm"
        data-testid="textarea-import-situation"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {importText.length} / 50 min.
        </p>
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isPending}
          data-testid="button-import-generate"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {t("project.importReformulate")}
        </Button>
      </div>
    </div>
  );
}

function GuidedMode({
  answers,
  currentQuestion,
  onAnswerChange,
  onAnswerBlur,
  onQuestionChange,
  canGenerate,
  isPending,
  onGenerate,
}: {
  answers: string[];
  currentQuestion: number;
  onAnswerChange: (idx: number, value: string) => void;
  onAnswerBlur: () => void;
  onQuestionChange: (idx: number) => void;
  canGenerate: boolean;
  isPending: boolean;
  onGenerate: () => void;
}) {
  const { t } = useI18n();
  const totalQuestions = GUIDED_QUESTION_KEYS.length;
  const answeredCount = answers.filter(a => a.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("project.modeGuidedDesc")}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {t("project.guidedProgress")} {currentQuestion + 1} / {totalQuestions}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {answeredCount} / {totalQuestions} {t("project.sectionsValidatedCount")}
        </Badge>
      </div>

      <div className="flex gap-1 mb-2">
        {GUIDED_QUESTION_KEYS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onQuestionChange(idx)}
            className={`h-2 flex-1 rounded-full transition-all ${
              idx === currentQuestion
                ? "bg-primary"
                : answers[idx]?.trim()
                ? "bg-green-500"
                : "bg-muted"
            }`}
            data-testid={`progress-dot-${idx}`}
          />
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm font-medium" data-testid="guided-question-text">
            {t(`project.${GUIDED_QUESTION_KEYS[currentQuestion]}`)}
          </p>
          <Textarea
            value={answers[currentQuestion]}
            onChange={(e) => onAnswerChange(currentQuestion, e.target.value)}
            onBlur={onAnswerBlur}
            placeholder={t("project.guidedQuestionLabel")}
            className="min-h-[120px] text-sm"
            data-testid={`textarea-guided-q${currentQuestion}`}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => onQuestionChange(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          data-testid="button-guided-prev"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t("project.guidedPrevious")}
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            variant="outline"
            onClick={() => onQuestionChange(currentQuestion + 1)}
            data-testid="button-guided-next"
          >
            {t("project.guidedNext")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isPending}
            data-testid="button-guided-generate"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {t("project.guidedGenerate")}
          </Button>
        )}
      </div>
    </div>
  );
}

function ConstructionSujetSection({
  project,
  section,
  sections,
  situationValidated,
}: {
  project: any;
  section?: ProjectSection;
  sections: ProjectSection[];
  situationValidated: boolean;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const generateMutation = useGenerateSection();
  const { data: validatedContents } = useValidatedContents(project.id);

  const { data: versions } = useSectionVersions(section?.id);
  const activeVersion = useMemo(() => {
    if (!versions || !section?.activeVersionId) return undefined;
    return versions.find(v => v.isActive);
  }, [versions, section?.activeVersionId]);

  const hasContent = !!activeVersion?.content;

  const buildExtraContext = () => {
    let ctx = "";
    if (validatedContents?.situation_appel) {
      ctx += `=== SITUATION D'APPEL VALIDÉE ===\n${validatedContents.situation_appel}\n\n`;
    }
    return ctx;
  };

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        projectId: project.id,
        sectionKey: "construction_sujet",
        mode: "initial",
        extraContext: buildExtraContext(),
      },
      {
        onSuccess: () => {
          toast({ title: t("section.generationSuccess") });
        },
        onError: (error: any) => {
          toast({ title: t("project.errorTitle"), description: error.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <Card data-testid="card-construction-sujet">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <ClipboardList className="w-5 h-5 text-primary" />
          {t("project.constructionSujetTitle")}
        </CardTitle>
        <CardDescription>{t("project.constructionSujetDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!situationValidated ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto" data-testid="text-needs-situation">
              {t("project.constructionSujetNeedsSituation")}
            </p>
          </div>
        ) : !hasContent ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {t("project.constructionSujetDesc")}
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-construction-sujet"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {t("project.constructionSujet")}
            </Button>
          </div>
        ) : (
          <SectionEditor
            projectId={project.id}
            sectionKey="construction_sujet"
            section={section}
            activeVersion={activeVersion}
            projectType={project.type}
            getExtraContext={buildExtraContext}
          />
        )}
      </CardContent>
    </Card>
  );
}
