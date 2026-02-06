import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ChevronDown, ChevronUp, Settings2, SlidersHorizontal,
  Download, FileText, FileDown, AlertTriangle,
  Plus, Trash2, ExternalLink, BookOpen, ChevronLeft, ChevronRight,
} from "lucide-react";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import { exportToWord, exportToPdf } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export interface SectionVariables {
  subject?: string;
  problematic?: string;
  hypotheses?: string;
  domain?: string;
  domainOther?: string;
  projectType?: string;
  projectTypeOther?: string;
  degreeLevel?: string;
  degreeLevelOther?: string;
  filiere?: string;
  orientation?: string;
  orientationOther?: string;
  finality?: string;
  context?: string;
  [key: string]: string | undefined;
}

export interface SectionFilterOption {
  key: string;
  label: string;
  checked: boolean;
}

export interface ArticleReference {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  url?: string;
  notes?: string;
}

export interface LiteratureConfig {
  platforms: string[];
  articleCount: number;
  periodStart: string;
  periodEnd: string;
  language: string;
  level: string;
  sourceTypes: string[];
  articles?: ArticleReference[];
}

const DOMAINS = [
  { value: "soins_infirmiers", label: "Soins infirmiers / Santé" },
  { value: "travail_social", label: "Travail social" },
  { value: "management", label: "Management / Gestion" },
  { value: "rh", label: "Ressources humaines" },
  { value: "economie", label: "Économie / Finance" },
  { value: "marketing", label: "Marketing / Communication" },
  { value: "droit", label: "Droit / Administration publique" },
  { value: "education", label: "Éducation / Pédagogie" },
  { value: "psychologie", label: "Psychologie" },
  { value: "informatique", label: "Informatique / Numérique" },
  { value: "data_ia", label: "Data / Intelligence artificielle" },
  { value: "logistique", label: "Logistique / Supply chain" },
  { value: "qualite", label: "Qualité / QHSE" },
  { value: "comptabilite", label: "Comptabilité / Audit / Contrôle de gestion" },
  { value: "banque", label: "Banque / Assurance" },
  { value: "immobilier", label: "Immobilier / Urbanisme" },
  { value: "sciences_politiques", label: "Sciences politiques / Relations internationales" },
  { value: "environnement", label: "Environnement / Développement durable" },
  { value: "industrie", label: "Industrie / Génie industriel" },
  { value: "autre", label: "Autre" },
];

const DEGREE_LEVELS = [
  { value: "bts_dut", label: "BTS / DUT" },
  { value: "licence", label: "Licence / Licence professionnelle" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master1", label: "Master 1" },
  { value: "master2", label: "Master 2" },
  { value: "mba", label: "MBA" },
  { value: "diplome_etat", label: "Diplôme d'État (santé / social)" },
  { value: "doctorat", label: "Doctorat" },
  { value: "vae", label: "VAE" },
  { value: "autre", label: "Autre" },
];

const PROJECT_TYPES = [
  { value: "memoire", label: "Mémoire" },
  { value: "tfe", label: "TFE (Travail de Fin d'Études)" },
  { value: "vae", label: "VAE (Validation des Acquis)" },
  { value: "rapport_stage", label: "Rapport de Stage" },
  { value: "autre", label: "Autre" },
];

const ORIENTATIONS = [
  { value: "theorique", label: "Théorique" },
  { value: "appliquee", label: "Appliquée" },
  { value: "analyse_pratiques", label: "Analyse de pratiques" },
  { value: "etude_cas", label: "Étude de cas" },
  { value: "mixte", label: "Mixte" },
  { value: "autre", label: "Autre" },
];

const FINALITIES = [
  { value: "academique", label: "Académique" },
  { value: "professionnelle", label: "Professionnelle" },
  { value: "mixte", label: "Mixte" },
];

const DROPDOWN_CONFIG: Record<string, { options: { value: string; label: string }[]; otherKey: string }> = {
  domain: { options: DOMAINS, otherKey: "domainOther" },
  degreeLevel: { options: DEGREE_LEVELS, otherKey: "degreeLevelOther" },
  projectType: { options: PROJECT_TYPES, otherKey: "projectTypeOther" },
  orientation: { options: ORIENTATIONS, otherKey: "orientationOther" },
};

const VARIABLE_LABELS: Record<string, string> = {
  subject: "Sujet",
  problematic: "Problématique",
  hypotheses: "Hypothèses",
  domain: "Domaine",
  projectType: "Type de travail",
  degreeLevel: "Niveau d'étude",
  filiere: "Filière / Formation",
  orientation: "Orientation / Approche",
  finality: "Finalité",
  context: "Contexte (terrain / professionnel)",
};

const FUNDAMENTAL_KEYS = ["domain", "projectType", "degreeLevel", "orientation", "finality"];

function getVariableKeysForSection(sectionKey: string): string[] {
  switch (sectionKey) {
    case "subject":
      return ["domain", "projectType", "degreeLevel", "filiere", "orientation", "finality"];
    case "problematic":
      return ["subject", "domain", "projectType", "degreeLevel", "orientation"];
    case "hypotheses":
      return ["subject", "problematic", "projectType", "degreeLevel", "orientation"];
    case "situation_appel":
      return ["domain", "projectType", "degreeLevel", "filiere"];
    case "vae_competencies":
      return ["domain", "projectType", "degreeLevel", "filiere"];
    case "plan":
      return ["subject", "problematic", "hypotheses", "projectType", "degreeLevel", "orientation", "finality"];
    case "conceptual_framework":
    case "theoretical_framework":
      return ["subject", "problematic", "hypotheses", "domain", "orientation"];
    case "literature_review":
      return ["subject", "problematic", "hypotheses", "domain", "orientation"];
    case "methodology":
      return ["problematic", "hypotheses", "projectType", "orientation", "context"];
    default:
      return ["subject", "domain", "projectType"];
  }
}

export function getFiltersForSection(sectionKey: string): { key: string; label: string }[] {
  switch (sectionKey) {
    case "plan":
      return [
        { key: "academic", label: "Plan très académique" },
        { key: "simplified", label: "Plan simplifié" },
        { key: "fieldFocus", label: "Accent terrain" },
        { key: "theoryFocus", label: "Accent théorique" },
      ];
    case "conceptual_framework":
      return [
        { key: "classic", label: "Concepts classiques" },
        { key: "recent", label: "Concepts récents" },
        { key: "critical", label: "Approche critique" },
        { key: "descriptive", label: "Approche descriptive" },
      ];
    case "theoretical_framework":
      return [
        { key: "classic", label: "Concepts classiques" },
        { key: "recent", label: "Concepts récents" },
        { key: "critical", label: "Approche critique" },
        { key: "descriptive", label: "Approche descriptive" },
      ];
    case "methodology":
      return [
        { key: "simple", label: "Méthode simple" },
        { key: "deep", label: "Méthode approfondie" },
        { key: "noHeavyField", label: "Faisable sans terrain lourd" },
        { key: "timeConstrained", label: "Adaptée aux contraintes de temps" },
      ];
    case "subject":
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
        { key: "moreDetailed", label: "Plus détaillé" },
      ];
    case "problematic":
    case "hypotheses":
    case "situation_appel":
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
        { key: "professional", label: "Orientation professionnelle" },
      ];
    default:
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
      ];
  }
}

const LITERATURE_PLATFORMS = [
  { key: "google_scholar", label: "Google Scholar" },
  { key: "pubmed", label: "PubMed" },
  { key: "hal", label: "HAL" },
  { key: "cairn", label: "Cairn" },
  { key: "sciencedirect", label: "ScienceDirect" },
];

const LITERATURE_SOURCE_TYPES = [
  { key: "scientific_articles", label: "Articles scientifiques" },
  { key: "books", label: "Ouvrages" },
  { key: "institutional_reports", label: "Rapports institutionnels" },
  { key: "recommendations", label: "Recommandations (HAS, OMS...)" },
  { key: "referentials", label: "Référentiels (VAE)" },
];

interface SectionControlsProps {
  sectionKey: string;
  projectId: number;
  projectType: string;
  variables: SectionVariables;
  onVariablesChange: (vars: SectionVariables) => void;
  onFundamentalChange?: (key: string, newValue: string) => void;
  filters: Record<string, boolean>;
  onFiltersChange: (filters: Record<string, boolean>) => void;
  correctionPrompt: string;
  onCorrectionPromptChange: (v: string) => void;
  literatureConfig?: LiteratureConfig;
  onLiteratureConfigChange?: (config: LiteratureConfig) => void;
  activeVersion?: SectionVersion;
}

export default function SectionControls({
  sectionKey,
  projectId,
  projectType,
  variables,
  onVariablesChange,
  onFundamentalChange,
  filters,
  onFiltersChange,
  correctionPrompt,
  onCorrectionPromptChange,
  literatureConfig,
  onLiteratureConfigChange,
  activeVersion,
}: SectionControlsProps) {
  const [showVariables, setShowVariables] = useState(false);
  const [showFilters, setShowFilters] = useState(sectionKey === "literature_review");
  const [pendingChange, setPendingChange] = useState<{ key: string; value: string } | null>(null);
  const { toast } = useToast();

  const variableKeys = getVariableKeysForSection(sectionKey);
  const filterOptions = getFiltersForSection(sectionKey);
  const isLiteratureReview = sectionKey === "literature_review";

  const handleVariableChange = (key: string, value: string) => {
    if (FUNDAMENTAL_KEYS.includes(key)) {
      setPendingChange({ key, value });
    } else {
      onVariablesChange({ ...variables, [key]: value });
    }
  };

  const confirmFundamentalChange = () => {
    if (!pendingChange) return;
    onVariablesChange({ ...variables, [pendingChange.key]: pendingChange.value });
    if (onFundamentalChange) {
      onFundamentalChange(pendingChange.key, pendingChange.value);
    }
    setPendingChange(null);
    toast({
      title: "Variable modifiée",
      description: "La modification sera prise en compte lors de la prochaine génération.",
    });
  };

  const handleExportSection = async (format: "word" | "pdf") => {
    if (!activeVersion?.content) {
      toast({ title: "Aucun contenu", description: "Générez du contenu avant d'exporter.", variant: "destructive" });
      return;
    }
    const label = SECTION_LABELS[sectionKey] || sectionKey;
    const filename = `${label.replace(/\s/g, "_").toLowerCase()}`;
    try {
      if (format === "word") {
        await exportToWord(label, [{ label, content: activeVersion.content }], filename);
      } else {
        await exportToPdf(label, [{ label, content: activeVersion.content }], filename);
      }
      toast({ title: "Export réussi", description: `${label} exporté en ${format === "word" ? "Word" : "PDF"}.` });
    } catch {
      toast({ title: "Erreur d'export", description: "L'export a échoué.", variant: "destructive" });
    }
  };

  const handleBatchExport = async (format: "word" | "pdf") => {
    try {
      const res = await apiRequest("GET", `/api/projects/${projectId}/sections/export`);
      const allContents: { key: string; label: string; content: string }[] = await res.json();
      const sectionsWithContent = allContents.filter(s => s.content);
      if (sectionsWithContent.length === 0) {
        toast({ title: "Aucun contenu", description: "Aucune section n'a de contenu à exporter.", variant: "destructive" });
        return;
      }
      const filename = "export_complet";
      if (format === "word") {
        await exportToWord("Export complet", sectionsWithContent, filename);
      } else {
        await exportToPdf("Export complet", sectionsWithContent, filename);
      }
      toast({ title: "Export réussi", description: `${sectionsWithContent.length} section(s) exportée(s).` });
    } catch {
      toast({ title: "Erreur d'export", description: "L'export a échoué.", variant: "destructive" });
    }
  };

  const renderVariableInput = (key: string) => {
    const isTextArea = ["subject", "problematic", "hypotheses", "context"].includes(key);
    const dropdownCfg = DROPDOWN_CONFIG[key];
    const isFinalityDropdown = key === "finality";

    if (dropdownCfg) {
      const currentVal = variables[key] || "";
      const isOther = currentVal === "autre" || (currentVal && !dropdownCfg.options.some(o => o.value === currentVal));
      const selectVal = isOther ? "autre" : currentVal;

      return (
        <div className="space-y-1.5">
          <Select
            value={selectVal}
            onValueChange={(v) => {
              if (v === "autre") {
                handleVariableChange(key, "autre");
              } else {
                handleVariableChange(key, v);
                onVariablesChange({ ...variables, [key]: v, [dropdownCfg.otherKey]: undefined });
              }
            }}
          >
            <SelectTrigger data-testid={`select-var-${key}-${sectionKey}`}>
              <SelectValue placeholder={`Choisir ${VARIABLE_LABELS[key] || key}...`} />
            </SelectTrigger>
            <SelectContent>
              {dropdownCfg.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectVal === "autre") && (
            <Input
              value={variables[dropdownCfg.otherKey] || ""}
              onChange={e => onVariablesChange({ ...variables, [dropdownCfg.otherKey]: e.target.value })}
              className="text-sm"
              placeholder={`Précisez ${(VARIABLE_LABELS[key] || key).toLowerCase()}...`}
              data-testid={`input-var-other-${key}-${sectionKey}`}
            />
          )}
        </div>
      );
    }

    if (isFinalityDropdown) {
      return (
        <Select
          value={variables[key] || ""}
          onValueChange={(v) => handleVariableChange(key, v)}
        >
          <SelectTrigger data-testid={`select-var-${key}-${sectionKey}`}>
            <SelectValue placeholder="Choisir la finalité..." />
          </SelectTrigger>
          <SelectContent>
            {FINALITIES.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (isTextArea) {
      return (
        <Textarea
          value={variables[key] || ""}
          onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
          className="text-sm h-16 resize-none"
          placeholder={`${VARIABLE_LABELS[key] || key}...`}
          data-testid={`input-var-${key}-${sectionKey}`}
        />
      );
    }

    return (
      <Input
        value={variables[key] || ""}
        onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
        className="text-sm"
        placeholder={`${VARIABLE_LABELS[key] || key}...`}
        data-testid={`input-var-${key}-${sectionKey}`}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVariables(!showVariables)}
          data-testid={`button-toggle-variables-${sectionKey}`}
        >
          <Settings2 className="w-4 h-4 mr-1" />
          Variables
          {showVariables ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          data-testid={`button-toggle-filters-${sectionKey}`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" />
          Options
          {showFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>

        {activeVersion?.content && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid={`button-export-${sectionKey}`}>
                <Download className="w-4 h-4 mr-1" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cette section</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportSection("word")} data-testid={`button-export-word-${sectionKey}`}>
                <FileText className="w-4 h-4 mr-2" /> Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSection("pdf")} data-testid={`button-export-pdf-${sectionKey}`}>
                <FileDown className="w-4 h-4 mr-2" /> PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Toutes les sections</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBatchExport("word")} data-testid="button-export-all-word">
                <FileText className="w-4 h-4 mr-2" /> Tout en Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchExport("pdf")} data-testid="button-export-all-pdf">
                <FileDown className="w-4 h-4 mr-2" /> Tout en PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {showVariables && (
        <Card className="border-dashed" data-testid={`panel-variables-${sectionKey}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Variables utilisées pour cette section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-muted-foreground">
              Pré-remplies depuis le paramétrage du projet. Modifiez-les pour ajuster la génération IA de cette section.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variableKeys.map(key => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {VARIABLE_LABELS[key] || key}
                    {FUNDAMENTAL_KEYS.includes(key) && (
                      <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">fondamentale</Badge>
                    )}
                  </Label>
                  {renderVariableInput(key)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card className="border-dashed" data-testid={`panel-filters-${sectionKey}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Options d'affinage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex flex-wrap gap-4">
              {filterOptions.map(opt => (
                <div key={opt.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-${opt.key}-${sectionKey}`}
                    checked={!!filters[opt.key]}
                    onCheckedChange={(checked) => onFiltersChange({ ...filters, [opt.key]: !!checked })}
                    data-testid={`checkbox-filter-${opt.key}-${sectionKey}`}
                  />
                  <Label htmlFor={`filter-${opt.key}-${sectionKey}`} className="text-sm cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>

            {isLiteratureReview && literatureConfig && onLiteratureConfigChange && (
              <LiteratureReviewForm config={literatureConfig} onChange={onLiteratureConfigChange} />
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          Prompt de correction / d'ajustement
        </Label>
        <Textarea
          value={correctionPrompt}
          onChange={e => onCorrectionPromptChange(e.target.value)}
          placeholder="Indiquez ici ce que vous souhaitez corriger, préciser ou ajouter. Ex: Reformuler de façon plus opérationnelle, simplifier pour un niveau licence..."
          className="resize-none h-20 text-sm"
          data-testid={`textarea-correction-${sectionKey}`}
        />
      </div>

      <Dialog open={!!pendingChange} onOpenChange={(open) => { if (!open) setPendingChange(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Modification d'une variable fondamentale
            </DialogTitle>
            <DialogDescription>
              Modifier <strong>{pendingChange ? VARIABLE_LABELS[pendingChange.key] || pendingChange.key : ""}</strong> peut
              impacter le sujet, la problématique, les hypothèses, le plan, les concepts, la revue de littérature et la
              méthodologie.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cette modification sera utilisée pour les prochaines générations de cette section. Vous pourrez régénérer
            les autres sections si nécessaire.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingChange(null)} data-testid="button-cancel-var-change">
              Annuler
            </Button>
            <Button onClick={confirmFundamentalChange} data-testid="button-confirm-var-change">
              Confirmer la modification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ARTICLES_PER_PAGE = 5;

function LiteratureReviewForm({
  config,
  onChange,
}: {
  config: LiteratureConfig;
  onChange: (c: LiteratureConfig) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [articlePage, setArticlePage] = useState(0);
  const [newArticle, setNewArticle] = useState<Omit<ArticleReference, "id">>({
    title: "", authors: "", year: "", source: "", url: "", notes: "",
  });

  const articles = config.articles || [];
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const paginatedArticles = articles.slice(articlePage * ARTICLES_PER_PAGE, (articlePage + 1) * ARTICLES_PER_PAGE);

  const addArticle = () => {
    if (!newArticle.title.trim()) return;
    const article: ArticleReference = {
      ...newArticle,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    };
    onChange({ ...config, articles: [...articles, article] });
    setNewArticle({ title: "", authors: "", year: "", source: "", url: "", notes: "" });
    setShowAddForm(false);
    setArticlePage(Math.floor(articles.length / ARTICLES_PER_PAGE));
  };

  const removeArticle = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    onChange({ ...config, articles: updated });
    if (articlePage >= Math.ceil(updated.length / ARTICLES_PER_PAGE)) {
      setArticlePage(Math.max(0, articlePage - 1));
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Paramètres de recherche bibliographique</h4>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Plateformes</Label>
        <div className="flex flex-wrap gap-3">
          {LITERATURE_PLATFORMS.map(p => (
            <div key={p.key} className="flex items-center gap-2">
              <Checkbox
                id={`platform-${p.key}`}
                checked={config.platforms.includes(p.key)}
                onCheckedChange={(checked) => {
                  const platforms = checked
                    ? [...config.platforms, p.key]
                    : config.platforms.filter(k => k !== p.key);
                  onChange({ ...config, platforms });
                }}
                data-testid={`checkbox-platform-${p.key}`}
              />
              <Label htmlFor={`platform-${p.key}`} className="text-sm cursor-pointer">{p.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre d'articles</Label>
          <Select
            value={String(config.articleCount)}
            onValueChange={v => onChange({ ...config, articleCount: Number(v) })}
          >
            <SelectTrigger data-testid="select-article-count"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Période début</Label>
          <Input
            type="number"
            value={config.periodStart}
            onChange={e => onChange({ ...config, periodStart: e.target.value })}
            placeholder="2015"
            className="text-sm"
            data-testid="input-period-start"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Période fin</Label>
          <Input
            type="number"
            value={config.periodEnd}
            onChange={e => onChange({ ...config, periodEnd: e.target.value })}
            placeholder="2025"
            className="text-sm"
            data-testid="input-period-end"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Langue</Label>
          <Select value={config.language} onValueChange={v => onChange({ ...config, language: v })}>
            <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">Anglais</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Niveau des sources</Label>
        <Select value={config.level} onValueChange={v => onChange({ ...config, level: v })}>
          <SelectTrigger data-testid="select-source-level"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Articles très académiques</SelectItem>
            <SelectItem value="mixed">Articles mixtes</SelectItem>
            <SelectItem value="professional">Sources professionnelles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Types de sources</Label>
        <div className="flex flex-wrap gap-3">
          {LITERATURE_SOURCE_TYPES.map(t => (
            <div key={t.key} className="flex items-center gap-2">
              <Checkbox
                id={`source-${t.key}`}
                checked={config.sourceTypes.includes(t.key)}
                onCheckedChange={(checked) => {
                  const sourceTypes = checked
                    ? [...config.sourceTypes, t.key]
                    : config.sourceTypes.filter(k => k !== t.key);
                  onChange({ ...config, sourceTypes });
                }}
                data-testid={`checkbox-source-${t.key}`}
              />
              <Label htmlFor={`source-${t.key}`} className="text-sm cursor-pointer">{t.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Articles et références ({articles.length})</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-add-article"
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter un article
          </Button>
        </div>

        {showAddForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Titre *</Label>
                  <Input
                    value={newArticle.title}
                    onChange={e => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de l'article"
                    className="text-sm"
                    data-testid="input-article-title"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Auteurs</Label>
                  <Input
                    value={newArticle.authors}
                    onChange={e => setNewArticle(prev => ({ ...prev, authors: e.target.value }))}
                    placeholder="Dupont, J., Martin, L."
                    className="text-sm"
                    data-testid="input-article-authors"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Année</Label>
                  <Input
                    value={newArticle.year}
                    onChange={e => setNewArticle(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2023"
                    className="text-sm"
                    data-testid="input-article-year"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Source / Revue</Label>
                  <Input
                    value={newArticle.source}
                    onChange={e => setNewArticle(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Revue française de..."
                    className="text-sm"
                    data-testid="input-article-source"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">URL (optionnel)</Label>
                <Input
                  value={newArticle.url || ""}
                  onChange={e => setNewArticle(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="text-sm"
                  data-testid="input-article-url"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Notes (optionnel)</Label>
                <Textarea
                  value={newArticle.notes || ""}
                  onChange={e => setNewArticle(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Points clés, pertinence..."
                  className="text-sm min-h-[60px]"
                  data-testid="input-article-notes"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addArticle} disabled={!newArticle.title.trim()} data-testid="button-save-article">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} data-testid="button-cancel-article">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {articles.length === 0 && !showAddForm && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Aucun article ajouté. Ajoutez des références pour les intégrer dans la génération.
          </p>
        )}

        {paginatedArticles.length > 0 && (
          <div className="space-y-2">
            {paginatedArticles.map((article) => (
              <Card key={article.id} data-testid={`article-card-${article.id}`}>
                <CardContent className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`article-title-${article.id}`}>{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[article.authors, article.year, article.source].filter(Boolean).join(" — ")}
                    </p>
                    {article.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{article.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {article.url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`button-article-link-${article.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArticle(article.id)}
                      data-testid={`button-remove-article-${article.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={articlePage === 0}
              onClick={() => setArticlePage(p => p - 1)}
              data-testid="button-articles-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {articlePage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={articlePage >= totalPages - 1}
              onClick={() => setArticlePage(p => p + 1)}
              data-testid="button-articles-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
