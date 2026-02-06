import { useState, useMemo } from "react";
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
} from "@/hooks/use-sections";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, ExternalLink, BookOpen, ChevronLeft, ChevronRight,
  FileText, FileDown, GitCompare, Map as MapIcon,
  CheckSquare, Eye, Save, Check, X, ArrowUpDown, Filter, SlidersHorizontal,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { exportToWord, exportToPdf } from "@/lib/export-utils";
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

interface LiteratureReviewModuleProps {
  projectId: number;
  projectType: string;
  config: LiteratureConfig;
  onConfigChange: (c: LiteratureConfig) => void;
  variables: SectionVariables;
  extraContext?: string;
  section?: ProjectSection;
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
  const { toast } = useToast();

  const searchMutation = useSearchArticles();
  const analyzeMutation = useAnalyzeArticles();
  const bibMutation = useGenerateBibliography();
  const saveManualMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

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
    searchMutation.mutate(
      { projectId, config, extraContext },
      {
        onSuccess: (data) => {
          setArticles(data.articles || []);
          setSelectedKeys(new Set());
          setCurrentPage(0);
          setFilterType("all");
          setFilterYear("");
          setSortBy("default");
          toast({ title: "Recherche terminée", description: `${(data.articles || []).length} articles trouvés.` });
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La recherche a échoué.", variant: "destructive" });
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

  const handleAnalyze = (type: 'single' | 'multiple' | 'confrontation' | 'mapping', articleSubset?: LiteratureArticle[]) => {
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
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "L'analyse a échoué.", variant: "destructive" });
        },
      }
    );
  };

  const handleSummaryAll = () => {
    if (filteredArticles.length === 0) {
      toast({ title: "Aucun article", description: "Aucun article à résumer.", variant: "destructive" });
      return;
    }
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
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "L'analyse a échoué.", variant: "destructive" });
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
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La génération a échoué.", variant: "destructive" });
        },
      }
    );
  };

  const handleExportBib = async (format: "word" | "pdf") => {
    if (!bibliographyResult) return;
    try {
      const normLabels: Record<string, string> = { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };
      const title = `Bibliographie — ${normLabels[bibliographyNorm] || bibliographyNorm}`;
      if (format === "word") {
        await exportToWord(title, [{ label: title, content: bibliographyResult }], "bibliographie");
      } else {
        await exportToPdf(title, [{ label: title, content: bibliographyResult }], "bibliographie");
      }
      toast({ title: "Export réussi" });
    } catch {
      toast({ title: "Erreur d'export", variant: "destructive" });
    }
  };

  const handleExportAnalysis = async (format: "word" | "pdf") => {
    if (!analysisResult) return;
    try {
      if (format === "word") {
        await exportToWord(analysisTitle, [{ label: analysisTitle, content: analysisResult }], "analyse");
      } else {
        await exportToPdf(analysisTitle, [{ label: analysisTitle, content: analysisResult }], "analyse");
      }
      toast({ title: "Export réussi" });
    } catch {
      toast({ title: "Erreur d'export", variant: "destructive" });
    }
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

            <div className="pt-2">
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                data-testid="button-search-articles"
              >
                {searchMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recherche en cours...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Lancer la recherche</>
                )}
              </Button>
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

              <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg bg-muted/30 border">
                <span className="text-xs font-medium text-muted-foreground mr-1">Actions :</span>
                {selectedArticles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(selectedArticles.length === 1 ? "single" : "multiple")}
                    disabled={analyzeMutation.isPending}
                    data-testid="button-summary-selected"
                  >
                    {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                    Résumé ({selectedArticles.length})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummaryAll}
                  disabled={analyzeMutation.isPending}
                  data-testid="button-summary-all"
                >
                  {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                  Résumé de tous ({filteredArticles.length})
                </Button>
                {selectedArticles.length >= 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze("confrontation")}
                    disabled={analyzeMutation.isPending}
                    data-testid="button-confrontation"
                  >
                    {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitCompare className="w-4 h-4 mr-1" />}
                    Confronter
                  </Button>
                )}
                {selectedArticles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze("mapping")}
                    disabled={analyzeMutation.isPending}
                    data-testid="button-mapping"
                  >
                    {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapIcon className="w-4 h-4 mr-1" />}
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
                    disabled={bibMutation.isPending}
                    data-testid="button-generate-bib"
                  >
                    {bibMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
                    Bibliographie {selectedArticles.length > 0 ? `(${selectedArticles.length})` : `(tous)`}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {paginatedArticles.map((article) => {
                  const key = articleKey(article);
                  const idx = getArticleIdx(article);
                  const isSelected = selectedKeys.has(key);
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
                            onClick={() => handleAnalyze("single", [article])}
                            disabled={analyzeMutation.isPending}
                            data-testid={`button-resume-${idx}`}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Résumé
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
          <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(analysisResult, analysisTitle)} disabled={saveManualMutation.isPending} data-testid="button-save-analysis">
                <Save className="w-4 h-4 mr-1" /> Sauvegarder dans la section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleExportAnalysis("word")} data-testid="button-export-analysis-word">
              <FileText className="w-4 h-4 mr-1" /> Word
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportAnalysis("pdf")} data-testid="button-export-analysis-pdf">
              <FileDown className="w-4 h-4 mr-1" /> PDF
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
          <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4">
            <ReactMarkdown>{bibliographyResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(bibliographyResult, "Bibliographie")} disabled={saveManualMutation.isPending} data-testid="button-save-bib">
                <Save className="w-4 h-4 mr-1" /> Sauvegarder dans la section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleExportBib("word")} data-testid="button-export-bib-word">
              <FileText className="w-4 h-4 mr-1" /> Word (.docx)
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportBib("pdf")} data-testid="button-export-bib-pdf">
              <FileDown className="w-4 h-4 mr-1" /> PDF (.pdf)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
