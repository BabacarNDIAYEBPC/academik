import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateJuryQuestions,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Mic, Sparkles, Save, Check, X, FileDown, Loader2,
  ChevronDown, ChevronRight, AlertTriangle, Eye, EyeOff,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";

interface SoutenanceSimulationModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface JuryQuestion {
  category: string;
  question: string;
  suggestedAnswer: string;
  difficulty: string;
}

interface SavedState {
  questions: JuryQuestion[];
  weakPoints: string[];
  juryType: string;
  questionCount: number;
  showAnswers: boolean;
  contextInstructions: string;
}

const JURY_TYPES = [
  { value: "academique", label: "Académique" },
  { value: "professionnel", label: "Professionnel" },
  { value: "mixte", label: "Mixte" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Méthodologique": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Théorique": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Critique": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Pratique": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "facile": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "moyen": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "difficile": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function SoutenanceSimulationModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: SoutenanceSimulationModuleProps) {
  const [questions, setQuestions] = useState<JuryQuestion[]>([]);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const [juryType, setJuryType] = useState("mixte");
  const [questionCount, setQuestionCount] = useState(10);
  const [showAnswers, setShowAnswers] = useState(true);
  const [contextInstructions, setContextInstructions] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const generateMutation = useGenerateJuryQuestions();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ questions, weakPoints, juryType, questionCount, showAnswers, contextInstructions });
  useEffect(() => {
    stateRef.current = { questions, weakPoints, juryType, questionCount, showAnswers, contextInstructions };
  }, [questions, weakPoints, juryType, questionCount, showAnswers, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      questions: s.questions,
      weakPoints: s.weakPoints,
      juryType: s.juryType,
      questionCount: s.questionCount,
      showAnswers: s.showAnswers,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { soutenanceSimulationState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.soutenanceSimulationState) {
      const s = cfg.soutenanceSimulationState as SavedState;
      if (s.questions) setQuestions(s.questions);
      if (s.weakPoints) setWeakPoints(s.weakPoints);
      if (s.juryType) setJuryType(s.juryType);
      if (s.questionCount) setQuestionCount(s.questionCount);
      if (typeof s.showAnswers === "boolean") setShowAnswers(s.showAnswers);
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
  }, [questions, weakPoints, juryType, questionCount, showAnswers, contextInstructions, stateLoaded, doSave]);

  const handleGenerate = () => {
    generateMutation.mutate(
      { projectId, juryType, questionCount, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setQuestions(data.questions || []);
          setWeakPoints(data.weakPoints || []);
          setExpandedQuestions(new Set());
          toast({ title: "Questions générées", description: `${data.questions?.length || 0} question(s) de jury simulée(s).` });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la génération des questions", variant: "destructive" });
        },
      }
    );
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: "Section validée" }),
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: "Validation retirée" }),
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  const handleExport = () => {
    if (questions.length === 0) {
      toast({ title: "Rien à exporter", description: "Générez d'abord des questions de jury.", variant: "destructive" });
      return;
    }
    const sections = [];
    let questionsContent = "";
    const grouped = groupByCategory(questions);
    for (const [category, items] of Object.entries(grouped)) {
      questionsContent += `## ${category}\n\n`;
      items.forEach((q, i) => {
        questionsContent += `### Question ${i + 1} (${q.difficulty})\n${q.question}\n\n`;
        questionsContent += `**Réponse suggérée :**\n${q.suggestedAnswer}\n\n`;
      });
    }
    sections.push({ label: "Questions du jury", content: questionsContent });

    if (weakPoints.length > 0) {
      const wpContent = weakPoints.map(wp => `- ${wp}`).join("\n");
      sections.push({ label: "Points faibles identifiés", content: wpContent });
    }

    exportToWord("Simulation de soutenance", sections, "simulation_soutenance");
  };

  const groupByCategory = (qs: JuryQuestion[]): Record<string, JuryQuestion[]> => {
    const grouped: Record<string, JuryQuestion[]> = {};
    for (const q of qs) {
      const cat = q.category || "Autre";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(q);
    }
    return grouped;
  };

  const isValidated = section?.status === "validated";
  const grouped = groupByCategory(questions);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Simulation de soutenance</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />Validé</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-soutenance">
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type de jury</Label>
            <Select value={juryType} onValueChange={setJuryType} data-testid="select-jury-type">
              <SelectTrigger data-testid="select-trigger-jury-type">
                <SelectValue placeholder="Type de jury" />
              </SelectTrigger>
              <SelectContent>
                {JURY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} data-testid={`select-item-jury-${t.value}`}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nombre de questions</Label>
            <Select value={questionCount.toString()} onValueChange={v => setQuestionCount(parseInt(v))} data-testid="select-question-count">
              <SelectTrigger data-testid="select-trigger-question-count">
                <SelectValue placeholder="Nombre de questions" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 16 }, (_, i) => i + 5).map(n => (
                  <SelectItem key={n} value={n.toString()} data-testid={`select-item-count-${n}`}>{n} questions</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contexte / consignes</Label>
          <Textarea
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder="Ajoutez des consignes ou un contexte spécifique pour la simulation de soutenance..."
            rows={3}
            data-testid="textarea-context-instructions"
          />
        </div>

        <Button onClick={handleGenerate} disabled={generateMutation.isPending} data-testid="button-generate-questions">
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Générer les questions du jury
        </Button>

        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-semibold text-base">Questions du jury ({questions.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswers(prev => !prev)}
                data-testid="button-toggle-answers"
              >
                {showAnswers ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showAnswers ? "Masquer les réponses" : "Afficher les réponses"}
              </Button>
            </div>

            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={CATEGORY_COLORS[category] || "bg-muted text-muted-foreground"} data-testid={`badge-category-${category}`}>
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({items.length} question{items.length > 1 ? "s" : ""})</span>
                </div>
                <div className="space-y-2">
                  {items.map((q) => {
                    const globalIndex = questions.indexOf(q);
                    const isExpanded = expandedQuestions.has(globalIndex);
                    return (
                      <Card key={globalIndex} className="border" data-testid={`card-question-${globalIndex}`}>
                        <div
                          className="flex items-start gap-2 p-3 cursor-pointer"
                          onClick={() => toggleQuestion(globalIndex)}
                          data-testid={`button-expand-question-${globalIndex}`}
                        >
                          {showAnswers ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" /> : <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-30" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm" data-testid={`text-question-${globalIndex}`}>{q.question}</p>
                            <Badge className={`text-xs ${DIFFICULTY_COLORS[q.difficulty?.toLowerCase()] || "bg-muted text-muted-foreground"}`} data-testid={`badge-difficulty-${globalIndex}`}>
                              {q.difficulty}
                            </Badge>
                          </div>
                        </div>
                        {showAnswers && isExpanded && (
                          <div className="px-3 pb-3 pt-0 border-t">
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" data-testid={`text-answer-${globalIndex}`}>
                              {q.suggestedAnswer}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {weakPoints.length > 0 && (
          <div className="space-y-2" data-testid="section-weak-points">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h3 className="font-semibold text-base">Points faibles identifiés</h3>
            </div>
            <ul className="space-y-1 list-disc list-inside">
              {weakPoints.map((wp, i) => (
                <li key={i} className="text-sm text-muted-foreground" data-testid={`text-weak-point-${i}`}>{wp}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 flex-wrap pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={questions.length === 0} data-testid="button-export-soutenance">
            <FileDown className="w-4 h-4 mr-1" />Exporter en Word
          </Button>
          {!isValidated ? (
            <Button variant="default" size="sm" onClick={handleValidate} disabled={validateMutation.isPending} data-testid="button-validate-soutenance">
              {validateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Valider
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} disabled={unvalidateMutation.isPending} data-testid="button-unvalidate-soutenance">
              {unvalidateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
              Retirer la validation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
