import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSearchArticles,
  useAnalyzeArticles,
  useGenerateBibliography,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSaveSectionConfig,
  useGenerateEquations,
} from "@/hooks/use-sections";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, ExternalLink, BookOpen, ChevronLeft, ChevronRight, ChevronDown,
  FileText, GitCompare, Map as MapIcon, History, Copy, Trash2, RotateCcw,
  CheckSquare, Eye, Save, Check, X, ArrowUpDown, Filter, SlidersHorizontal,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { exportToWord } from "@/lib/export-utils";
import type { LiteratureConfig, SectionVariables } from "@/components/SectionControls";

interface LiteratureArticle {
  lastName: string;
  firstName: string;
  title: string;
  year: string;
  publisher: string;
  platform: string;
  url: string;
  type?: string;
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

const BATCH_SIZES = [10, 20, 30, 50];

type ActiveAction =
  | null
  | "search"
  | "summary_selected"
  | "summary_all"
  | "confrontation"
  | "mapping"
  | "bibliography"
  | "equations"
  | `resume_${number}`;

interface LiteratureReviewModuleProps {
  projectId: number;
  projectType: string;
  config: LiteratureConfig;
  onConfigChange: (c: LiteratureConfig) => void;
  variables: SectionVariables;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedLiteratureState {
  articles: LiteratureArticle[];
  selectedKeys: string[];
  filterType: string;
  filterYear: string;
  sortBy: string;
  batchSize: number;
  currentPage: number;
  bibliographyNorm: string;
  analyses: { title: string; content: string }[];
}

interface SearchHistoryEntry {
  id: string;
  timestamp: string;
  platforms: string[];
  language: string;
  periodStart: string;
  periodEnd: string;
  level: string;
  sourceTypes: string[];
  articleCount: number;
  resultCount: number;
  state: SavedLiteratureState;
}

export default function LiteratureReviewModule({
  projectId,
  projectType,
  config,
  onConfigChange,
  variables,
  extraContext,
  section,
}: LiteratureReviewModuleProps) {
  const [articles, setArticles] = useState<LiteratureArticle[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [bibliographyResult, setBibliographyResult] = useState("");
  const [bibliographyNorm, setBibliographyNorm] = useState<string>("apa7");
  const [showBibDialog, setShowBibDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<{ title: string; content: string }[]>([]);
  const [stateLoaded, setStateLoaded] = useState(false);
  const { toast } = useToast();

  const searchMutation = useSearchArticles();
  const analyzeMutation = useAnalyzeArticles();
  const bibMutation = useGenerateBibliography();
  const saveManualMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const saveConfigMutation = useSaveSectionConfig();
  const equationsMutation = useGenerateEquations();
  const [equationsResult, setEquationsResult] = useState("");
  const [showEquationsDialog, setShowEquationsDialog] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const isAnyActionRunning = activeAction !== null;

  const stateRef = useRef({
    articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory,
  });
  useEffect(() => {
    stateRef.current = { articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory };
  }, [articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedLiteratureState = {
      articles: s.articles,
      selectedKeys: Array.from(s.selectedKeys),
      filterType: s.filterType,
      filterYear: s.filterYear,
      sortBy: s.sortBy,
      batchSize: s.batchSize,
      currentPage: s.currentPage,
      bibliographyNorm: s.bibliographyNorm,
      analyses: s.savedAnalyses,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { literatureState: state, searchHistory: s.searchHistory },
      projectId,
    });
  }, [section, projectId]);

  useEffect(() => {
    if (!section?.config || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.literatureState) {
      const s: SavedLiteratureState = cfg.literatureState;
      if (s.articles?.length) setArticles(s.articles);
      if (s.selectedKeys?.length) setSelectedKeys(new Set(s.selectedKeys));
      if (s.filterType) setFilterType(s.filterType);
      if (s.filterYear) setFilterYear(s.filterYear);
      if (s.sortBy) setSortBy(s.sortBy);
      if (s.batchSize) setBatchSize(s.batchSize);
      if (s.currentPage !== undefined) setCurrentPage(s.currentPage);
      if (s.bibliographyNorm) setBibliographyNorm(s.bibliographyNorm);
      if (s.analyses?.length) setSavedAnalyses(s.analyses);
    }
    if (cfg?.searchHistory?.length) setSearchHistory(cfg.searchHistory);
    setStateLoaded(true);
  }, [section?.config, stateLoaded]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDirtyState = useRef(false);
  useEffect(() => {
    if (!stateLoaded || !section) return;
    hasDirtyState.current = true;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      doSave();
      hasDirtyState.current = false;
    }, 3000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, stateLoaded, section]);

  useEffect(() => {
    const sectionId = section?.id;
    return () => {
      if (hasDirtyState.current && sectionId) {
        const s = stateRef.current;
        const state: SavedLiteratureState = {
          articles: s.articles,
          selectedKeys: Array.from(s.selectedKeys),
          filterType: s.filterType,
          filterYear: s.filterYear,
          sortBy: s.sortBy,
          batchSize: s.batchSize,
          currentPage: s.currentPage,
          bibliographyNorm: s.bibliographyNorm,
          analyses: s.savedAnalyses,
        };
        fetch(`/api/sections/${sectionId}/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: { literatureState: state, searchHistory: s.searchHistory } }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [section?.id]);

  const saveToSection = (content: string, title: string) => {
    if (!section) return;
    saveManualMutation.mutate(
      { sectionId: section.id, content, projectId },
      {
        onSuccess: () => toast({ title: "Sauvegardé", description: `${title} sauvegardé dans la section.` }),
        onError: () => toast({ title: "Erreur de sauvegarde", variant: "destructive" }),
      }
    );
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      { onSuccess: () => toast({ title: "Section validée" }) }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      { onSuccess: () => toast({ title: "Validation retirée" }) }
    );
  };

  const articleKey = (a: LiteratureArticle) => `${a.lastName}|${a.firstName}|${a.title}|${a.year}`;

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    articles.forEach(a => { if (a.type) types.add(a.type); });
    return Array.from(types).sort();
  }, [articles]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    articles.forEach(a => { if (a.year) years.add(a.year); });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (filterType !== "all") {
      result = result.filter(a => a.type === filterType);
    }
    if (filterYear) {
      result = result.filter(a => a.year === filterYear);
    }
    if (sortBy === "date_asc") {
      result.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
    } else if (sortBy === "date_desc") {
      result.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    } else if (sortBy === "type") {
      result.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
    }
    return result;
  }, [articles, filterType, filterYear, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / batchSize));
  const paginatedArticles = filteredArticles.slice(currentPage * batchSize, (currentPage + 1) * batchSize);

  const selectedArticles = useMemo(() =>
    articles.filter(a => selectedKeys.has(articleKey(a))),
    [articles, selectedKeys]
  );

  const handleSearch = () => {
    setActiveAction("search");
    searchMutation.mutate(
      { projectId, config, extraContext },
      {
        onSuccess: (data) => {
          const newArticles = data.articles || [];
          setArticles(newArticles);
          setSelectedKeys(new Set());
          setCurrentPage(0);
          setFilterType("all");
          setFilterYear("");
          setSortBy("default");
          toast({ title: "Recherche terminée", description: `${newArticles.length} articles trouvés.` });
          setActiveAction(null);

          const newState: SavedLiteratureState = {
            articles: newArticles, selectedKeys: [], filterType: "all", filterYear: "", sortBy: "default",
            batchSize, currentPage: 0, bibliographyNorm, analyses: savedAnalyses,
          };
          const historyEntry: SearchHistoryEntry = {
            id: `search_${Date.now()}`,
            timestamp: new Date().toISOString(),
            platforms: [...config.platforms],
            language: config.language,
            periodStart: config.periodStart,
            periodEnd: config.periodEnd,
            level: config.level,
            sourceTypes: [...config.sourceTypes],
            articleCount: config.articleCount,
            resultCount: newArticles.length,
            state: newState,
          };
          const updatedHistory = [historyEntry, ...searchHistory];
          setSearchHistory(updatedHistory);

          if (section) {
            saveConfigMutation.mutate({
              sectionId: section.id,
              config: { literatureState: newState, searchHistory: updatedHistory },
              projectId,
            });
            hasDirtyState.current = false;
          }
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La recherche a échoué.", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const toggleSelect = (article: LiteratureArticle) => {
    const key = articleKey(article);
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allFilteredSelected = filteredArticles.length > 0 && filteredArticles.every(a => selectedKeys.has(articleKey(a)));

  const selectAll = () => {
    if (allFilteredSelected) {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        filteredArticles.forEach(a => next.delete(articleKey(a)));
        return next;
      });
    } else {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        filteredArticles.forEach(a => next.add(articleKey(a)));
        return next;
      });
    }
  };

  const handleAnalyze = (type: 'single' | 'multiple' | 'confrontation' | 'mapping', articleSubset?: LiteratureArticle[], actionId?: ActiveAction) => {
    const toAnalyze = articleSubset || selectedArticles;
    if (toAnalyze.length === 0) {
      toast({ title: "Aucun article", description: "Sélectionnez au moins un article.", variant: "destructive" });
      return;
    }
    const titles: Record<string, string> = {
      single: "Résumé de l'article",
      multiple: "Résumé de plusieurs articles",
      confrontation: "Confrontation des ouvrages",
      mapping: "Carte de mapping conceptuel",
    };
    const action = actionId || (type === "confrontation" ? "confrontation" : type === "mapping" ? "mapping" : "summary_selected");
    setActiveAction(action);
    setAnalysisTitle(titles[type] || "Analyse");
    analyzeMutation.mutate(
      {
        projectId,
        articles: toAnalyze.map(a => ({
          title: a.title,
          authors: `${a.lastName}, ${a.firstName}`,
          year: a.year,
          source: a.publisher,
          platform: a.platform,
          url: a.url,
        })),
        analysisType: type,
        extraContext,
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data.content);
          setShowAnalysisDialog(true);
          setSavedAnalyses(prev => [...prev, { title: titles[type] || "Analyse", content: data.content }]);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "L'analyse a échoué.", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleSummaryAll = () => {
    if (filteredArticles.length === 0) {
      toast({ title: "Aucun article", description: "Aucun article à résumer.", variant: "destructive" });
      return;
    }
    setActiveAction("summary_all");
    setAnalysisTitle("Résumé de tous les articles");
    analyzeMutation.mutate(
      {
        projectId,
        articles: filteredArticles.map(a => ({
          title: a.title,
          authors: `${a.lastName}, ${a.firstName}`,
          year: a.year,
          source: a.publisher,
          platform: a.platform,
          url: a.url,
        })),
        analysisType: "multiple",
        extraContext,
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data.content);
          setShowAnalysisDialog(true);
          setSavedAnalyses(prev => [...prev, { title: "Résumé de tous les articles", content: data.content }]);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "L'analyse a échoué.", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleBibliography = (articlesForBib?: LiteratureArticle[]) => {
    const toBib = articlesForBib || selectedArticles;
    if (toBib.length === 0) {
      toast({ title: "Aucun article", description: "Sélectionnez au moins un article.", variant: "destructive" });
      return;
    }
    setActiveAction("bibliography");
    bibMutation.mutate(
      {
        projectId,
        articles: toBib.map(a => ({
          lastName: a.lastName,
          firstName: a.firstName,
          title: a.title,
          year: a.year,
          publisher: a.publisher,
          source: a.publisher,
          url: a.url,
        })),
        norm: bibliographyNorm as any,
      },
      {
        onSuccess: (data) => {
          setBibliographyResult(data.content);
          setShowBibDialog(true);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La génération a échoué.", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleExportBib = async () => {
    if (!bibliographyResult) return;
    try {
      const normLabels: Record<string, string> = { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };
      const title = `Bibliographie — ${normLabels[bibliographyNorm] || bibliographyNorm}`;
      await exportToWord(title, [{ label: title, content: bibliographyResult }], "bibliographie");
      toast({ title: "Export réussi" });
    } catch {
      toast({ title: "Erreur d'export", variant: "destructive" });
    }
  };

  const handleExportAnalysis = async () => {
    if (!analysisResult) return;
    try {
      await exportToWord(analysisTitle, [{ label: analysisTitle, content: analysisResult }], "analyse");
      toast({ title: "Export réussi" });
    } catch {
      toast({ title: "Erreur d'export", variant: "destructive" });
    }
  };

  const handleGenerateEquations = () => {
    setActiveAction("equations");
    equationsMutation.mutate(
      { projectId, language: config.language as 'fr' | 'en' | 'both', extraContext },
      {
        onSuccess: (data) => {
          setEquationsResult(data.content);
          setShowEquationsDialog(true);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La génération des équations a échoué.", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleExportEquations = async () => {
    if (!equationsResult) return;
    try {
      await exportToWord("Équations de recherche", [{ label: "Équations de recherche", content: equationsResult }], "equations_recherche");
      toast({ title: "Export réussi" });
    } catch {
      toast({ title: "Erreur d'export", variant: "destructive" });
    }
  };

  const handleRestoreSearch = (entry: SearchHistoryEntry) => {
    const s = entry.state;
    setArticles(s.articles);
    setSelectedKeys(new Set(s.selectedKeys));
    setFilterType(s.filterType);
    setFilterYear(s.filterYear);
    setSortBy(s.sortBy);
    setBatchSize(s.batchSize);
    setCurrentPage(s.currentPage);
    setBibliographyNorm(s.bibliographyNorm);
    setSavedAnalyses(s.analyses || []);
    onConfigChange({
      ...config,
      platforms: entry.platforms,
      language: entry.language,
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      level: entry.level,
      sourceTypes: entry.sourceTypes,
      articleCount: entry.articleCount,
    });
    setShowHistoryDialog(false);
    toast({ title: "Recherche restaurée", description: `${s.articles.length} articles restaurés.` });
  };

  const handleDuplicateSearch = (entry: SearchHistoryEntry) => {
    onConfigChange({
      ...config,
      platforms: entry.platforms,
      language: entry.language,
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      level: entry.level,
      sourceTypes: entry.sourceTypes,
      articleCount: entry.articleCount,
    });
    setShowHistoryDialog(false);
    toast({ title: "Paramètres copiés", description: "Les paramètres de recherche ont été appliqués. Lancez la recherche." });
  };

  const handleDeleteSearch = (entryId: string) => {
    const updatedHistory = searchHistory.filter(h => h.id !== entryId);
    setSearchHistory(updatedHistory);
    if (section) {
      saveConfigMutation.mutate({
        sectionId: section.id,
        config: { searchHistory: updatedHistory },
        projectId,
      });
    }
    toast({ title: "Recherche supprimée" });
  };

  const getArticleIdx = (article: LiteratureArticle) => articles.indexOf(article);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {SECTION_LABELS["literature_review"]}
            </CardTitle>
            {section && (
              <div className="flex items-center gap-2">
                <Badge variant={section.status === "validated" ? "default" : "secondary"} data-testid="badge-lit-status">
                  {section.status === "validated" ? "Validé" : section.status === "draft" ? "Brouillon" : section.status}
                </Badge>
                {section.status === "validated" ? (
                  <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-lit-unvalidate">
                    <X className="w-4 h-4 mr-1" /> Retirer validation
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleValidate} data-testid="button-lit-validate">
                    <Check className="w-4 h-4 mr-1" /> Valider
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Plateformes de recherche</Label>
              <div className="flex flex-wrap gap-3">
                {LITERATURE_PLATFORMS.map(p => (
                  <div key={p.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`lit-platform-${p.key}`}
                      checked={config.platforms.includes(p.key)}
                      onCheckedChange={(checked) => {
                        const platforms = checked
                          ? [...config.platforms, p.key]
                          : config.platforms.filter(k => k !== p.key);
                        onConfigChange({ ...config, platforms });
                      }}
                      data-testid={`checkbox-lit-platform-${p.key}`}
                    />
                    <Label htmlFor={`lit-platform-${p.key}`} className="text-sm cursor-pointer">{p.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nombre de résultats</Label>
                <Select
                  value={String(config.articleCount)}
                  onValueChange={v => onConfigChange({ ...config, articleCount: Number(v) })}
                >
                  <SelectTrigger data-testid="select-lit-article-count"><SelectValue /></SelectTrigger>
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
                  onChange={e => onConfigChange({ ...config, periodStart: e.target.value })}
                  placeholder="2015"
                  className="text-sm"
                  data-testid="input-lit-period-start"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Période fin</Label>
                <Input
                  type="number"
                  value={config.periodEnd}
                  onChange={e => onConfigChange({ ...config, periodEnd: e.target.value })}
                  placeholder="2025"
                  className="text-sm"
                  data-testid="input-lit-period-end"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Langue</Label>
                <Select value={config.language} onValueChange={v => onConfigChange({ ...config, language: v })}>
                  <SelectTrigger data-testid="select-lit-language"><SelectValue /></SelectTrigger>
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
              <Select value={config.level} onValueChange={v => onConfigChange({ ...config, level: v })}>
                <SelectTrigger data-testid="select-lit-level"><SelectValue /></SelectTrigger>
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
                      id={`lit-source-${t.key}`}
                      checked={config.sourceTypes.includes(t.key)}
                      onCheckedChange={(checked) => {
                        const sourceTypes = checked
                          ? [...config.sourceTypes, t.key]
                          : config.sourceTypes.filter(k => k !== t.key);
                        onConfigChange({ ...config, sourceTypes });
                      }}
                      data-testid={`checkbox-lit-source-${t.key}`}
                    />
                    <Label htmlFor={`lit-source-${t.key}`} className="text-sm cursor-pointer">{t.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Button
                onClick={handleSearch}
                disabled={isAnyActionRunning}
                data-testid="button-search-articles"
              >
                {activeAction === "search" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recherche en cours...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Lancer la recherche</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateEquations}
                disabled={isAnyActionRunning}
                data-testid="button-generate-equations"
              >
                {activeAction === "equations" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération en cours...</>
                ) : (
                  <><FileText className="w-4 h-4 mr-2" /> Générer les équations de recherche</>
                )}
              </Button>
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryDialog(true)}
                  data-testid="button-search-history"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique des recherches
                  <Badge variant="secondary" className="ml-1">{searchHistory.length}</Badge>
                </Button>
              )}
            </div>
          </div>

          {articles.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm" data-testid="text-results-count">
                    {filteredArticles.length} résultat(s){filterType !== "all" || filterYear ? " (filtré)" : ""}
                  </h3>
                  <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                  {selectedKeys.size > 0 && (
                    <Badge variant="secondary" data-testid="badge-selected-count">{selectedArticles.length} sélectionné(s)</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="button-toggle-filters"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1" /> Filtres & tri
                  </Button>
                  <Select value={String(batchSize)} onValueChange={v => { setBatchSize(Number(v)); setCurrentPage(0); }}>
                    <SelectTrigger className="w-[80px]" data-testid="select-batch-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCH_SIZES.map(s => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showFilters && (
                <div className="flex items-end gap-3 flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      <Filter className="w-3 h-3 inline mr-1" />Type de document
                    </Label>
                    <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {availableTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      <Filter className="w-3 h-3 inline mr-1" />Année
                    </Label>
                    <Select value={filterYear || "all"} onValueChange={v => { setFilterYear(v === "all" ? "" : v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[120px]" data-testid="select-filter-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {availableYears.map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      <ArrowUpDown className="w-3 h-3 inline mr-1" />Trier par
                    </Label>
                    <Select value={sortBy} onValueChange={v => { setSortBy(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[160px]" data-testid="select-sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Par défaut</SelectItem>
                        <SelectItem value="date_desc">Date (récent)</SelectItem>
                        <SelectItem value="date_asc">Date (ancien)</SelectItem>
                        <SelectItem value="type">Type de source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(filterType !== "all" || filterYear || sortBy !== "default") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setFilterType("all"); setFilterYear(""); setSortBy("default"); setCurrentPage(0); }}
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4 mr-1" /> Réinitialiser
                    </Button>
                  )}
                </div>
              )}

              <div className="rounded-lg border">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 text-left hover-elevate rounded-lg"
                  onClick={() => setShowActions(!showActions)}
                  data-testid="button-toggle-actions"
                >
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Actions d'analyse
                    {selectedArticles.length > 0 && <Badge variant="secondary" className="ml-1">{selectedArticles.length}</Badge>}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showActions ? "rotate-180" : ""}`} />
                </button>
                {showActions && (
                  <div className="flex items-center gap-2 flex-wrap p-3 pt-0">
                    {selectedArticles.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze(selectedArticles.length === 1 ? "single" : "multiple", undefined, "summary_selected")}
                        disabled={isAnyActionRunning}
                        data-testid="button-summary-selected"
                      >
                        {activeAction === "summary_selected" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                        Résumé ({selectedArticles.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSummaryAll}
                      disabled={isAnyActionRunning}
                      data-testid="button-summary-all"
                    >
                      {activeAction === "summary_all" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                      Résumé de tous ({filteredArticles.length})
                    </Button>
                    {selectedArticles.length >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze("confrontation")}
                        disabled={isAnyActionRunning}
                        data-testid="button-confrontation"
                      >
                        {activeAction === "confrontation" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitCompare className="w-4 h-4 mr-1" />}
                        Confronter
                      </Button>
                    )}
                    {selectedArticles.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze("mapping")}
                        disabled={isAnyActionRunning}
                        data-testid="button-mapping"
                      >
                        {activeAction === "mapping" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapIcon className="w-4 h-4 mr-1" />}
                        Mapping
                      </Button>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Select value={bibliographyNorm} onValueChange={setBibliographyNorm}>
                        <SelectTrigger className="w-[120px]" data-testid="select-bib-norm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apa7">APA 7</SelectItem>
                          <SelectItem value="vancouver">Vancouver</SelectItem>
                          <SelectItem value="mla">MLA</SelectItem>
                          <SelectItem value="chicago">Chicago</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBibliography(selectedArticles.length > 0 ? undefined : filteredArticles)}
                        disabled={isAnyActionRunning}
                        data-testid="button-generate-bib"
                      >
                        {activeAction === "bibliography" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
                        Bibliographie {selectedArticles.length > 0 ? `(${selectedArticles.length})` : `(tous)`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {paginatedArticles.map((article) => {
                  const key = articleKey(article);
                  const idx = getArticleIdx(article);
                  const isSelected = selectedKeys.has(key);
                  const resumeAction: ActiveAction = `resume_${idx}`;
                  return (
                    <Card key={key} className={isSelected ? "border-primary" : ""} data-testid={`article-result-${idx}`}>
                      <CardContent className="py-3 flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(article)}
                            data-testid={`checkbox-article-${idx}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" data-testid={`text-article-title-${idx}`}>
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">{article.lastName}{article.firstName ? `, ${article.firstName}` : ""}</span>
                            {article.year && <> ({article.year})</>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {article.publisher && <>{article.publisher}</>}
                            {article.platform && <> — {article.platform}</>}
                            {article.type && (
                              <Badge variant="secondary" className="ml-2 text-[10px] py-0">{article.type}</Badge>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {article.url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`link-article-${idx}`}>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyze("single", [article], resumeAction)}
                            disabled={isAnyActionRunning}
                            data-testid={`button-resume-${idx}`}
                          >
                            {activeAction === resumeAction ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                            Résumé
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    data-testid="button-results-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                    data-testid="button-results-next"
                  >
                    Suivant <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{analysisTitle}</DialogTitle>
            <DialogDescription>Résultat de l'analyse des articles sélectionnés.</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-5">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(analysisResult, analysisTitle)} disabled={saveManualMutation.isPending} data-testid="button-save-analysis">
                <Save className="w-4 h-4 mr-1" /> Sauvegarder dans la section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportAnalysis} data-testid="button-export-analysis-word">
              <FileText className="w-4 h-4 mr-1" /> Word (.docx)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBibDialog} onOpenChange={setShowBibDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bibliographie — {
                { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" }[bibliographyNorm] || bibliographyNorm
              }
            </DialogTitle>
            <DialogDescription>Références formatées selon la norme choisie.</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-5">
            <ReactMarkdown>{bibliographyResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(bibliographyResult, "Bibliographie")} disabled={saveManualMutation.isPending} data-testid="button-save-bib">
                <Save className="w-4 h-4 mr-1" /> Sauvegarder dans la section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportBib} data-testid="button-export-bib-word">
              <FileText className="w-4 h-4 mr-1" /> Word (.docx)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des recherches</DialogTitle>
            <DialogDescription>{searchHistory.length} recherche(s) enregistrée(s)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {searchHistory.map((entry) => {
              const date = new Date(entry.timestamp);
              const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
              const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              const langLabels: Record<string, string> = { fr: "Français", en: "Anglais", both: "FR + EN" };
              return (
                <Card key={entry.id} data-testid={`history-entry-${entry.id}`}>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-sm font-medium">{dateStr} à {timeStr}</div>
                      <Badge variant="secondary">{entry.resultCount} résultat(s)</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Plateformes : {entry.platforms.map(p => LITERATURE_PLATFORMS.find(lp => lp.key === p)?.label || p).join(", ") || "Aucune"}</p>
                      <p>Langue : {langLabels[entry.language] || entry.language} | Niveau : {entry.level} | Résultats demandés : {entry.articleCount}</p>
                      {(entry.periodStart || entry.periodEnd) && (
                        <p>Période : {entry.periodStart || "..."} — {entry.periodEnd || "..."}</p>
                      )}
                      {entry.sourceTypes.length > 0 && (
                        <p>Types : {entry.sourceTypes.map(t => LITERATURE_SOURCE_TYPES.find(lt => lt.key === t)?.label || t).join(", ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreSearch(entry)}
                        data-testid={`button-restore-${entry.id}`}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" /> Restaurer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateSearch(entry)}
                        data-testid={`button-duplicate-${entry.id}`}
                      >
                        <Copy className="w-4 h-4 mr-1" /> Dupliquer les paramètres
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(entry.id)}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {searchHistory.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune recherche enregistrée.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEquationsDialog} onOpenChange={setShowEquationsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Équations de recherche</DialogTitle>
            <DialogDescription>Termes-clés, synonymes et équations booléennes pour la recherche documentaire.</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-5 whitespace-pre-wrap">
            {equationsResult}
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(equationsResult, "Équations de recherche")} disabled={saveManualMutation.isPending} data-testid="button-save-equations">
                <Save className="w-4 h-4 mr-1" /> Sauvegarder dans la section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportEquations} data-testid="button-export-equations-word">
              <FileText className="w-4 h-4 mr-1" /> Word (.docx)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
