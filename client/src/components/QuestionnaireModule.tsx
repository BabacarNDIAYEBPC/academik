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
  useGenerateQuestionnaire,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, ClipboardList, Save, Check, X, FileDown,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";

interface QuestionnaireModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface QuestionnaireConfig {
  questionnaireType: string;
  questionCount: number;
  questionFormats: string[];
  targetDuration: string;
  respondentProfile: string;
  instructions: string;
}

interface SavedState {
  questionnaireContent: string;
  questionnaireConfig: QuestionnaireConfig;
  contextInstructions: string;
}

const QUESTION_FORMATS = [
  { value: "likert_5", label: "Échelle de Likert (5 points)" },
  { value: "likert_4", label: "Échelle de Likert (4 points)" },
  { value: "choix_multiple", label: "Choix multiples" },
  { value: "choix_unique", label: "Choix unique" },
  { value: "oui_non", label: "Oui / Non" },
  { value: "question_ouverte", label: "Question ouverte" },
  { value: "classement", label: "Classement / Ordonnancement" },
  { value: "numerique", label: "Échelle numérique (1-10)" },
];

const DEFAULT_Q_CONFIG: QuestionnaireConfig = {
  questionnaireType: "enquete",
  questionCount: 25,
  questionFormats: ["likert_5", "choix_multiple", "question_ouverte"],
  targetDuration: "15-20 minutes",
  respondentProfile: "",
  instructions: "",
};

export default function QuestionnaireModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: QuestionnaireModuleProps) {
  const [questionnaireContent, setQuestionnaireContent] = useState("");
  const [qConfig, setQConfig] = useState<QuestionnaireConfig>(DEFAULT_Q_CONFIG);
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const questionnaireMutation = useGenerateQuestionnaire();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ questionnaireContent, qConfig, contextInstructions });
  useEffect(() => {
    stateRef.current = { questionnaireContent, qConfig, contextInstructions };
  }, [questionnaireContent, qConfig, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      questionnaireContent: s.questionnaireContent,
      questionnaireConfig: s.qConfig,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { questionnaireState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.questionnaireState) {
      const s = cfg.questionnaireState as SavedState;
      if (s.questionnaireContent) setQuestionnaireContent(s.questionnaireContent);
      if (s.questionnaireConfig) setQConfig({ ...DEFAULT_Q_CONFIG, ...s.questionnaireConfig });
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
  }, [questionnaireContent, qConfig, contextInstructions, stateLoaded, doSave]);

  const handleGenerateQuestionnaire = () => {
    questionnaireMutation.mutate(
      { projectId, config: qConfig, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setQuestionnaireContent(data.content);
          toast({ title: "Questionnaire généré", description: "Le questionnaire a été généré avec succès." });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la génération", variant: "destructive" });
        },
      }
    );
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
    if (!questionnaireContent) {
      toast({ title: "Rien à exporter", description: "Générez d'abord un questionnaire.", variant: "destructive" });
      return;
    }
    exportToWord("Questionnaire", [{ label: "Questionnaire", content: questionnaireContent }], "questionnaire.docx");
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
          <CardTitle className="text-lg">Questionnaire</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />Validé</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="questionnaire-button-save">
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="questionnaire-button-export">
            <FileDown className="w-4 h-4 mr-1" />Exporter
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="questionnaire-button-validate">
              <Check className="w-4 h-4 mr-1" />Valider
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="questionnaire-button-unvalidate">
              <X className="w-4 h-4 mr-1" />Retirer validation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="questionnaire-context-instructions" className="text-base font-semibold">Contexte / consignes spécifiques</Label>
          <Textarea
            id="questionnaire-context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder="Ex: Contraintes méthodologiques, instructions du tuteur, contexte particulier..."
            className="min-h-[80px] text-sm"
            data-testid="questionnaire-textarea-context-instructions"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Type de questionnaire</Label>
                <Select value={qConfig.questionnaireType} onValueChange={v => setQConfig(p => ({ ...p, questionnaireType: v }))}>
                  <SelectTrigger data-testid="questionnaire-select-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enquete">Enquête par questionnaire</SelectItem>
                    <SelectItem value="satisfaction">Questionnaire de satisfaction</SelectItem>
                    <SelectItem value="evaluation">Questionnaire d'évaluation</SelectItem>
                    <SelectItem value="diagnostic">Questionnaire diagnostique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nombre de questions</Label>
                <Input
                  type="number"
                  value={qConfig.questionCount}
                  onChange={e => setQConfig(p => ({ ...p, questionCount: parseInt(e.target.value) || 20 }))}
                  min={5}
                  max={60}
                  data-testid="questionnaire-input-count"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Durée cible</Label>
                <Select value={qConfig.targetDuration} onValueChange={v => setQConfig(p => ({ ...p, targetDuration: v }))}>
                  <SelectTrigger data-testid="questionnaire-select-duration"><SelectValue /></SelectTrigger>
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
                <Label>Profil du répondant</Label>
                <Input
                  value={qConfig.respondentProfile}
                  onChange={e => setQConfig(p => ({ ...p, respondentProfile: e.target.value }))}
                  placeholder="Ex: Infirmiers diplômés d'État, cadres de santé..."
                  data-testid="questionnaire-input-profile"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Formats de questions</Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUESTION_FORMATS.map(f => (
                    <Badge
                      key={f.value}
                      variant={qConfig.questionFormats.includes(f.value) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleFormat(f.value)}
                      data-testid={`questionnaire-badge-format-${f.value}`}
                    >
                      {f.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Instructions supplémentaires (optionnel)</Label>
            <Textarea
              value={qConfig.instructions}
              onChange={e => setQConfig(p => ({ ...p, instructions: e.target.value }))}
              placeholder="Précisions sur le contenu attendu, thèmes à couvrir..."
              className="h-20 text-sm"
              data-testid="questionnaire-textarea-instructions"
            />
          </div>
          <Button
            onClick={handleGenerateQuestionnaire}
            disabled={questionnaireMutation.isPending || !qConfig.respondentProfile}
            data-testid="questionnaire-button-generate"
          >
            {questionnaireMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ClipboardList className="w-4 h-4 mr-2" />}
            Générer le questionnaire
          </Button>

          {questionnaireContent && (
            <div className="space-y-1.5">
              <Label className="text-base font-semibold">Questionnaire généré</Label>
              <Textarea
                value={questionnaireContent}
                onChange={e => setQuestionnaireContent(e.target.value)}
                className="min-h-[300px] text-sm font-mono"
                data-testid="questionnaire-textarea-content"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
