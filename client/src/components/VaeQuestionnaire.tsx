import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";

type VaeSectionQuestionKey = "presentation" | "parcours" | "motivation" | "cartographie" | "blocDemo" | "synthese";

const SECTION_TO_QUESTION_KEY: Record<string, VaeSectionQuestionKey> = {
  vae_presentation: "presentation",
  vae_parcours: "parcours",
  vae_motivation: "motivation",
  vae_cartographie: "cartographie",
  vae_bloc_demo: "blocDemo",
  vae_synthese: "synthese",
};

const QUESTION_COUNTS: Record<VaeSectionQuestionKey, number> = {
  presentation: 5,
  parcours: 7,
  motivation: 6,
  cartographie: 3,
  blocDemo: 4,
  synthese: 5,
};

interface VaeQuestionnaireProps {
  sectionKey: string;
  onGenerate: (answers: Record<string, string>) => void;
  isPending: boolean;
  savedAnswers?: Record<string, string>;
  onSaveAnswers?: (answers: Record<string, string>) => void;
}

export default function VaeQuestionnaire({
  sectionKey,
  onGenerate,
  isPending,
  savedAnswers,
  onSaveAnswers,
}: VaeQuestionnaireProps) {
  const { t } = useI18n();
  const questionKey = SECTION_TO_QUESTION_KEY[sectionKey];
  if (!questionKey) return null;

  const questionCount = QUESTION_COUNTS[questionKey];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});

  const getQuestion = useCallback((idx: number) => {
    return t(`vaeModule.${questionKey}.q${idx + 1}`);
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

  return (
    <Card data-testid={`vae-questionnaire-${sectionKey}`}>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 md:p-5">
        <div>
          <CardTitle className="text-base md:text-lg" data-testid={`vae-questionnaire-title-${sectionKey}`}>
            {t(`vaeModule.${questionKey}.title`)}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm mt-1">
            {t(`vaeModule.${questionKey}.desc`)}
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs shrink-0" data-testid={`vae-questionnaire-progress-badge-${sectionKey}`}>
          {answeredCount}/{questionCount} {t("internshipReport.questionProgress")}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 md:p-5 space-y-4">
        <Progress value={progress} className="h-2" data-testid={`vae-questionnaire-progress-${sectionKey}`} />

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-medium text-foreground" data-testid={`vae-questionnaire-question-label-${sectionKey}`}>
              {t("internshipReport.questionProgress")} {currentStep + 1} {t("internshipReport.of")} {questionCount}
            </p>
            {currentAnswer.trim().length > 0 && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`vae-questionnaire-question-${sectionKey}`}>
            {getQuestion(currentStep)}
          </p>

          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={t("internshipReport.answerPlaceholder")}
            rows={4}
            className="text-sm resize-none"
            data-testid={`vae-questionnaire-answer-${sectionKey}`}
          />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            data-testid={`vae-questionnaire-prev-${sectionKey}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("internshipReport.previous")}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {currentStep < questionCount - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                data-testid={`vae-questionnaire-next-${sectionKey}`}
              >
                {t("internshipReport.next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : null}

            {allAnswered && (
              <Button
                onClick={handleGenerate}
                disabled={isPending}
                data-testid={`vae-questionnaire-generate-${sectionKey}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isPending ? "..." : t("internshipReport.generateSection")}
              </Button>
            )}
          </div>
        </div>

        {allAnswered && currentStep === questionCount - 1 && (
          <p className="text-xs text-green-600 dark:text-green-400 text-center" data-testid={`vae-questionnaire-complete-${sectionKey}`}>
            {t("internshipReport.allQuestionsAnswered")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function isVaeSection(sectionKey: string): boolean {
  return sectionKey in SECTION_TO_QUESTION_KEY;
}

export function buildVaeContext(sectionKey: string, answers: Record<string, string>): string {
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
