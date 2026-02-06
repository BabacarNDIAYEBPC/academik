import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useGenerations, useGenerateAI } from "@/hooks/use-ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Sparkles,
  Download,
  Trash2,
  Plus,
  File,
  Loader2,
  Bot,
  BookOpen,
  ClipboardList,
  Award,
  Briefcase,
  Settings2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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

const FINALITY_LABELS: Record<string, string> = {
  academique: "Académique",
  professionnelle: "Professionnelle",
  mixte: "Mixte",
};

const APPROACH_LABELS: Record<string, string> = {
  theorique: "Théorique",
  appliquee: "Appliquée",
  analyse_pratiques: "Analyse de pratiques",
  etude_cas: "Étude de cas",
  ne_sais_pas: "Non défini",
};

const TYPE_LABELS: Record<string, string> = {
  memoire: "Mémoire",
  tfe: "TFE",
  vae: "VAE",
  rapport_stage: "Rapport de Stage",
};

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
  const { data: generations, isLoading } = useGenerations(project.id);
  const { mutate: generate, isPending } = useGenerateAI();
  const [context, setContext] = useState("");
  const [situationAppel, setSituationAppel] = useState("");
  const [stageMissions, setStageMissions] = useState("");
  const { toast } = useToast();

  const handleGenerate = (type: string, extraContext?: string) => {
    generate(
      {
        projectId: project.id,
        type: type as any,
        context: extraContext || context || undefined,
      },
      {
        onError: (err: any) => {
          toast({
            title: "Erreur",
            description: err.message || "La génération a échoué. Réessayez.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        {project.type === "memoire" && <MemoireControls context={context} setContext={setContext} onGenerate={handleGenerate} isPending={isPending} />}
        {project.type === "tfe" && <TFEControls situationAppel={situationAppel} setSituationAppel={setSituationAppel} context={context} setContext={setContext} onGenerate={handleGenerate} isPending={isPending} />}
        {project.type === "vae" && <VAEControls context={context} setContext={setContext} onGenerate={handleGenerate} isPending={isPending} />}
        {project.type === "rapport_stage" && <RapportStageControls stageMissions={stageMissions} setStageMissions={setStageMissions} context={context} setContext={setContext} onGenerate={handleGenerate} isPending={isPending} />}
      </div>

      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : generations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-border rounded-xl">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucune génération pour le moment.</p>
            <p className="text-xs text-muted-foreground mt-1">Utilisez les outils à gauche pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {isPending && (
              <Card className="border-primary/50 shadow-lg animate-pulse">
                <CardContent className="p-8 flex items-center justify-center text-primary gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">L'IA travaille... cela peut prendre un moment</span>
                </CardContent>
              </Card>
            )}

            {generations?.slice().reverse().map((gen: any) => (
              <Card key={gen.id} className="overflow-hidden border-border shadow-sm">
                <div className="bg-muted/30 px-6 py-3 border-b border-border flex justify-between items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">{gen.type}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(gen.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none font-serif">
                  <ReactMarkdown>
                    {typeof gen.data === 'string' ? gen.data : (gen.data?.content || gen.data?.text || JSON.stringify(gen.data, null, 2))}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoireControls({ context, setContext, onGenerate, isPending }: { context: string; setContext: (v: string) => void; onGenerate: (type: string, ctx?: string) => void; isPending: boolean }) {
  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Mémoire
        </CardTitle>
        <CardDescription className="text-xs">Génération du sujet, de la problématique et des hypothèses.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Remarques spécifiques</label>
          <Textarea
            placeholder="Ajoutez des contraintes, thèmes, ou détails importants..."
            className="resize-none h-28 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            data-testid="textarea-memoire-context"
          />
        </div>
        <div className="space-y-2 pt-2">
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("subject")} disabled={isPending} data-testid="button-generate-subject">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-primary" />}
            Générer Sujet + Problématique
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("hypotheses")} disabled={isPending} data-testid="button-generate-hypotheses">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
            Générer 3 Hypothèses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TFEControls({ situationAppel, setSituationAppel, context, setContext, onGenerate, isPending }: { situationAppel: string; setSituationAppel: (v: string) => void; context: string; setContext: (v: string) => void; onGenerate: (type: string, ctx?: string) => void; isPending: boolean }) {
  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          TFE (Santé / Social)
        </CardTitle>
        <CardDescription className="text-xs">Partez de votre situation d'appel pour générer votre questionnement.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Situation d'appel</label>
          <Textarea
            placeholder="Décrivez la situation observée : contexte, acteurs, problème identifié, conséquences..."
            className="resize-none h-36 text-sm"
            value={situationAppel}
            onChange={(e) => setSituationAppel(e.target.value)}
            data-testid="textarea-situation-appel"
          />
          <p className="text-xs text-muted-foreground mt-1">Incluez : contexte, acteurs, situation observée, problème identifié, conséquences.</p>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Remarques additionnelles</label>
          <Textarea
            placeholder="Précisions, contraintes..."
            className="resize-none h-20 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            data-testid="textarea-tfe-context"
          />
        </div>
        <div className="space-y-2 pt-2">
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("analysis", situationAppel)} disabled={isPending || !situationAppel.trim()} data-testid="button-tfe-analyze">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-primary" />}
            Analyser la situation d'appel
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("problematic", situationAppel)} disabled={isPending || !situationAppel.trim()} data-testid="button-tfe-generate">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
            Générer Question de départ + Hypothèses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VAEControls({ context, setContext, onGenerate, isPending }: { context: string; setContext: (v: string) => void; onGenerate: (type: string, ctx?: string) => void; isPending: boolean }) {
  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          VAE
        </CardTitle>
        <CardDescription className="text-xs">Analyse de votre parcours pour identifier les blocs de compétences. Pas de sujet académique ni d'hypothèses.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Informations complémentaires</label>
          <Textarea
            placeholder="Ajoutez des précisions sur votre parcours, vos expériences clés..."
            className="resize-none h-28 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            data-testid="textarea-vae-context"
          />
        </div>
        <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          Assurez-vous d'avoir ajouté votre CV et votre référentiel de compétences dans l'onglet Documents avant de lancer l'analyse.
        </p>
        <div className="space-y-2 pt-2">
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("vae_competencies")} disabled={isPending} data-testid="button-vae-analyze">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-primary" />}
            Analyser les compétences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RapportStageControls({ stageMissions, setStageMissions, context, setContext, onGenerate, isPending }: { stageMissions: string; setStageMissions: (v: string) => void; context: string; setContext: (v: string) => void; onGenerate: (type: string, ctx?: string) => void; isPending: boolean }) {
  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Rapport de Stage
        </CardTitle>
        <CardDescription className="text-xs">Décrivez vos missions pour générer un sujet et des axes d'analyse.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Contexte du stage / Missions</label>
          <Textarea
            placeholder="Décrivez l'entreprise, votre poste, vos missions principales..."
            className="resize-none h-36 text-sm"
            value={stageMissions}
            onChange={(e) => setStageMissions(e.target.value)}
            data-testid="textarea-stage-missions"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Remarques</label>
          <Textarea
            placeholder="Précisions..."
            className="resize-none h-20 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            data-testid="textarea-stage-context"
          />
        </div>
        <div className="space-y-2 pt-2">
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("subject", stageMissions)} disabled={isPending || !stageMissions.trim()} data-testid="button-stage-subject">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-primary" />}
            Générer Sujet + Problématique
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => onGenerate("hypotheses", stageMissions)} disabled={isPending || !stageMissions.trim()} data-testid="button-stage-hypotheses">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
            Générer Axes d'analyse + Hypothèses
          </Button>
        </div>
      </CardContent>
    </Card>
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
