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
  useGenerateSoutenancePPT,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, Presentation, Plus, Trash2, ChevronUp, ChevronDown,
  Save, Check, X, FileDown, Sparkles,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import PptxGenJS from "pptxgenjs";

interface SoutenancePPTModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface Slide {
  title: string;
  content: string;
  notes?: string;
}

interface SavedState {
  slides: Slide[];
  slideCount: number;
  theme: string;
  contextInstructions: string;
}

const THEMES = [
  { value: "academique", label: "Académique" },
  { value: "moderne", label: "Moderne" },
  { value: "minimaliste", label: "Minimaliste" },
];

export default function SoutenancePPTModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: SoutenancePPTModuleProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideCount, setSlideCount] = useState(12);
  const [theme, setTheme] = useState("academique");
  const [contextInstructions, setContextInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const generateMutation = useGenerateSoutenancePPT();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ slides, slideCount, theme, contextInstructions });
  useEffect(() => {
    stateRef.current = { slides, slideCount, theme, contextInstructions };
  }, [slides, slideCount, theme, contextInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      slides: s.slides,
      slideCount: s.slideCount,
      theme: s.theme,
      contextInstructions: s.contextInstructions,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { soutenancePPTState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.soutenancePPTState) {
      const s = cfg.soutenancePPTState as SavedState;
      if (s.slides) setSlides(s.slides);
      if (s.slideCount) setSlideCount(s.slideCount);
      if (s.theme) setTheme(s.theme);
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
  }, [slides, slideCount, theme, contextInstructions, stateLoaded, doSave]);

  const handleGenerate = () => {
    generateMutation.mutate(
      { projectId, slideCount, theme, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setSlides(data.slides);
          toast({ title: "Présentation générée", description: `${data.slides.length} diapositives ont été générées.` });
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

  const handleExportWord = () => {
    if (slides.length === 0) {
      toast({ title: "Rien à exporter", description: "Générez d'abord une présentation.", variant: "destructive" });
      return;
    }
    const sections = slides.map((slide, i) => ({
      label: `Diapositive ${i + 1} — ${slide.title}`,
      content: slide.content + (slide.notes ? `\n\n**Notes :** ${slide.notes}` : ""),
    }));
    exportToWord("PowerPoint de soutenance", sections, "soutenance_ppt");
  };

  const handleExportPPT = async () => {
    if (slides.length === 0) {
      toast({ title: "Rien à exporter", description: "Générez d'abord une présentation.", variant: "destructive" });
      return;
    }
    try {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "Academik";
      pptx.title = "Soutenance";

      const THEME_COLORS: Record<string, { bg: string; title: string; body: string; accent: string }> = {
        academique: { bg: "1a365d", title: "FFFFFF", body: "E2E8F0", accent: "3182CE" },
        moderne: { bg: "2D3748", title: "FFFFFF", body: "CBD5E0", accent: "48BB78" },
        minimaliste: { bg: "FFFFFF", title: "1A202C", body: "4A5568", accent: "3182CE" },
      };
      const colors = THEME_COLORS[theme] || THEME_COLORS.academique;

      const titleSlide = pptx.addSlide();
      titleSlide.background = { fill: colors.bg };
      titleSlide.addText("Soutenance de recherche", {
        x: 0.5, y: 1.5, w: 12, h: 1.5,
        fontSize: 36, bold: true, color: colors.title,
        align: "center",
      });
      titleSlide.addText(`${slides.length} diapositives`, {
        x: 0.5, y: 3.5, w: 12, h: 0.5,
        fontSize: 14, color: colors.body,
        align: "center",
      });

      for (const slide of slides) {
        const s = pptx.addSlide();
        s.background = { fill: colors.bg };

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 13.33, h: 1.2,
          fill: { color: colors.accent },
        });

        s.addText(slide.title, {
          x: 0.5, y: 0.15, w: 12, h: 0.9,
          fontSize: 24, bold: true, color: "FFFFFF",
          align: "left", valign: "middle",
        });

        const contentLines = slide.content.split("\n").filter(l => l.trim());
        const formattedContent = contentLines.map(line => {
          const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim().match(/^\d+\./);
          const cleanLine = line.replace(/^[\s\-\*]+/, "").replace(/^\d+\.\s*/, "").trim();
          return { text: (isBullet ? "  " : "") + cleanLine + "\n", options: { fontSize: 14, color: colors.body, bullet: isBullet ? { indent: 10 } : undefined } };
        });

        s.addText(formattedContent as any, {
          x: 0.5, y: 1.5, w: 12, h: 4.5,
          valign: "top",
        });

        if (slide.notes) {
          s.addNotes(slide.notes);
        }
      }

      await pptx.writeFile({ fileName: "soutenance_presentation.pptx" });
      toast({ title: "Export réussi", description: "Le fichier PowerPoint a été téléchargé." });
    } catch (err: any) {
      toast({ title: "Erreur d'export", description: err.message || "Erreur lors de l'export PPT", variant: "destructive" });
    }
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    setSlides(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const deleteSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index));
  };

  const addSlide = () => {
    setSlides(prev => [...prev, { title: "Nouvelle diapositive", content: "", notes: "" }]);
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">PowerPoint de soutenance</CardTitle>
          {isValidated && (
            <Badge variant="default" className="bg-green-600 text-white">
              <Check className="w-3 h-3 mr-1" />Validé
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-soutenance">
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
          {isValidated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnvalidate}
              disabled={unvalidateMutation.isPending}
              data-testid="button-unvalidate-soutenance"
            >
              {unvalidateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
              Dévalider
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleValidate}
              disabled={validateMutation.isPending || slides.length === 0}
              data-testid="button-validate-soutenance"
            >
              {validateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Valider
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPPT}
            disabled={slides.length === 0}
            data-testid="button-export-ppt-soutenance"
          >
            <Presentation className="w-4 h-4 mr-1" />PPT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportWord}
            disabled={slides.length === 0}
            data-testid="button-export-word-soutenance"
          >
            <FileDown className="w-4 h-4 mr-1" />Word
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slide-count">Nombre de diapositives</Label>
            <Select value={String(slideCount)} onValueChange={v => setSlideCount(Number(v))}>
              <SelectTrigger data-testid="select-slide-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i + 10).map(n => (
                  <SelectItem key={n} value={String(n)}>{n} diapositives</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-select">Thème de la présentation</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="context-instructions-soutenance" className="text-base font-semibold">Contexte / consignes spécifiques</Label>
          <Textarea
            id="context-instructions-soutenance"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder="Ex: Durée de la soutenance, attentes du jury, points à mettre en avant..."
            className="min-h-[80px] text-sm"
            data-testid="textarea-context-instructions-soutenance"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          data-testid="button-generate-soutenance"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-1" />
          )}
          Générer la présentation
        </Button>

        {slides.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{slides.length} diapositive{slides.length > 1 ? "s" : ""}</h3>
              <Button variant="outline" size="sm" onClick={addSlide} data-testid="button-add-slide">
                <Plus className="w-4 h-4 mr-1" />Ajouter une diapositive
              </Button>
            </div>

            {slides.map((slide, index) => (
              <Card key={index} data-testid={`card-slide-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Diapositive {index + 1}</span>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSlide(index, "up")}
                      disabled={index === 0}
                      data-testid={`button-move-up-${index}`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSlide(index, "down")}
                      disabled={index === slides.length - 1}
                      data-testid={`button-move-down-${index}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSlide(index)}
                      data-testid={`button-delete-slide-${index}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Titre</Label>
                    <Input
                      value={slide.title}
                      onChange={e => updateSlide(index, "title", e.target.value)}
                      placeholder="Titre de la diapositive"
                      data-testid={`input-slide-title-${index}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Contenu</Label>
                    <Textarea
                      value={slide.content}
                      onChange={e => updateSlide(index, "content", e.target.value)}
                      placeholder="Contenu de la diapositive..."
                      className="min-h-[100px] text-sm"
                      data-testid={`textarea-slide-content-${index}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Notes (pour l'orateur)</Label>
                    <Textarea
                      value={slide.notes || ""}
                      onChange={e => updateSlide(index, "notes", e.target.value)}
                      placeholder="Notes personnelles pour cette diapositive..."
                      className="min-h-[60px] text-sm"
                      data-testid={`textarea-slide-notes-${index}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
