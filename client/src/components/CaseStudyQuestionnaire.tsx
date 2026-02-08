import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";

type CsSectionQuestionKey = "fiche" | "contexte" | "probleme" | "cadre" | "donnees" | "options" | "recommandation" | "conclusion";

const SECTION_TO_QUESTION_KEY: Record<string, CsSectionQuestionKey> = {
  cs_fiche: "fiche",
  cs_contexte: "contexte",
  cs_probleme: "probleme",
  cs_cadre: "cadre",
  cs_donnees: "donnees",
  cs_options: "options",
  cs_recommandation: "recommandation",
  cs_conclusion: "conclusion",
};

const QUESTION_COUNTS: Record<CsSectionQuestionKey, number> = {
  fiche: 6,
  contexte: 3,
  probleme: 2,
  cadre: 2,
  donnees: 2,
  options: 3,
  recommandation: 3,
  conclusion: 2,
};

const CADRE_TOOLS = ["swot", "pestel", "stakeholders", "scenarios", "risk_matrix"] as const;

interface CaseStudyQuestionnaireProps {
  sectionKey: string;
  onGenerate: (answers: Record<string, string>) => void;
  isPending: boolean;
  savedAnswers?: Record<string, string>;
  onSaveAnswers?: (answers: Record<string, string>) => void;
}

export default function CaseStudyQuestionnaire({
  sectionKey,
  onGenerate,
  isPending,
  savedAnswers,
  onSaveAnswers,
}: CaseStudyQuestionnaireProps) {
  const { t } = useI18n();
  const questionKey = SECTION_TO_QUESTION_KEY[sectionKey];
  if (!questionKey) return null;

  const questionCount = QUESTION_COUNTS[questionKey];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});

  const getQuestion = useCallback((idx: number) => {
    return t(`caseStudy.${questionKey}.q${idx + 1}`);
  }, [questionKey, t]);

  const handleAnswerChange = useCallback((value: string) => {
    const key = `q${currentStep + 1}`;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    onSaveAnswers?.(newAnswers);
  }, [currentStep, answers, onSaveAnswers]);

  const currentAnswer = answers[`q${currentStep + 1}`] || "";
  const answeredCount = Object.values(answers).filter(v => v.trim().length > 0).length;
  const allAnswered = answeredCount >= questionCount;
  const progress = Math.round((answeredCount / questionCount) * 100);

  const handleNext = () => {
    if (currentStep < questionCount - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    onGenerate(answers);
  };

  const isCadreToolSelector = questionKey === "cadre" && currentStep === 0;

  return (
    <Card data-testid={`cs-questionnaire-${sectionKey}`}>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 md:p-5">
        <div>
          <CardTitle className="text-base md:text-lg" data-testid={`cs-questionnaire-title-${sectionKey}`}>
            {t(`caseStudy.${questionKey}.title`)}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm mt-1">
            {t(`caseStudy.${questionKey}.desc`)}
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs shrink-0" data-testid={`cs-questionnaire-progress-badge-${sectionKey}`}>
          {answeredCount}/{questionCount} {t("internshipReport.questionProgress")}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 md:p-5 space-y-4">
        <Progress value={progress} className="h-2" data-testid={`cs-questionnaire-progress-${sectionKey}`} />

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-medium text-foreground" data-testid={`cs-questionnaire-question-label-${sectionKey}`}>
              {t("internshipReport.questionProgress")} {currentStep + 1} {t("internshipReport.of")} {questionCount}
            </p>
            {currentAnswer.trim().length > 0 && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`cs-questionnaire-question-${sectionKey}`}>
            {getQuestion(currentStep)}
          </p>

          {isCadreToolSelector ? (
            <div className="space-y-3">
              <Select
                value={currentAnswer}
                onValueChange={(val) => handleAnswerChange(val)}
              >
                <SelectTrigger data-testid={`cs-cadre-tool-select-${sectionKey}`}>
                  <SelectValue placeholder={t("caseStudy.cadre.selectTool")} />
                </SelectTrigger>
                <SelectContent>
                  {CADRE_TOOLS.map((tool) => (
                    <SelectItem key={tool} value={tool} data-testid={`cs-cadre-tool-${tool}`}>
                      {t(`caseStudy.cadre.tools.${tool}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={t("internshipReport.answerPlaceholder")}
              rows={4}
              className="text-sm resize-none"
              data-testid={`cs-questionnaire-answer-${sectionKey}`}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            data-testid={`cs-questionnaire-prev-${sectionKey}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("internshipReport.previous")}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {currentStep < questionCount - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                data-testid={`cs-questionnaire-next-${sectionKey}`}
              >
                {t("internshipReport.next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : null}

            {allAnswered && (
              <Button
                onClick={handleGenerate}
                disabled={isPending}
                data-testid={`cs-questionnaire-generate-${sectionKey}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isPending ? "..." : t("internshipReport.generateSection")}
              </Button>
            )}
          </div>
        </div>

        {allAnswered && currentStep === questionCount - 1 && (
          <p className="text-xs text-green-600 dark:text-green-400 text-center" data-testid={`cs-questionnaire-complete-${sectionKey}`}>
            {t("internshipReport.allQuestionsAnswered")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function isCaseStudySection(sectionKey: string): boolean {
  return sectionKey in SECTION_TO_QUESTION_KEY;
}

export function buildCaseStudyContext(sectionKey: string, answers: Record<string, string>): string {
  const questionKey = SECTION_TO_QUESTION_KEY[sectionKey];
  if (!questionKey) return "";

  const lines: string[] = [];
  const count = QUESTION_COUNTS[questionKey];
  for (let i = 1; i <= count; i++) {
    const answer = answers[`q${i}`];
    if (answer && answer.trim()) {
      lines.push(`Q${i}: ${answer.trim()}`);
    }
  }
  return lines.join("\n");
}
