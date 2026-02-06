import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateMethodologyTables,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSaveSectionConfig,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, FlaskConical, Save, Check, X, ChevronDown,
  FileDown, MessageSquare, Table2,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";

interface MethodologyModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

const TABLE_TYPES = [
  { key: "methodological_choice", label: "Choix méthodologique", description: "Type de méthodologie, justification et liens" },
  { key: "pre_operational", label: "Phase préopératoire", description: "Objectifs terrain, démarche, contraintes" },
  { key: "target_population", label: "Population cible", description: "Critères d'inclusion / exclusion, caractéristiques" },
  { key: "collection_tools", label: "Outils de collecte", description: "Questionnaire, entretien, grille d'observation..." },
  { key: "limits", label: "Limites méthodologiques", description: "Biais, impacts, mesures correctives" },
];

interface TableData {
  rows: Record<string, string>[];
  comment: string;
}

interface SavedMethodologyState {
  tables: Record<string, TableData>;
  instructions: string;
}

type ActiveAction = null | string;

export default function MethodologyModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: MethodologyModuleProps) {
  const [tables, setTables] = useState<Record<string, TableData>>({});
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [instructions, setInstructions] = useState("");

  const { toast } = useToast();
  const tablesMutation = useGenerateMethodologyTables();
  const saveManualMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const saveConfigMutation = useSaveSectionConfig();

  const stateRef = useRef({ tables, instructions });
  useEffect(() => {
    stateRef.current = { tables, instructions };
  }, [tables, instructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedMethodologyState = { tables: s.tables, instructions: s.instructions };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { methodologyState: state },
      projectId,
    });
  }, [section, projectId]);

  useEffect(() => {
    if (!section?.config || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.methodologyState) {
      const s: SavedMethodologyState = cfg.methodologyState;
      if (s.tables) setTables(s.tables);
      if (s.instructions) setInstructions(s.instructions);
    }
    setStateLoaded(true);
  }, [section?.config, stateLoaded]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!stateLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 3000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [tables, instructions, stateLoaded]);

  const toggleExpanded = (key: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleGenerateTable = (tableType: string) => {
    setActiveAction(tableType);
    tablesMutation.mutate(
      {
        projectId,
        tableType,
        extraContext: `${extraContext || ""}\n${instructions ? `Consignes: ${instructions}` : ""}`,
      },
      {
        onSuccess: (data) => {
          setTables(prev => ({ ...prev, [tableType]: data }));
          setExpandedTables(prev => new Set(prev).add(tableType));
          setActiveAction(null);
          toast({ title: "Tableau généré", description: `Le tableau "${TABLE_TYPES.find(t => t.key === tableType)?.label}" a été créé.` });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleGenerateAll = async () => {
    setActiveAction("all");
    for (const t of TABLE_TYPES) {
      try {
        const data = await tablesMutation.mutateAsync({
          projectId,
          tableType: t.key,
          extraContext: `${extraContext || ""}\n${instructions ? `Consignes: ${instructions}` : ""}`,
        });
        setTables(prev => ({ ...prev, [t.key]: data }));
        setExpandedTables(prev => new Set(prev).add(t.key));
      } catch {
        toast({ title: "Erreur", description: `Erreur pour "${t.label}"`, variant: "destructive" });
      }
    }
    setActiveAction(null);
    toast({ title: "Tous les tableaux générés", description: "Les 5 tableaux analytiques sont prêts." });
  };

  const buildFullContent = () => {
    let content = "# Cadre méthodologique\n\n";
    TABLE_TYPES.forEach(t => {
      const data = tables[t.key];
      if (!data || !data.rows?.length) return;
      content += `## ${t.label}\n\n`;
      const cols = Object.keys(data.rows[0]);
      content += `| ${cols.join(" | ")} |\n`;
      content += `| ${cols.map(() => "---").join(" | ")} |\n`;
      data.rows.forEach(row => {
        content += `| ${cols.map(c => row[c] || "").join(" | ")} |\n`;
      });
      if (data.comment) {
        content += `\n> ${data.comment}\n`;
      }
      content += "\n";
    });
    return content;
  };

  const handleSaveToSection = () => {
    if (!section) return;
    const content = buildFullContent();
    saveManualMutation.mutate(
      { sectionId: section.id, content, projectId },
      {
        onSuccess: () => {
          toast({ title: "Sauvegardé", description: "La méthodologie a été enregistrée." });
        },
      }
    );
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => {
          toast({ title: "Validé", description: "La méthodologie est validée." });
        },
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => {
          toast({ title: "Dévalidé", description: "La méthodologie n'est plus validée." });
        },
      }
    );
  };

  const handleExportWord = () => {
    const exportSections: { label: string; content: string }[] = [];
    TABLE_TYPES.forEach(t => {
      const data = tables[t.key];
      if (!data || !data.rows?.length) return;
      let content = "";
      const cols = Object.keys(data.rows[0]);
      data.rows.forEach(row => {
        cols.forEach(c => {
          content += `${c}: ${row[c] || ""}\n`;
        });
        content += "\n";
      });
      if (data.comment) content += `Commentaire: ${data.comment}\n`;
      exportSections.push({ label: t.label, content });
    });
    exportToWord("Cadre méthodologique", exportSections, "methodologie");
  };

  const isValidated = section?.status === "validated";
  const hasAnyTable = Object.keys(tables).length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Cadre méthodologique</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isValidated ? (
                <Badge variant="default" className="bg-green-600 text-white">
                  <Check className="w-3 h-3 mr-1" /> Validé
                </Badge>
              ) : (
                hasAnyTable && <Badge variant="outline">Brouillon</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Générez les 5 tableaux analytiques pour structurer votre méthodologie. Les commentaires IA servent de guide de rédaction.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Consignes spécifiques</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions libres pour affiner la génération des tableaux..."
              className="resize-none text-sm"
              rows={2}
              data-testid="input-methodology-instructions"
            />
          </div>
          <Button
            onClick={handleGenerateAll}
            disabled={activeAction !== null}
            data-testid="button-generate-all-tables"
          >
            {activeAction === "all" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Table2 className="w-4 h-4 mr-2" />}
            Générer les 5 tableaux
          </Button>
        </CardContent>
      </Card>

      {TABLE_TYPES.map(t => {
        const data = tables[t.key];
        const isExpanded = expandedTables.has(t.key);
        const isGenerating = activeAction === t.key || activeAction === "all";

        return (
          <Card key={t.key}>
            <CardHeader className="pb-2">
              <button
                onClick={() => toggleExpanded(t.key)}
                className="flex items-center gap-2 w-full text-left"
                data-testid={`toggle-table-${t.key}`}
              >
                <Table2 className="w-4 h-4" />
                <div className="flex-1">
                  <CardTitle className="text-base">{t.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {data && <Badge variant="secondary" className="mr-2">{data.rows?.length || 0} ligne(s)</Badge>}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            </CardHeader>
            {isExpanded && (
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateTable(t.key)}
                  disabled={activeAction !== null}
                  data-testid={`button-generate-table-${t.key}`}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-2" />}
                  {data ? "Régénérer" : "Générer"}
                </Button>

                {data && data.rows?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          {Object.keys(data.rows[0]).map((col, i) => (
                            <th
                              key={i}
                              className="border border-border bg-muted/50 px-3 py-2 text-left font-medium text-xs"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {Object.values(row).map((val, colIdx) => (
                              <td key={colIdx} className="border border-border px-3 py-2 text-xs">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {data?.comment && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Guide de rédaction IA</p>
                        <p className="text-sm">{data.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {hasAnyTable && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExportWord} data-testid="button-export-methodology-word">
                <FileDown className="w-4 h-4 mr-1" /> Word
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveToSection} data-testid="button-save-methodology">
                <Save className="w-4 h-4 mr-1" /> Enregistrer
              </Button>
              {isValidated ? (
                <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate-methodology">
                  <X className="w-4 h-4 mr-1" /> Dévalider
                </Button>
              ) : (
                <Button size="sm" onClick={handleValidate} disabled={!section?.activeVersionId} data-testid="button-validate-methodology">
                  <Check className="w-4 h-4 mr-1" /> Valider
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
