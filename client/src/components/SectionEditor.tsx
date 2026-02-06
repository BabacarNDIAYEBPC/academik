import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateSection,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSectionVersions,
  useActivateVersion,
} from "@/hooks/use-sections";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Pencil, Check, RefreshCw, History, ChevronDown, ChevronUp,
  Loader2, Save, X, ArrowLeft, Copy, RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SectionEditorProps {
  projectId: number;
  sectionKey: string;
  section?: ProjectSection;
  activeVersion?: SectionVersion;
  projectType: string;
  extraInputs?: React.ReactNode;
  getExtraContext?: () => string;
  config?: Record<string, any>;
}

export default function SectionEditor({
  projectId,
  sectionKey,
  section,
  activeVersion,
  projectType,
  extraInputs,
  getExtraContext,
  config,
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showRegenerateChoice, setShowRegenerateChoice] = useState(false);
  const { toast } = useToast();

  const generateMutation = useGenerateSection();
  const saveMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const activateVersionMutation = useActivateVersion();

  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const isValidated = section?.status === "validated";
  const hasContent = !!activeVersion?.content;
  const isPending = generateMutation.isPending;

  const handleGenerate = (mode: "initial" | "similar" | "different") => {
    setShowRegenerateChoice(false);
    generateMutation.mutate(
      {
        projectId,
        sectionKey,
        mode,
        extraContext: getExtraContext?.(),
        config,
      },
      {
        onSuccess: () => {
          toast({ title: "Contenu généré", description: `${label} a été généré avec succès.` });
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La génération a échoué.", variant: "destructive" });
        },
      }
    );
  };

  const handleSaveManual = () => {
    if (!section || !editContent.trim()) return;
    saveMutation.mutate(
      { sectionId: section.id, content: editContent, projectId },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: "Sauvegardé", description: "Vos modifications ont été enregistrées." });
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
          toast({ title: "Validé", description: `${label} a été validé et sera utilisé dans les sections suivantes.` });
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
          toast({ title: "Dévalidé", description: `${label} est de nouveau en brouillon.` });
        },
      }
    );
  };

  const startEditing = () => {
    setEditContent(activeVersion?.content || "");
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap pb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
              <Sparkles className="w-5 h-5 text-primary" />
              {label}
              {isValidated && (
                <Badge variant="default" className="bg-green-600 text-white" data-testid={`badge-validated-${sectionKey}`}>
                  <Check className="w-3 h-3 mr-1" /> Validé
                </Badge>
              )}
              {section && !isValidated && (
                <Badge variant="secondary" data-testid={`badge-draft-${sectionKey}`}>
                  Brouillon
                </Badge>
              )}
            </CardTitle>
          </div>
          {section && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              data-testid={`button-history-${sectionKey}`}
            >
              <History className="w-4 h-4 mr-1" /> Historique
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {extraInputs}

          {isPending && (
            <div className="flex items-center justify-center py-12 text-primary gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Génération en cours...</span>
            </div>
          )}

          {!isPending && !hasContent && !isEditing && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">Aucun contenu généré pour cette section.</p>
              <Button onClick={() => handleGenerate("initial")} data-testid={`button-generate-${sectionKey}`}>
                <Sparkles className="w-4 h-4 mr-2" /> Générer {label}
              </Button>
            </div>
          )}

          {!isPending && hasContent && !isEditing && (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4" data-testid={`content-${sectionKey}`}>
                <ReactMarkdown>{activeVersion!.content}</ReactMarkdown>
              </div>

              {activeVersion && (
                <p className="text-xs text-muted-foreground">
                  Version {activeVersion.versionNumber} &middot; {activeVersion.source === "ai" ? "Généré par IA" : "Modifié manuellement"}
                  {activeVersion.mode && activeVersion.mode !== "initial" && ` (${activeVersion.mode === "similar" ? "similaire" : "différent"})`}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={startEditing} data-testid={`button-edit-${sectionKey}`}>
                  <Pencil className="w-4 h-4 mr-1" /> Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRegenerateChoice(true)} data-testid={`button-regenerate-${sectionKey}`}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Changer
                </Button>
                {!isValidated ? (
                  <Button size="sm" onClick={handleValidate} data-testid={`button-validate-${sectionKey}`}>
                    <Check className="w-4 h-4 mr-1" /> Valider cette version
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleUnvalidate} data-testid={`button-unvalidate-${sectionKey}`}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Remettre en brouillon
                  </Button>
                )}
              </div>
            </>
          )}

          {isEditing && (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                data-testid={`textarea-edit-${sectionKey}`}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveManual} disabled={saveMutation.isPending} data-testid={`button-save-${sectionKey}`}>
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} data-testid={`button-cancel-edit-${sectionKey}`}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRegenerateChoice} onOpenChange={setShowRegenerateChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Type de régénération</DialogTitle>
            <DialogDescription>Choisissez le type de nouvelle proposition souhaitée.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("similar")}
              data-testid={`button-regenerate-similar-${sectionKey}`}
            >
              <span className="font-semibold">Proposition similaire</span>
              <span className="text-xs text-muted-foreground mt-1">Même axe, même logique, reformulation et amélioration stylistique</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("different")}
              data-testid={`button-regenerate-different-${sectionKey}`}
            >
              <span className="font-semibold">Proposition différente</span>
              <span className="text-xs text-muted-foreground mt-1">Angle différent, logique alternative, nouvelle approche</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VersionHistoryDialog
        sectionId={section?.id}
        projectId={projectId}
        sectionKey={sectionKey}
        open={showHistory}
        onOpenChange={setShowHistory}
      />
    </div>
  );
}

function VersionHistoryDialog({
  sectionId,
  projectId,
  sectionKey,
  open,
  onOpenChange,
}: {
  sectionId?: number;
  projectId: number;
  sectionKey: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: versions, isLoading } = useSectionVersions(sectionId);
  const activateMutation = useActivateVersion();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleActivate = (versionId: number) => {
    if (!sectionId) return;
    activateMutation.mutate(
      { sectionId, versionId, projectId },
      {
        onSuccess: () => {
          toast({ title: "Version restaurée", description: "Cette version est maintenant active." });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des versions — {SECTION_LABELS[sectionKey] || sectionKey}</DialogTitle>
          <DialogDescription>Consultez, comparez et restaurez les versions précédentes.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !versions || versions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucune version enregistrée.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {versions.map((v) => (
              <Card key={v.id} className={v.isActive ? "border-primary" : ""}>
                <CardHeader className="py-3 flex flex-row items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">Version {v.versionNumber}</span>
                    {v.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                    <Badge variant="secondary" className="text-xs">{v.source === "ai" ? "IA" : "Manuel"}</Badge>
                    {v.mode && v.mode !== "initial" && (
                      <Badge variant="outline" className="text-xs">{v.mode === "similar" ? "Similaire" : "Différent"}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    >
                      {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {!v.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(v.id)}
                        disabled={activateMutation.isPending}
                        data-testid={`button-restore-version-${v.id}`}
                      >
                        <ArrowLeft className="w-3 h-3 mr-1" /> Restaurer
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {expandedId === v.id && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 rounded p-3 max-h-60 overflow-y-auto">
                      <ReactMarkdown>{v.content}</ReactMarkdown>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Créé le {new Date(v.createdAt!).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
