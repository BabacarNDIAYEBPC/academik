import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSearchArticles,
  useGenerateConcepts,
  useSuggestSources,
  useGenerateBibliography,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSaveSectionConfig,
  useAnalyzeArticles,
  useGenerateEquations,
} from "@/hooks/use-sections";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, ExternalLink, BookOpen, ChevronLeft, ChevronRight,
  CheckSquare, Save, Check, X, Lightbulb, Plus, Filter, SlidersHorizontal,
  FileDown, ChevronDown, FileText,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { exportToWord } from "@/lib/export-utils";


interface SourceArticle {
  lastName: string;
  firstName: string;
  title: string;
  year: string;
  publisher: string;
  platform: string;
  url: string;
  type?: string;
}

const PLATFORMS = [
  { key: "google_scholar", label: "Google Scholar" },
  { key: "pubmed", label: "PubMed" },
  { key: "hal", label: "HAL" },
  { key: "cairn", label: "Cairn" },
  { key: "sciencedirect", label: "ScienceDirect" },
];

const SOURCE_TYPES = [
  { key: "scientific_articles", label: "Articles scientifiques" },
  { key: "books", label: "Ouvrages" },
  { key: "theses", label: "Thèses / Mémoires" },
  { key: "institutional_reports", label: "Rapports institutionnels" },
  { key: "recommendations", label: "Recommandations (HAS, OMS...)" },
];

const BATCH_SIZES = [10, 20, 30, 50];

const CITATION_NORMS = [
  { key: "apa7", label: "APA 7" },
  { key: "vancouver", label: "Vancouver" },
  { key: "mla", label: "MLA" },
  { key: "chicago", label: "Chicago" },
];

type ActiveAction = null | "search" | "concepts" | "suggest" | "bibliography" | "equations" | "analysis" | "autosuggest";

interface ConceptualFrameworkModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedConceptualState {
  sources: SourceArticle[];
  selectedKeys: string[];
  conceptsContent: string;
  bibliographyContent: string;
  citationNorm: string;
  filterType: string;
  filterYear: string;
  batchSize: number;
  currentPage: number;
  instructions: string;
}

export default function ConceptualFrameworkModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: ConceptualFrameworkModuleProps) {
  const [sources, setSources] = useState<SourceArticle[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [conceptsContent, setConceptsContent] = useState("");
  const [bibliographyContent, setBibliographyContent] = useState("");
  const [citationNorm, setCitationNorm] = useState<string>("apa7");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [showConceptsDialog, setShowConceptsDialog] = useState(false);
  const [showBibDialog, setShowBibDialog] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  const [equationsContent, setEquationsContent] = useState("");
  const [showEquationsDialog, setShowEquationsDialog] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [analysisType, setAnalysisType] = useState<string>("single");
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  const [searchPlatforms, setSearchPlatforms] = useState<string[]>(["google_scholar"]);
  const [searchPeriodStart, setSearchPeriodStart] = useState("2015");
  const [searchPeriodEnd, setSearchPeriodEnd] = useState(new Date().getFullYear().toString());
  const [searchSourceTypes, setSearchSourceTypes] = useState<string[]>(["scientific_articles"]);
  const [searchArticleCount, setSearchArticleCount] = useState(10);

  const { toast } = useToast();
  const searchMutation = useSearchArticles();
  const conceptsMutation = useGenerateConcepts();
  const suggestMutation = useSuggestSources();
  const bibMutation = useGenerateBibliography();
  const saveManualMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const saveConfigMutation = useSaveSectionConfig();
  const analyzeArticlesMutation = useAnalyzeArticles();
  const equationsMutation = useGenerateEquations();

  const isAnyActionRunning = activeAction !== null;

  const stateRef = useRef({
    sources, selectedKeys, conceptsContent, bibliographyContent, citationNorm,
    filterType, filterYear, batchSize, currentPage, instructions,
  });
  useEffect(() => {
    stateRef.current = {
      sources, selectedKeys, conceptsContent, bibliographyContent, citationNorm,
      filterType, filterYear, batchSize, currentPage, instructions,
    };
  }, [sources, selectedKeys, conceptsContent, bibliographyContent, citationNorm, filterType, filterYear, batchSize, currentPage, instructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedConceptualState = {
      sources: s.sources,
      selectedKeys: Array.from(s.selectedKeys),
      conceptsContent: s.conceptsContent,
      bibliographyContent: s.bibliographyContent,
      citationNorm: s.citationNorm,
      filterType: s.filterType,
      filterYear: s.filterYear,
      batchSize: s.batchSize,
      currentPage: s.currentPage,
      instructions: s.instructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { conceptualState: state },
      projectId,
    });
  }, [section, projectId]);

  useEffect(() => {
    if (!section?.config || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.conceptualState) {
      const s: SavedConceptualState = cfg.conceptualState;
      if (s.sources?.length) setSources(s.sources);
      if (s.selectedKeys?.length) setSelectedKeys(new Set(s.selectedKeys));
      if (s.conceptsContent) setConceptsContent(s.conceptsContent);
      if (s.bibliographyContent) setBibliographyContent(s.bibliographyContent);
      if (s.citationNorm) setCitationNorm(s.citationNorm);
      if (s.filterType) setFilterType(s.filterType);
      if (s.filterYear) setFilterYear(s.filterYear);
      if (s.batchSize) setBatchSize(s.batchSize);
      if (s.currentPage !== undefined) setCurrentPage(s.currentPage);
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
  }, [sources, selectedKeys, conceptsContent, bibliographyContent, citationNorm, filterType, filterYear, batchSize, currentPage, instructions, stateLoaded]);

  const getSourceKey = (a: SourceArticle) => `${a.lastName}_${a.title}_${a.year}`;

  const toggleSource = (article: SourceArticle) => {
    const key = getSourceKey(article);
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedKeys(new Set(filteredSorted.map(getSourceKey)));
  };

  const deselectAll = () => {
    setSelectedKeys(new Set());
  };

  const filteredSorted = useMemo(() => {
    let result = [...sources];
    if (filterType !== "all") result = result.filter(a => a.type === filterType);
    if (filterYear) result = result.filter(a => a.year.includes(filterYear));
    return result;
  }, [sources, filterType, filterYear]);

  const totalPages = Math.ceil(filteredSorted.length / batchSize);
  const pagedSources = filteredSorted.slice(currentPage * batchSize, (currentPage + 1) * batchSize);

  const selectedSources = useMemo(() => {
    return sources.filter(a => selectedKeys.has(getSourceKey(a)));
  }, [sources, selectedKeys]);

  const handleSearch = () => {
    setActiveAction("search");
    searchMutation.mutate(
      {
        projectId,
        config: {
          platforms: searchPlatforms,
          articleCount: searchArticleCount,
          periodStart: searchPeriodStart,
          periodEnd: searchPeriodEnd,
          sourceTypes: searchSourceTypes,
          language: "fr",
          level: "academic",
        },
        extraContext: `${extraContext || ""}\n${instructions ? `Consignes spécifiques: ${instructions}` : ""}`,
      },
      {
        onSuccess: (data) => {
          setSources(data.articles || []);
          setCurrentPage(0);
          setActiveAction(null);
          toast({ title: "Recherche terminée", description: `${data.articles?.length || 0} source(s) trouvée(s).` });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleGenerateConcepts = () => {
    if (selectedSources.length === 0 && sources.length > 0) {
      toast({ title: "Sélection requise", description: "Sélectionnez au moins une source, ou utilisez la suggestion automatique.", variant: "destructive" });
      return;
    }
    if (selectedSources.length === 0 && sources.length === 0) {
      handleAutoSuggestAndGenerate();
      return;
    }
    setActiveAction("concepts");
    conceptsMutation.mutate(
      {
        projectId,
        sources: selectedSources,
        citationNorm: citationNorm as any,
        extraContext: `${extraContext || ""}\n${instructions ? `Consignes: ${instructions}` : ""}`,
      },
      {
        onSuccess: (data) => {
          setConceptsContent(data.content);
          setBibliographyContent(data.bibliography);
          setActiveAction(null);
          toast({ title: "Concepts générés", description: "Le cadre conceptuel et la bibliographie ont été générés." });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleSuggestSources = () => {
    setActiveAction("suggest");
    suggestMutation.mutate(
      {
        projectId,
        existingSources: sources,
        extraContext: extraContext || "",
      },
      {
        onSuccess: (data) => {
          const newSources = data.articles || [];
          setSources(prev => [...prev, ...newSources]);
          setActiveAction(null);
          toast({ title: "Sources complémentaires", description: `${newSources.length} nouvelle(s) source(s) suggérée(s).` });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleAutoSuggestAndGenerate = () => {
    setActiveAction("autosuggest");
    suggestMutation.mutate(
      {
        projectId,
        existingSources: [],
        extraContext: `${extraContext || ""}\nPropose des articles pertinents pour construire le cadre conceptuel.`,
      },
      {
        onSuccess: (data) => {
          const newSources = data.articles || [];
          setSources(newSources);
          const keys = new Set(newSources.map(getSourceKey));
          setSelectedKeys(keys);
          toast({ title: "Articles suggérés", description: `${newSources.length} source(s) proposée(s). Génération des concepts en cours...` });
          conceptsMutation.mutate(
            {
              projectId,
              sources: newSources,
              citationNorm: citationNorm as any,
              extraContext: `${extraContext || ""}\n${instructions ? `Consignes: ${instructions}` : ""}`,
            },
            {
              onSuccess: (conceptData) => {
                setConceptsContent(conceptData.content);
                setBibliographyContent(conceptData.bibliography);
                setActiveAction(null);
                toast({ title: "Concepts générés", description: "Articles proposés et cadre conceptuel généré automatiquement." });
              },
              onError: (err) => {
                setActiveAction(null);
                toast({ title: "Erreur", description: err.message, variant: "destructive" });
              },
            }
          );
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleGenerateEquations = () => {
    setActiveAction("equations");
    equationsMutation.mutate(
      {
        projectId,
        language: "both" as any,
        extraContext: `${extraContext || ""}\nGénère les équations de recherche à partir des concepts du cadre conceptuel.${instructions ? `\nConsignes: ${instructions}` : ""}`,
      },
      {
        onSuccess: (data) => {
          setEquationsContent(data.content);
          setShowEquationsDialog(true);
          setActiveAction(null);
          toast({ title: "Équations générées", description: "Les équations de recherche ont été générées." });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleAnalyzeArticles = () => {
    if (selectedSources.length === 0) {
      toast({ title: "Sélection requise", description: "Sélectionnez au moins un article.", variant: "destructive" });
      return;
    }
    const type = selectedSources.length === 1 ? "single" : analysisType;
    setActiveAction("analysis");
    analyzeArticlesMutation.mutate(
      {
        projectId,
        articles: selectedSources.map(a => ({
          title: a.title,
          authors: `${a.lastName} ${a.firstName}`.trim(),
          year: a.year,
          source: a.publisher,
          platform: a.platform,
          url: a.url,
        })),
        analysisType: type as any,
        extraContext: `${extraContext || ""}\n${instructions ? `Consignes: ${instructions}` : ""}`,
      },
      {
        onSuccess: (data) => {
          setAnalysisContent(data.content);
          setShowAnalysisDialog(true);
          setActiveAction(null);
          toast({ title: "Analyse terminée", description: "L'analyse des articles est disponible." });
        },
        onError: (err) => {
          setActiveAction(null);
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleNormChange = (norm: string) => {
    setCitationNorm(norm);
    if (selectedSources.length > 0 && bibliographyContent) {
      setActiveAction("bibliography");
      bibMutation.mutate(
        { projectId, articles: selectedSources, norm: norm as any },
        {
          onSuccess: (data) => {
            setBibliographyContent(data.content);
            setActiveAction(null);
            toast({ title: "Norme mise à jour", description: `Bibliographie convertie en ${norm.toUpperCase()}.` });
          },
          onError: () => {
            setActiveAction(null);
          },
        }
      );
    }
  };

  const handleSaveToSection = () => {
    if (!section) return;
    const fullContent = `${conceptsContent}\n\n---\n\n## Bibliographie\n\n${bibliographyContent}`;
    saveManualMutation.mutate(
      { sectionId: section.id, content: fullContent, projectId },
      {
        onSuccess: () => {
          toast({ title: "Sauvegardé", description: "Le cadre conceptuel a été enregistré." });
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
          toast({ title: "Validé", description: "Le cadre conceptuel est validé et alimentera les sections suivantes." });
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
          toast({ title: "Dévalidé", description: "Le cadre conceptuel n'est plus validé." });
        },
      }
    );
  };

  const handleExportWord = () => {
    const exportSections = [
      { label: "Cadre conceptuel", content: conceptsContent },
    ];
    if (bibliographyContent) {
      exportSections.push({ label: "Bibliographie", content: bibliographyContent });
    }
    exportToWord("Cadre conceptuel", exportSections, "cadre-conceptuel");
  };

  const isValidated = section?.status === "validated";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Cadre conceptuel</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={citationNorm} onValueChange={handleNormChange}>
                <SelectTrigger className="w-[140px]" data-testid="select-citation-norm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_NORMS.map(n => (
                    <SelectItem key={n.key} value={n.key}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isValidated ? (
                <Badge variant="default" className="bg-green-600 text-white">
                  <Check className="w-3 h-3 mr-1" /> Validé
                </Badge>
              ) : (
                section?.activeVersionId && <Badge variant="outline">Brouillon</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Recherchez des sources, sélectionnez-les, puis générez les concepts-clés avec bibliographie.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowSearchForm(!showSearchForm)}
            className="flex items-center gap-2 w-full text-left"
            data-testid="toggle-search-form"
          >
            <Search className="w-4 h-4" />
            <CardTitle className="text-base">Recherche de sources</CardTitle>
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showSearchForm ? "rotate-180" : ""}`} />
          </button>
        </CardHeader>
        {showSearchForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Plateformes</Label>
                <div className="space-y-2">
                  {PLATFORMS.map(p => (
                    <label key={p.key} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={searchPlatforms.includes(p.key)}
                        onCheckedChange={(checked) => {
                          setSearchPlatforms(prev =>
                            checked ? [...prev, p.key] : prev.filter(x => x !== p.key)
                          );
                        }}
                        data-testid={`checkbox-platform-${p.key}`}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Période</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={searchPeriodStart}
                      onChange={(e) => setSearchPeriodStart(e.target.value)}
                      className="w-24"
                      data-testid="input-period-start"
                    />
                    <span className="text-sm text-muted-foreground">à</span>
                    <Input
                      type="number"
                      value={searchPeriodEnd}
                      onChange={(e) => setSearchPeriodEnd(e.target.value)}
                      className="w-24"
                      data-testid="input-period-end"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nombre de sources</Label>
                  <Select value={searchArticleCount.toString()} onValueChange={(v) => setSearchArticleCount(Number(v))}>
                    <SelectTrigger data-testid="select-article-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCH_SIZES.map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} sources</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Types de sources</Label>
              <div className="flex flex-wrap gap-3">
                {SOURCE_TYPES.map(t => (
                  <label key={t.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={searchSourceTypes.includes(t.key)}
                      onCheckedChange={(checked) => {
                        setSearchSourceTypes(prev =>
                          checked ? [...prev, t.key] : prev.filter(x => x !== t.key)
                        );
                      }}
                      data-testid={`checkbox-source-type-${t.key}`}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Consignes spécifiques</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions libres pour affiner la recherche IA..."
                className="resize-none text-sm"
                rows={2}
                data-testid="input-search-instructions"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isAnyActionRunning}
              data-testid="button-search-sources"
            >
              {activeAction === "search" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Rechercher des sources
            </Button>
          </CardContent>
        )}
      </Card>

      {sources.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">
                Sources ({filteredSorted.length})
                {selectedKeys.size > 0 && (
                  <Badge variant="secondary" className="ml-2">{selectedKeys.size} sélectionnée(s)</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filtres
                </Button>
                <Button variant="ghost" size="sm" onClick={selectAll} data-testid="button-select-all">
                  <CheckSquare className="w-4 h-4 mr-1" /> Tout
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll} data-testid="button-deselect-all">
                  <X className="w-4 h-4 mr-1" /> Aucun
                </Button>
                <Select value={batchSize.toString()} onValueChange={(v) => { setBatchSize(Number(v)); setCurrentPage(0); }}>
                  <SelectTrigger className="w-[100px]" data-testid="select-batch-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_SIZES.map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="pb-2 pt-0">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Type:</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {SOURCE_TYPES.map(t => (
                        <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Année:</Label>
                  <Input
                    type="text"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    placeholder="ex. 2023"
                    className="w-24"
                    data-testid="filter-year"
                  />
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="space-y-2">
            {pagedSources.map((source, idx) => {
              const key = getSourceKey(source);
              const isSelected = selectedKeys.has(key);
              return (
                <div
                  key={`${key}_${idx}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected ? "border-primary bg-primary/5" : "border-border/50 hover-elevate"
                  }`}
                  onClick={() => toggleSource(source)}
                  data-testid={`source-card-${idx}`}
                >
                  <Checkbox checked={isSelected} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{source.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {source.lastName}{source.firstName ? `, ${source.firstName}` : ""}
                      {source.year ? ` (${source.year})` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {source.publisher && <span className="text-xs text-muted-foreground">{source.publisher}</span>}
                      {source.type && <Badge variant="outline" className="text-xs">{source.type}</Badge>}
                      {source.platform && <Badge variant="secondary" className="text-xs">{source.platform}</Badge>}
                    </div>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerateConcepts}
              disabled={isAnyActionRunning}
              data-testid="button-generate-concepts"
            >
              {activeAction === "concepts" || activeAction === "autosuggest" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
              Générer les concepts
              {selectedKeys.size > 0 && ` (${selectedKeys.size} source${selectedKeys.size > 1 ? "s" : ""})`}
            </Button>
            {sources.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSuggestSources}
                disabled={isAnyActionRunning}
                data-testid="button-suggest-sources"
              >
                {activeAction === "suggest" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Proposer d'autres sources
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleGenerateEquations}
              disabled={isAnyActionRunning}
              data-testid="button-generate-equations"
            >
              {activeAction === "equations" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Équations de recherche
            </Button>
            {selectedSources.length > 0 && (
              <>
                {selectedSources.length > 1 && (
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="w-[180px]" data-testid="select-analysis-type">
                      <SelectValue placeholder="Type d'analyse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple">Résumé multiple</SelectItem>
                      <SelectItem value="confrontation">Confrontation</SelectItem>
                      <SelectItem value="mapping">Mapping</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="outline"
                  onClick={handleAnalyzeArticles}
                  disabled={isAnyActionRunning}
                  data-testid="button-analyze-articles"
                >
                  {activeAction === "analysis" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  {selectedSources.length === 1 ? "Résumer l'article" : "Analyser les articles"}
                </Button>
              </>
            )}
          </div>

          {sources.length === 0 && (
            <div className="p-4 rounded-lg border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground space-y-3">
              <p>
                Vous pouvez également décider de laisser la plateforme vous proposer automatiquement 
                des articles pertinents en lien avec votre sujet.
              </p>
              <Button
                variant="secondary"
                onClick={handleAutoSuggestAndGenerate}
                disabled={isAnyActionRunning}
                data-testid="button-auto-suggest"
              >
                {activeAction === "autosuggest" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                Laisser la plateforme proposer les articles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {conceptsContent && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">Cadre conceptuel généré</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleExportWord} data-testid="button-export-word">
                  <FileDown className="w-4 h-4 mr-1" /> Word
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveToSection} data-testid="button-save-concepts">
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </Button>
                {isValidated ? (
                  <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate">
                    <X className="w-4 h-4 mr-1" /> Dévalider
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleValidate} disabled={!section?.activeVersionId} data-testid="button-validate-concepts">
                    <Check className="w-4 h-4 mr-1" /> Valider
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{conceptsContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {bibliographyContent && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <CardTitle className="text-base">Bibliographie ({citationNorm.toUpperCase()})</CardTitle>
              </div>
              <Select value={citationNorm} onValueChange={handleNormChange}>
                <SelectTrigger className="w-[140px]" data-testid="select-bib-norm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_NORMS.map(n => (
                    <SelectItem key={n.key} value={n.key}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{bibliographyContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={showEquationsDialog} onOpenChange={setShowEquationsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-equations">
          <DialogHeader>
            <DialogTitle>Équations de recherche</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{equationsContent}</ReactMarkdown>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => {
              exportToWord("Équations de recherche", [{ label: "Équations de recherche", content: equationsContent }], "equations-recherche");
            }} data-testid="button-export-equations">
              <FileDown className="w-4 h-4 mr-1" /> Word
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-analysis">
          <DialogHeader>
            <DialogTitle>Analyse des articles</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{analysisContent}</ReactMarkdown>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => {
              exportToWord("Analyse articles", [{ label: "Analyse", content: analysisContent }], "analyse-articles");
            }} data-testid="button-export-analysis">
              <FileDown className="w-4 h-4 mr-1" /> Word
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
