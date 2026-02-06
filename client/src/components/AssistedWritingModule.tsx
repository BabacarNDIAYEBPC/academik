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
}

const MODE_LABELS: Record<string, { label: string; description: string }> = {
  reformulate: { label: "Reformulation académique", description: "Reformule votre texte dans un registre académique plus soutenu" },
  clarify: { label: "Clarification", description: "Simplifie et clarifie le texte pour une meilleure lisibilité" },
  structure: { label: "Structuration", description: "Restructure le texte pour une meilleure logique argumentaire" },
  improve_style: { label: "Style académique", description: "Améliore le style pour correspondre aux normes académiques" },
  check_coherence: { label: "Cohérence", description: "Vérifie la cohérence avec le plan et les hypothèses du projet" },
};

const SECTION_TARGETS: Record<string, string> = {
  introduction: "Introduction",
  revue_litterature: "Revue de littérature",
  cadre_theorique: "Cadre théorique",
  methodologie: "Méthodologie",
  resultats: "Résultats",
  discussion: "Discussion",
  conclusion: "Conclusion",
};

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
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const assistMutation = useAssistWriting();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (section?.config && !stateLoaded) {
      const saved = section.config as unknown as SavedState;
      if (saved.inputText !== undefined) setInputText(saved.inputText);
      if (saved.outputText !== undefined) setOutputText(saved.outputText);
      if (saved.mode) setMode(saved.mode);
      if (saved.sectionTarget) setSectionTarget(saved.sectionTarget);
      if (saved.suggestions) setSuggestions(saved.suggestions);
      setStateLoaded(true);
    } else if (!section?.config) {
      setStateLoaded(true);
    }
  }, [section?.config, stateLoaded]);

  const saveState = useCallback(() => {
    if (!section?.id || !stateLoaded) return;
    const state: SavedState = { inputText, outputText, mode, sectionTarget, suggestions };
    saveConfigMutation.mutate({ sectionId: section.id, config: state as any, projectId });
  }, [section?.id, inputText, outputText, mode, sectionTarget, suggestions, stateLoaded, projectId]);

  useEffect(() => {
    if (!stateLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveState, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [inputText, outputText, mode, sectionTarget, suggestions, stateLoaded]);

  const handleAssist = () => {
    if (!inputText.trim()) {
      toast({ title: "Texte requis", description: "Collez ou saisissez le texte à améliorer.", variant: "destructive" });
      return;
    }
    assistMutation.mutate(
      { projectId, text: inputText, mode, sectionTarget: sectionTarget || undefined, extraContext },
      {
        onSuccess: (data) => {
          setOutputText(data.content);
          setSuggestions(data.suggestions || []);
          toast({ title: "Texte amélioré", description: `Mode: ${MODE_LABELS[mode]?.label || mode}` });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de l'assistance à la rédaction", variant: "destructive" });
        },
      }
    );
  };

  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({ title: "Copié", description: "Le texte amélioré a été copié dans le presse-papier." });
    }
  };

  const handleReplaceInput = () => {
    if (outputText) {
      setInputText(outputText);
      setOutputText("");
      setSuggestions([]);
      toast({ title: "Remplacé", description: "Le texte original a été remplacé par la version améliorée." });
    }
  };

  const handleExportWord = () => {
    if (!outputText) return;
    exportToWord(
      "Rédaction assistée",
      [
        { label: "Texte original", content: inputText },
        { label: `Texte amélioré (${MODE_LABELS[mode]?.label || mode})`, content: outputText },
        ...(suggestions.length > 0 ? [{ label: "Suggestions", content: suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n") }] : []),
      ],
      `redaction_assistee_${mode}`
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <PenTool className="w-5 h-5 text-primary" />
              <CardTitle>Rédaction assistée</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isValidated ? (
                <Button
                  variant="outline"
                  onClick={() => section?.id && unvalidateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={unvalidateMutation.isPending}
                  data-testid="button-unvalidate-writing"
                >
                  <X className="w-4 h-4 mr-1" /> Dévalider
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => section?.id && validateMutation.mutate({ sectionId: section.id, projectId })}
                  disabled={validateMutation.isPending || !outputText}
                  data-testid="button-validate-writing"
                >
                  <Check className="w-4 h-4 mr-1" /> Valider
                </Button>
              )}
              <Button variant="outline" onClick={handleExportWord} disabled={!outputText} data-testid="button-export-writing">
                <FileDown className="w-4 h-4 mr-1" /> Word
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
            Cet outil vous aide à améliorer votre propre texte. Il ne rédige jamais de contenu à votre place.
            Collez votre texte, choisissez un mode d'amélioration et laissez l'IA vous suggérer des améliorations.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mode d'amélioration</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger data-testid="select-writing-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODE_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{MODE_LABELS[mode]?.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Section cible (optionnel)</Label>
              <Select value={sectionTarget} onValueChange={setSectionTarget}>
                <SelectTrigger data-testid="select-section-target">
                  <SelectValue placeholder="Toutes sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes sections</SelectItem>
                  {Object.entries(SECTION_TARGETS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Votre texte à améliorer</Label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Collez ici le texte que vous souhaitez améliorer..."
              className="min-h-[200px] resize-y"
              data-testid="textarea-input-text"
            />
            <p className="text-xs text-muted-foreground">
              {inputText.split(/\s+/).filter(Boolean).length} mots
            </p>
          </div>

          <Button
            onClick={handleAssist}
            disabled={assistMutation.isPending || !inputText.trim()}
            data-testid="button-assist-writing"
          >
            {assistMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenTool className="w-4 h-4 mr-2" />}
            Améliorer le texte
          </Button>

          {outputText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Label>Texte amélioré</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleCopyOutput} data-testid="button-copy-output">
                    <Copy className="w-4 h-4 mr-1" /> Copier
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReplaceInput} data-testid="button-replace-input">
                    <RefreshCw className="w-4 h-4 mr-1" /> Remplacer l'original
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
                  <span className="font-medium text-sm">Suggestions supplémentaires</span>
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
