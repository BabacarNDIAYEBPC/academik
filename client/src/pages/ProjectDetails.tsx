import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useSections, useSectionVersions, useValidatedContents, useGenerateCombined, useProjectStatusHistory } from "@/hooks/use-sections";
import { useEntitlements, useCheckout, SECTION_TO_ENTITLEMENT, hasEntitlement } from "@/hooks/use-entitlements";
import { useI18n } from "@/lib/i18n";
import SectionEditor from "@/components/SectionEditor";
import LiteratureReviewModule from "@/components/LiteratureReviewModule";
import ConceptualFrameworkModule from "@/components/ConceptualFrameworkModule";
import MethodologyModule from "@/components/MethodologyModule";
import DataCollectionModule from "@/components/DataCollectionModule";
import InterviewSimulationModule from "@/components/InterviewSimulationModule";
import DataAnalysisModule from "@/components/DataAnalysisModule";
import AssistedWritingModule from "@/components/AssistedWritingModule";
import BibliographyModule from "@/components/BibliographyModule";
import ExportsModule from "@/components/ExportsModule";
import SoutenancePPTModule from "@/components/SoutenancePPTModule";
import SoutenanceSimulationModule from "@/components/SoutenanceSimulationModule";
import AuditMemoireModule from "@/components/AuditMemoireModule";
import MemoirImportField from "@/components/MemoirImportField";
import VariablesPanel from "@/components/VariablesPanel";
import { useSaveSectionConfig } from "@/hooks/use-sections";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Sparkles, Trash2, Plus, File, Loader2, Lock,
  BookOpen, ClipboardList, Award, Briefcase,
  Map, Lightbulb, BookMarked, FlaskConical, Check,
  MessageSquare, BarChart3, PenTool, Library, Download,
  Presentation, Mic, ShieldCheck, GitBranch, Clock,
  CircleDot, AlertTriangle, RefreshCw,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SECTION_LABELS, SECTION_KEYS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import SectionControls, { type SectionVariables, type LiteratureConfig } from "@/components/SectionControls";

const DOMAIN_LABELS: Record<string, string> = {
  soins_infirmiers: "Soins infirmiers / Santé",
  travail_social: "Travail social",
  management: "Management / Gestion",
  rh: "Ressources humaines",
  economie: "Économie / Finance",
  marketing: "Marketing / Communication",
  droit: "Droit / Administration publique",
  education: "Éducation / Pédagogie",
  psychologie: "Psychologie",
  informatique: "Informatique / Numérique",
  data_ia: "Data / Intelligence artificielle",
  logistique: "Logistique / Supply chain",
  qualite: "Qualité / QHSE",
  comptabilite: "Comptabilité / Audit / Contrôle de gestion",
  banque: "Banque / Assurance",
  immobilier: "Immobilier / Urbanisme",
  sciences_politiques: "Sciences politiques / Relations internationales",
  environnement: "Environnement / Développement durable",
  industrie: "Industrie / Génie industriel",
  autre: "Autre",
};

const FINALITY_LABELS: Record<string, string> = { academique: "Académique", professionnelle: "Professionnelle", mixte: "Mixte" };
const APPROACH_LABELS: Record<string, string> = { theorique: "Théorique", appliquee: "Appliquée", analyse_pratiques: "Analyse de pratiques", etude_cas: "Étude de cas", ne_sais_pas: "Non défini" };
const TYPE_LABELS: Record<string, string> = { memoire: "Mémoire", tfe: "TFE", vae: "VAE", rapport_stage: "Rapport de Stage", these: "Thèse" };

function getSectionsForProjectType(projectType: string): string[] {
  switch (projectType) {
    case "memoire":
    case "these":
      return ["subject", "problematic", "hypotheses", "plan", "conceptual_framework", "literature_review", "methodology", "data_collection", "interview_simulation", "data_analysis", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "tfe":
      return ["situation_appel", "problematic", "hypotheses", "plan", "conceptual_framework", "literature_review", "methodology", "data_collection", "interview_simulation", "data_analysis", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "vae":
      return ["vae_competencies", "plan", "assisted_writing", "exports", "memoire_audit"];
    case "rapport_stage":
      return ["subject", "hypotheses", "plan", "conceptual_framework", "literature_review", "methodology", "data_collection", "interview_simulation", "data_analysis", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    default:
      return ["subject", "plan", "methodology", "assisted_writing", "exports", "memoire_audit"];
  }
}

function getModuleTabs(projectType: string) {
  const sections = getSectionsForProjectType(projectType);
  const tabs: { key: string; label: string; icon: any; sectionKeys: string[] }[] = [];

  const foundationKeys = sections.filter(s => ["subject", "problematic", "hypotheses", "situation_appel", "vae_competencies"].includes(s));
  if (foundationKeys.length > 0) {
    const icon = projectType === "tfe" ? ClipboardList : projectType === "vae" ? Award : projectType === "rapport_stage" ? Briefcase : BookOpen;
    tabs.push({ key: "foundations", label: "Fondements", icon, sectionKeys: foundationKeys });
  }

  if (sections.includes("plan")) {
    tabs.push({ key: "plan", label: "Plan", icon: Map, sectionKeys: ["plan"] });
  }

  if (sections.includes("conceptual_framework")) {
    tabs.push({ key: "framework", label: "Cadre conceptuel", icon: Lightbulb, sectionKeys: ["conceptual_framework"] });
  }

  if (sections.includes("literature_review")) {
    tabs.push({ key: "literature", label: "Revue", icon: BookMarked, sectionKeys: ["literature_review"] });
  }

  if (sections.includes("methodology")) {
    tabs.push({ key: "methodology", label: "Méthodo", icon: FlaskConical, sectionKeys: ["methodology"] });
  }

  if (sections.includes("data_collection")) {
    tabs.push({ key: "data_collection", label: "Collecte", icon: ClipboardList, sectionKeys: ["data_collection"] });
  }

  if (sections.includes("interview_simulation")) {
    tabs.push({ key: "interview_simulation", label: "Simulation", icon: MessageSquare, sectionKeys: ["interview_simulation"] });
  }

  if (sections.includes("data_analysis")) {
    tabs.push({ key: "data_analysis", label: "Analyse", icon: BarChart3, sectionKeys: ["data_analysis"] });
  }

  if (sections.includes("assisted_writing")) {
    tabs.push({ key: "assisted_writing", label: "Rédaction", icon: PenTool, sectionKeys: ["assisted_writing"] });
  }

  if (sections.includes("bibliography")) {
    tabs.push({ key: "bibliography", label: "Biblio", icon: Library, sectionKeys: ["bibliography"] });
  }

  if (sections.includes("exports")) {
    tabs.push({ key: "exports", label: "Export", icon: Download, sectionKeys: ["exports"] });
  }

  if (sections.includes("soutenance_ppt")) {
    tabs.push({ key: "soutenance_ppt", label: "PPT Soutenance", icon: Presentation, sectionKeys: ["soutenance_ppt"] });
  }

  if (sections.includes("soutenance_simulation")) {
    tabs.push({ key: "soutenance_simulation", label: "Oral", icon: Mic, sectionKeys: ["soutenance_simulation"] });
  }

  if (sections.includes("memoire_audit")) {
    tabs.push({ key: "memoire_audit", label: "Audit", icon: ShieldCheck, sectionKeys: ["memoire_audit"] });
  }

  tabs.push({ key: "workflow", label: "Workflow", icon: GitBranch, sectionKeys: [] });

  return tabs;
}

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!project) return <Layout><div className="text-center py-20 text-muted-foreground">Projet introuvable</div></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Badge variant="outline" className="uppercase tracking-wider text-xs font-semibold" data-testid="badge-project-type">
            {TYPE_LABELS[project.type] || project.type}
          </Badge>
          <span className="text-muted-foreground text-sm">{project.language}</span>
          {project.mainDomain && (
            <Badge variant="secondary" className="text-xs" data-testid="badge-domain">
              {DOMAIN_LABELS[project.mainDomain] || project.mainDomain}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid="text-project-name">{project.name}</h1>
      </div>

      <Tabs defaultValue="assistant" className="space-y-8">
        <TabsList className="bg-background/50 border border-border p-1 rounded-xl h-auto flex-wrap gap-1">
          <TabsTrigger value="assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-5 rounded-lg transition-all gap-2" data-testid="tab-assistant">
            <Sparkles className="w-4 h-4" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-5 rounded-lg transition-all" data-testid="tab-documents">
            Documents
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-5 rounded-lg transition-all" data-testid="tab-overview">
            Paramétrage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AssistantTab project={project} />
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <DocumentsTab project={project} />
        </TabsContent>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <OverviewTab project={project} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contexte académique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Domaine" value={DOMAIN_LABELS[project.mainDomain] || project.mainDomainOther || "Non défini"} />
          <InfoRow label="Formation" value={project.degreeTitle || "Non défini"} />
          <InfoRow label="Niveau" value={project.degreeLevel || "Non défini"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil & Orientation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Profil" value={project.userProfile || "Non défini"} />
          <InfoRow label="Finalité" value={FINALITY_LABELS[project.finality] || "Non défini"} />
          <InfoRow label="Approche" value={APPROACH_LABELS[project.approach] || "Non défini"} />
          {project.workDomain && <InfoRow label="Domaine du poste" value={project.workDomain} />}
          {project.workFunction && <InfoRow label="Fonction" value={project.workFunction} />}
          {project.workStructure && <InfoRow label="Structure" value={project.workStructure} />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Créé le" value={new Date(project.createdAt).toLocaleDateString('fr-FR')} />
          <InfoRow label="Statut" value={project.status} />
          <InfoRow label="Langue" value={project.language} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function AssistantTab({ project }: { project: any }) {
  const { data: sections, isLoading: sectionsLoading } = useSections(project.id);
  const moduleTabs = useMemo(() => getModuleTabs(project.type), [project.type]);
  const [activeModule, setActiveModule] = useState(moduleTabs[0]?.key || "foundations");

  const getSectionData = (key: string) => {
    if (!sections) return { section: undefined, activeVersion: undefined };
    const section = sections.find((s: ProjectSection) => s.key === key);
    return { section };
  };

  const validatedCount = sections?.filter((s: ProjectSection) => s.status === "validated").length || 0;
  const totalSections = getSectionsForProjectType(project.type).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {validatedCount}/{totalSections} sections validées
        </Badge>
        {validatedCount > 0 && validatedCount < totalSections && (
          <p className="text-xs text-muted-foreground">Les sections validées alimentent la mémoire contextuelle pour les générations suivantes.</p>
        )}
        {validatedCount === totalSections && totalSections > 0 && (
          <Badge variant="default" className="bg-green-600 text-white text-xs">
            <Check className="w-3 h-3 mr-1" /> Toutes les sections sont validées
          </Badge>
        )}
      </div>

      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <TabsList className="bg-background/50 border border-border p-1 rounded-xl h-auto flex-wrap gap-1">
          {moduleTabs.map(tab => {
            const Icon = tab.icon;
            const tabSections = tab.sectionKeys.map(k => sections?.find((s: ProjectSection) => s.key === k)).filter(Boolean) as ProjectSection[];
            const allValidated = tabSections.length > 0 && tabSections.every(s => s.status === "validated" || s.status === "final_version");
            const hasContent = tabSections.some(s => s.activeVersionId);
            const isWorkflow = tab.key === "workflow";

            let dotColor = "bg-muted-foreground/40";
            if (isWorkflow) dotColor = "bg-blue-500";
            else if (allValidated) dotColor = "bg-green-500";
            else if (hasContent) dotColor = "bg-yellow-500";

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-4 rounded-lg transition-all gap-2"
                data-testid={`tab-module-${tab.key}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {allValidated && !isWorkflow ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {moduleTabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
            {tab.key === "workflow" ? (
              <WorkflowOverview project={project} sections={sections || []} />
            ) : sectionsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ModuleSections
                project={project}
                sectionKeys={tab.sectionKeys}
                sections={sections || []}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  modified: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  validated: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sent_tutor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  awaiting_correction: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  corrected: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  final_version: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const SECTION_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  generated: "Généré",
  modified: "Modifié",
  validated: "Validé",
  sent_tutor: "Envoyé tuteur",
  awaiting_correction: "En correction",
  corrected: "Corrigé",
  final_version: "Version finale",
  archived: "Archivé",
};

function WorkflowOverview({ project, sections }: { project: any; sections: ProjectSection[] }) {
  const sectionOrder = getSectionsForProjectType(project.type);
  const { data: history, isLoading: historyLoading } = useProjectStatusHistory(project.id);

  const sectionsByKey = useMemo(() => {
    const map = new Map<string, ProjectSection>();
    sections.forEach(s => map.set(s.key, s));
    return map;
  }, [sections]);

  const stats = useMemo(() => {
    const total = sectionOrder.length;
    const created = sections.length;
    const validated = sections.filter(s => s.status === "validated" || s.status === "final_version").length;
    const needsReview = sections.filter(s => {
      const cfg = (s.config as Record<string, any>) || {};
      return cfg.needsReview;
    }).length;
    const withContent = sections.filter(s => s.activeVersionId).length;
    return { total, created, validated, needsReview, withContent };
  }, [sections, sectionOrder]);

  const progressPercent = stats.total > 0 ? Math.round((stats.validated / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
            <GitBranch className="w-5 h-5 text-primary" />
            Vue d'ensemble du workflow
          </CardTitle>
          <CardDescription>Suivi global de l'avancement et historique consolidé de toutes les sections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30" data-testid="stat-total">
              <p className="text-2xl font-bold">{stats.withContent}/{stats.total}</p>
              <p className="text-xs text-muted-foreground">Sections rédigées</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20" data-testid="stat-validated">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.validated}</p>
              <p className="text-xs text-muted-foreground">Validées</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20" data-testid="stat-review">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.needsReview}</p>
              <p className="text-xs text-muted-foreground">À réévaluer</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20" data-testid="stat-progress">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{progressPercent}%</p>
              <p className="text-xs text-muted-foreground">Progression</p>
            </div>
          </div>

          <div>
            <div className="h-3 bg-muted rounded-full overflow-hidden" data-testid="progress-bar">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Statut par section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sectionOrder.map((key, idx) => {
              const section = sectionsByKey.get(key);
              const status = section?.status || "draft";
              const cfg = (section?.config as Record<string, any>) || {};
              const needsRev = cfg.needsReview;
              const hasContent = !!section?.activeVersionId;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover-elevate"
                  data-testid={`workflow-section-${key}`}
                >
                  <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{SECTION_LABELS[key] || key}</span>
                  </div>
                  {needsRev && (
                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400 gap-1 no-default-hover-elevate no-default-active-elevate">
                      <AlertTriangle className="w-3 h-3" />
                      À réévaluer
                    </Badge>
                  )}
                  <Badge className={`text-xs ${STATUS_COLORS[status] || ""} no-default-hover-elevate no-default-active-elevate`}>
                    {SECTION_STATUS_LABELS[status] || status}
                  </Badge>
                  {hasContent && status !== "validated" && status !== "final_version" && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                  )}
                  {(status === "validated" || status === "final_version") && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            <Clock className="w-4 h-4" />
            Historique consolidé
          </CardTitle>
          <CardDescription>Timeline de toutes les actions sur toutes les sections.</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Aucune action enregistrée.</p>
          ) : (
            <div className="relative pl-6 space-y-0 max-h-[400px] overflow-y-auto" data-testid="consolidated-timeline">
              <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-border" />
              {history.slice(0, 50).map((entry, idx) => (
                <div key={entry.id} className="relative pb-3" data-testid={`timeline-entry-${entry.id}`}>
                  <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted border border-border"}`}>
                    <CircleDot className="w-2.5 h-2.5" />
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{SECTION_LABELS[entry.sectionKey] || entry.sectionKey}</Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[entry.status] || ""} no-default-hover-elevate no-default-active-elevate`}>
                        {SECTION_STATUS_LABELS[entry.status] || entry.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt!).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const DEFAULT_LIT_CONFIG: LiteratureConfig = {
  platforms: ["google_scholar"],
  articleCount: 10,
  periodStart: "2015",
  periodEnd: new Date().getFullYear().toString(),
  language: "fr",
  level: "academic",
  sourceTypes: ["scientific_articles"],
};

function ModuleSections({
  project,
  sectionKeys,
  sections,
}: {
  project: any;
  sectionKeys: string[];
  sections: ProjectSection[];
}) {
  const [correctionPrompts, setCorrectionPrompts] = useState<Record<string, string>>({});
  const [variableOverrides, setVariableOverrides] = useState<Record<string, SectionVariables>>({});
  const [filterStates, setFilterStates] = useState<Record<string, Record<string, boolean>>>({});
  const [litConfigs, setLitConfigs] = useState<Record<string, LiteratureConfig>>({});
  const { data: validatedContents } = useValidatedContents(project.id);
  const combinedMutation = useGenerateCombined();
  const { toast } = useToast();

  const isFoundationsModule = sectionKeys.some(k => ["subject", "problematic", "hypotheses"].includes(k));
  const hasSubject = sectionKeys.includes("subject");
  const hasProblematic = sectionKeys.includes("problematic");
  const hasHypotheses = sectionKeys.includes("hypotheses");

  const handleCombinedGeneration = (combo: "subject_problematic" | "subject_problematic_hypotheses") => {
    combinedMutation.mutate(
      { projectId: project.id, combo, mode: "initial" },
      {
        onSuccess: (data) => {
          const count = Object.keys(data.results).length;
          toast({ title: "Génération combinée terminée", description: `${count} section(s) générée(s) avec succès.` });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la génération combinée", variant: "destructive" });
        },
      }
    );
  };

  const defaultVars = useMemo(() => {
    const vars: SectionVariables = {
      domain: project.mainDomain || "",
      domainOther: project.mainDomainOther || "",
      projectType: project.type || "",
      degreeLevel: project.degreeLevel || "",
      filiere: project.degreeTitle || "",
      orientation: project.approach || "",
      finality: project.finality || "",
      context: [project.workDomain, project.workFunction, project.workStructure].filter(Boolean).join(", "),
    };
    if (validatedContents) {
      if (validatedContents.subject && !vars.subject) {
        const subjectContent = validatedContents.subject;
        vars.subject = subjectContent.length > 500 ? subjectContent.substring(0, 500) + "..." : subjectContent;
      }
      if (validatedContents.problematic && !vars.problematic) {
        const probContent = validatedContents.problematic;
        vars.problematic = probContent.length > 500 ? probContent.substring(0, 500) + "..." : probContent;
      }
      if (validatedContents.hypotheses && !vars.hypotheses) {
        const hypContent = validatedContents.hypotheses;
        vars.hypotheses = hypContent.length > 500 ? hypContent.substring(0, 500) + "..." : hypContent;
      }
    }
    return vars;
  }, [project, validatedContents]);

  return (
    <div className="space-y-6">
      {isFoundationsModule && hasSubject && hasProblematic && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Génération combinée : générer plusieurs éléments en une seule fois avec répartition automatique dans les champs correspondants.</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleCombinedGeneration("subject_problematic")}
                disabled={combinedMutation.isPending}
                data-testid="button-combined-subject-problematic"
              >
                {combinedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Sujet + Problématique
              </Button>
              {hasHypotheses && (
                <Button
                  variant="outline"
                  onClick={() => handleCombinedGeneration("subject_problematic_hypotheses")}
                  disabled={combinedMutation.isPending}
                  data-testid="button-combined-all"
                >
                  {combinedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Sujet + Problématique + Hypothèses
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {sectionKeys.map(key => {
        const section = sections.find(s => s.key === key);
        const mergedVars = { ...defaultVars, ...variableOverrides[key] };

        return (
          <SingleSectionWrapper
            key={key}
            sectionKey={key}
            projectId={project.id}
            projectType={project.type}
            section={section}
            sections={sections}
            sectionKeys={sectionKeys}
            variables={mergedVars}
            onVariablesChange={(vars) => setVariableOverrides(prev => ({ ...prev, [key]: vars }))}
            filters={filterStates[key] || {}}
            onFiltersChange={(f) => setFilterStates(prev => ({ ...prev, [key]: f }))}
            correctionPrompt={correctionPrompts[key] || ""}
            onCorrectionPromptChange={(v) => setCorrectionPrompts(prev => ({ ...prev, [key]: v }))}
            literatureConfig={key === "literature_review" ? (litConfigs[key] || DEFAULT_LIT_CONFIG) : undefined}
            onLiteratureConfigChange={key === "literature_review" ? (c) => setLitConfigs(prev => ({ ...prev, [key]: c })) : undefined}
          />
        );
      })}
    </div>
  );
}

function SingleSectionWrapper({
  sectionKey,
  projectId,
  projectType,
  section,
  sections,
  sectionKeys,
  variables,
  onVariablesChange,
  filters,
  onFiltersChange,
  correctionPrompt,
  onCorrectionPromptChange,
  literatureConfig,
  onLiteratureConfigChange,
}: {
  sectionKey: string;
  projectId: number;
  projectType: string;
  section?: ProjectSection;
  sections: ProjectSection[];
  sectionKeys: string[];
  variables: SectionVariables;
  onVariablesChange: (vars: SectionVariables) => void;
  filters: Record<string, boolean>;
  onFiltersChange: (f: Record<string, boolean>) => void;
  correctionPrompt: string;
  onCorrectionPromptChange: (v: string) => void;
  literatureConfig?: LiteratureConfig;
  onLiteratureConfigChange?: (c: LiteratureConfig) => void;
}) {
  const [importedMemoir, setImportedMemoir] = useState("");
  const [memoirLoaded, setMemoirLoaded] = useState(false);
  const saveConfigMutation = useSaveSectionConfig();

  useEffect(() => {
    if (!section?.config || memoirLoaded) return;
    const cfg = section.config as any;
    if (cfg?.importedMemoir) setImportedMemoir(cfg.importedMemoir);
    setMemoirLoaded(true);
  }, [section?.config, memoirLoaded]);

  const memoirRef = useRef(importedMemoir);
  useEffect(() => { memoirRef.current = importedMemoir; }, [importedMemoir]);

  const saveMemoir = useCallback(() => {
    if (!section) return;
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { importedMemoir: memoirRef.current },
      projectId,
    });
  }, [section, projectId]);

  const memoirTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!memoirLoaded) return;
    if (memoirTimer.current) clearTimeout(memoirTimer.current);
    memoirTimer.current = setTimeout(saveMemoir, 3000);
    return () => { if (memoirTimer.current) clearTimeout(memoirTimer.current); };
  }, [importedMemoir, memoirLoaded]);

  const { data: versions } = useSectionVersions(section?.id);
  const activeVersion = useMemo(() => {
    if (!versions || !section?.activeVersionId) return undefined;
    return versions.find(v => v.isActive);
  }, [versions, section?.activeVersionId]);

  const buildExtraContext = () => {
    let ctx = "";
    const resolveVarLabel = (key: string, val: string) => {
      if (key === "domain") return DOMAIN_LABELS[val] || variables.domainOther || val;
      if (key === "projectType") return TYPE_LABELS[val] || variables.projectTypeOther || val;
      if (key === "degreeLevel") {
        const lvlLabels: Record<string, string> = { bts_dut: "BTS / DUT", licence: "Licence", bachelor: "Bachelor", master1: "Master 1", master2: "Master 2", mba: "MBA", diplome_etat: "Diplôme d'État", doctorat: "Doctorat", vae: "VAE" };
        return lvlLabels[val] || variables.degreeLevelOther || val;
      }
      if (key === "orientation") return APPROACH_LABELS[val] || variables.orientationOther || val;
      if (key === "finality") return FINALITY_LABELS[val] || val;
      return val;
    };
    const displayKeys = ["domain", "projectType", "degreeLevel", "filiere", "orientation", "finality", "subject", "problematic", "hypotheses", "context"];
    const varEntries = displayKeys
      .filter(k => variables[k])
      .map(k => {
        const label = { domain: "Domaine", projectType: "Type de travail", degreeLevel: "Niveau", filiere: "Filière/Formation", orientation: "Orientation", finality: "Finalité", subject: "Sujet", problematic: "Problématique", hypotheses: "Hypothèses", context: "Contexte" }[k] || k;
        return `${label}: ${resolveVarLabel(k, variables[k]!)}`;
      });
    if (varEntries.length > 0) {
      ctx += "Variables du projet:\n" + varEntries.join("\n") + "\n\n";
    }
    const activeFilters = Object.entries(filters).filter(([, v]) => v).map(([k]) => k);
    if (activeFilters.length > 0) {
      const filterLabels: Record<string, string> = {
        academic: "Plan très académique",
        simplified: "Plan simplifié",
        fieldFocus: "Accent terrain",
        theoryFocus: "Accent théorique",
        classic: "Concepts classiques",
        recent: "Concepts récents",
        critical: "Approche critique",
        descriptive: "Approche descriptive",
        simple: "Méthode simple",
        deep: "Méthode approfondie",
        noHeavyField: "Faisable sans terrain lourd",
        timeConstrained: "Adaptée aux contraintes de temps",
        moreTheoretical: "Plus théorique",
        moreOperational: "Plus opérationnel",
        moreSynthetic: "Plus synthétique",
        moreDetailed: "Plus détaillé",
        professional: "Orientation professionnelle",
      };
      ctx += "Options sélectionnées: " + activeFilters.map(f => filterLabels[f] || f).join(", ") + "\n";
    }
    if (literatureConfig) {
      const platformLabels: Record<string, string> = { google_scholar: "Google Scholar", pubmed: "PubMed", hal: "HAL", cairn: "Cairn", sciencedirect: "ScienceDirect" };
      const sourceLabels: Record<string, string> = { scientific_articles: "Articles scientifiques", books: "Ouvrages", institutional_reports: "Rapports institutionnels", recommendations: "Recommandations (HAS, OMS...)", referentials: "Référentiels (VAE)" };
      const levelLabels: Record<string, string> = { academic: "Très académique", mixed: "Mixte", professional: "Professionnel" };
      ctx += "\nParamètres de recherche bibliographique:\n";
      ctx += `- Plateformes: ${literatureConfig.platforms.map(p => platformLabels[p] || p).join(", ")}\n`;
      ctx += `- Nombre d'articles: ${literatureConfig.articleCount}\n`;
      ctx += `- Période: ${literatureConfig.periodStart} - ${literatureConfig.periodEnd}\n`;
      ctx += `- Langue: ${literatureConfig.language === "fr" ? "Français" : literatureConfig.language === "en" ? "Anglais" : "Les deux"}\n`;
      ctx += `- Niveau: ${levelLabels[literatureConfig.level] || literatureConfig.level}\n`;
      ctx += `- Types de sources: ${literatureConfig.sourceTypes.map(t => sourceLabels[t] || t).join(", ")}\n`;
      if (literatureConfig.articles && literatureConfig.articles.length > 0) {
        ctx += "\nArticles/références fournis par l'utilisateur:\n";
        literatureConfig.articles.forEach((a, i) => {
          ctx += `${i + 1}. ${a.title}`;
          if (a.authors) ctx += ` — ${a.authors}`;
          if (a.year) ctx += ` (${a.year})`;
          if (a.source) ctx += `, ${a.source}`;
          if (a.notes) ctx += ` [Note: ${a.notes}]`;
          ctx += "\n";
        });
      }
    }
    if (correctionPrompt.trim()) {
      ctx += "\n=== INSTRUCTIONS DE L'UTILISATEUR (PRIORITAIRE) ===\n" + correctionPrompt.trim() + "\n";
    }
    if (importedMemoir.trim()) {
      ctx += "\n=== CONTENU DU MÉMOIRE IMPORTÉ (ÉTAT D'AVANCEMENT) ===\n" + importedMemoir.trim() + "\n";
    }
    return ctx;
  };

  const buildConfig = () => {
    const config: Record<string, any> = { variables, filters };
    if (literatureConfig) config.literatureConfig = literatureConfig;
    return config;
  };

  const { data: entData } = useEntitlements();
  const checkout = useCheckout();
  const entitlementKey = SECTION_TO_ENTITLEMENT[sectionKey];
  const isLocked = entitlementKey && !hasEntitlement(entData?.entitlements, entitlementKey);

  const ENTITLEMENT_LABELS: Record<string, string> = {
    foundation: "Fondement méthodologique",
    plan: "Plan du travail",
    conceptual: "Cadre conceptuel & théorique",
    literature: "Revue de littérature",
    methodology: "Méthodologie de recherche",
    soutenance_ppt: "PowerPoint de soutenance",
    soutenance_simulation: "Simulation de soutenance",
    audit: "Audit de mémoire",
    questionnaire: "Questionnaires avancés",
    guide_entretien: "Guides d'entretien",
    simulation_entretien: "Simulation d'entretien IA",
    analyse_qualitative: "Analyse qualitative",
    analyse_quantitative: "Analyse quantitative",
    article_analysis: "Analyse d'articles",
    article_confrontation: "Confrontation d'articles",
    biblio_multinormes: "Bibliographie multi-normes",
  };

  if (isLocked) {
    return (
      <Card className="relative overflow-visible">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{SECTION_LABELS[sectionKey] || sectionKey}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {["foundation", "plan", "conceptual", "literature", "methodology"].includes(entitlementKey)
                ? "Cette section est incluse dans le Pack Fondations (179 €). Activez-le pour accéder à toutes les fonctionnalités de base."
                : `Cette section fait partie du module « ${ENTITLEMENT_LABELS[entitlementKey] || entitlementKey} ». Activez-le pour y accéder.`}
            </p>
          </div>
          <Button
            onClick={() => {
              if (["foundation", "plan", "conceptual", "literature", "methodology"].includes(entitlementKey)) {
                checkout.mutate({ pack: "core_pack" });
              } else {
                checkout.mutate({ items: [entitlementKey] });
              }
            }}
            disabled={checkout.isPending}
            data-testid={`button-unlock-${sectionKey}`}
          >
            {checkout.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
            {["foundation", "plan", "conceptual", "literature", "methodology"].includes(entitlementKey)
              ? "Activer le Pack Fondations (179 €)"
              : "Activer ce module"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const memoirField = (
    <MemoirImportField value={importedMemoir} onChange={setImportedMemoir} />
  );

  const variablesField = (
    <VariablesPanel variables={variables} readOnly />
  );

  if (sectionKey === "literature_review" && literatureConfig && onLiteratureConfigChange) {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <LiteratureReviewModule
          projectId={projectId}
          projectType={projectType}
          config={literatureConfig}
          onConfigChange={onLiteratureConfigChange}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "conceptual_framework") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <ConceptualFrameworkModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "methodology") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <MethodologyModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "data_collection") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <DataCollectionModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "interview_simulation") {
    const dataCollectionSection = sections.find(s => s.key === "data_collection");
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <InterviewSimulationModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
          dataCollectionSection={dataCollectionSection}
        />
      </div>
    );
  }

  if (sectionKey === "data_analysis") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <DataAnalysisModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "assisted_writing") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <AssistedWritingModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "bibliography") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <BibliographyModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "soutenance_ppt") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <SoutenancePPTModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "soutenance_simulation") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <SoutenanceSimulationModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "memoire_audit") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <AuditMemoireModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "exports") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <ExportsModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memoirField}
      {variablesField}
      <SectionEditor
        projectId={projectId}
        sectionKey={sectionKey}
        section={section}
        activeVersion={activeVersion}
        projectType={projectType}
        getExtraContext={buildExtraContext}
        config={buildConfig()}
        extraInputs={
          <SectionControls
            sectionKey={sectionKey}
            projectId={projectId}
            projectType={projectType}
            variables={variables}
            onVariablesChange={onVariablesChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
            correctionPrompt={correctionPrompt}
            onCorrectionPromptChange={onCorrectionPromptChange}
            literatureConfig={literatureConfig}
            onLiteratureConfigChange={onLiteratureConfigChange}
            activeVersion={activeVersion}
          />
        }
      />
    </div>
  );
}

function DocumentsTab({ project }: { project: any }) {
  const { data: documents, isLoading } = useDocuments(project.id);
  const { mutate: createDoc } = useCreateDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocType, setNewDocType] = useState("guide");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const docTypes = project.type === "vae"
    ? [
        { value: "referentiel", label: "Référentiel de compétences" },
        { value: "cv", label: "CV" },
        { value: "attestation", label: "Attestation" },
        { value: "fiche_poste", label: "Fiche de poste" },
        { value: "rapport", label: "Rapport" },
        { value: "autre", label: "Autre document" },
      ]
    : [
        { value: "guide", label: "Guide méthodologique" },
        { value: "consignes", label: "Consignes du tuteur" },
        { value: "situation_appel", label: "Situation d'appel" },
        { value: "cv", label: "CV" },
        { value: "referentiel", label: "Référentiel de compétences" },
        { value: "autre", label: "Autre document" },
      ];

  const handleCreate = () => {
    if (!newDocName.trim()) return;
    createDoc({
      projectId: project.id,
      name: newDocName,
      type: newDocType,
      content: newDocContent || "",
    });
    setIsDialogOpen(false);
    setNewDocName("");
    setNewDocContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Documents du projet</h3>
          <p className="text-sm text-muted-foreground">Les documents sont analysés par l'IA pour améliorer les propositions.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-document">
              <Plus className="mr-2 w-4 h-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Ex: Guide méthodologique IFSI" data-testid="input-doc-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={newDocType} onValueChange={setNewDocType}>
                  <SelectTrigger data-testid="select-doc-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu (collez le texte du document)</label>
                <Textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Collez ici le contenu du document..."
                  className="h-40 text-sm"
                  data-testid="textarea-doc-content"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newDocName.trim()} data-testid="button-create-doc">Ajouter le document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : documents?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <File className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Aucun document ajouté.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {project.type === "vae"
              ? "Ajoutez votre CV et votre référentiel de compétences."
              : "Ajoutez vos guides et consignes pour de meilleures suggestions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc: any) => (
            <Card key={doc.id} className="hover-elevate">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-sm" data-testid={`text-doc-name-${doc.id}`}>{doc.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase mt-1">{doc.type}</p>
                  {doc.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.content.substring(0, 100)}...</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => deleteDoc({ id: doc.id, projectId: project.id })}
                  data-testid={`button-delete-doc-${doc.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
