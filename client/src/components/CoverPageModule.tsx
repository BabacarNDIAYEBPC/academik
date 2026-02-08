import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Save, Check, X, FileDown, Upload, Eye,
  BookOpen, Image, Trash2,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

type TemplateStyle = "classique" | "moderne" | "minimaliste";

interface CoverPageConfig {
  institutionName: string;
  programName: string;
  documentTitle: string;
  studentName: string;
  supervisorName: string;
  academicYear: string;
  logoBase64: string;
  templateStyle: TemplateStyle;
}

const defaultConfig: CoverPageConfig = {
  institutionName: "",
  programName: "",
  documentTitle: "",
  studentName: "",
  supervisorName: "",
  academicYear: "",
  logoBase64: "",
  templateStyle: "classique",
};

function generateCoverHTML(config: CoverPageConfig): string {
  const {
    institutionName, programName, documentTitle,
    studentName, supervisorName, academicYear,
    logoBase64, templateStyle,
  } = config;

  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" alt="Logo" style="max-height: 90px; max-width: 220px; object-fit: contain; margin-bottom: 16px;" />`
    : "";

  if (templateStyle === "moderne") {
    return `
      <div style="width: 100%; min-height: 700px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; box-sizing: border-box; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: rgba(0,188,212,0.08);"></div>
        <div style="position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; border-radius: 50%; background: rgba(0,188,212,0.05);"></div>
        <div style="text-align: center; z-index: 1;">
          ${logoHTML}
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 4px; color: #00BCD4; margin-bottom: 8px;">${institutionName || "Nom de l'institution"}</div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.6); margin-bottom: 40px;">${programName || "Programme / Département"}</div>
          <div style="width: 60px; height: 2px; background: #00BCD4; margin: 0 auto 40px;"></div>
          <h1 style="font-size: 28px; font-weight: 700; line-height: 1.3; margin: 0 0 50px; max-width: 500px; letter-spacing: 0.5px;">${documentTitle || "Titre du document"}</h1>
          <div style="font-size: 14px; color: rgba(255,255,255,0.85); margin-bottom: 6px;">${studentName || "Nom de l'étudiant(e)"}</div>
          ${supervisorName ? `<div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 30px;">Sous la direction de ${supervisorName}</div>` : '<div style="margin-bottom: 30px;"></div>'}
          <div style="font-size: 12px; color: #00BCD4; letter-spacing: 2px; text-transform: uppercase;">${academicYear || "Année académique"}</div>
        </div>
      </div>
    `;
  }

  if (templateStyle === "minimaliste") {
    return `
      <div style="width: 100%; min-height: 700px; font-family: 'Georgia', 'Times New Roman', serif; background: #fafafa; color: #222; display: flex; flex-direction: column; justify-content: space-between; padding: 80px 60px; box-sizing: border-box;">
        <div style="text-align: left;">
          ${logoHTML ? `<div style="margin-bottom: 40px;">${logoHTML}</div>` : ""}
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-bottom: 6px;">${institutionName || "Nom de l'institution"}</div>
          <div style="font-size: 10px; color: #aaa; letter-spacing: 1.5px; text-transform: uppercase;">${programName || "Programme / Département"}</div>
        </div>
        <div style="text-align: left; padding: 40px 0;">
          <h1 style="font-size: 32px; font-weight: 400; line-height: 1.4; margin: 0; color: #111; max-width: 480px;">${documentTitle || "Titre du document"}</h1>
          <div style="width: 40px; height: 1px; background: #333; margin: 30px 0;"></div>
          <div style="font-size: 14px; color: #444;">${studentName || "Nom de l'étudiant(e)"}</div>
          ${supervisorName ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">Dir. ${supervisorName}</div>` : ""}
        </div>
        <div style="text-align: left;">
          <div style="font-size: 11px; color: #999; letter-spacing: 1px;">${academicYear || "Année académique"}</div>
        </div>
      </div>
    `;
  }

  return `
    <div style="width: 100%; min-height: 700px; font-family: 'Times New Roman', 'Georgia', serif; background: #ffffff; color: #1a1a1a; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 50px; box-sizing: border-box; border: 3px double #1a365d;">
      <div style="text-align: center; width: 100%;">
        ${logoHTML}
        <div style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1a365d; margin-bottom: 4px;">${institutionName || "Nom de l'institution"}</div>
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a5568; margin-bottom: 30px;">${programName || "Programme / Département"}</div>
        <div style="width: 80%; height: 1px; background: #1a365d; margin: 0 auto 30px;"></div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #718096; margin-bottom: 20px;">Mémoire / Thèse</div>
        <h1 style="font-size: 24px; font-weight: 700; line-height: 1.4; margin: 0 auto 30px; max-width: 480px; color: #1a365d;">${documentTitle || "Titre du document"}</h1>
        <div style="width: 80%; height: 1px; background: #1a365d; margin: 0 auto 30px;"></div>
        <div style="font-size: 13px; margin-bottom: 4px;">Présenté par</div>
        <div style="font-size: 16px; font-weight: 700; color: #1a365d; margin-bottom: 20px;">${studentName || "Nom de l'étudiant(e)"}</div>
        ${supervisorName ? `<div style="font-size: 12px; color: #4a5568; margin-bottom: 30px;">Sous la direction de <strong>${supervisorName}</strong></div>` : '<div style="margin-bottom: 30px;"></div>'}
        <div style="font-size: 13px; font-weight: 600; color: #1a365d; letter-spacing: 1px;">${academicYear || "Année académique"}</div>
      </div>
    </div>
  `;
}

interface CoverPageModuleProps {
  project: any;
  section?: ProjectSection;
  sections: ProjectSection[];
}

export default function CoverPageModule({
  project,
  section,
  sections,
}: CoverPageModuleProps) {
  const [config, setConfig] = useState<CoverPageConfig>(defaultConfig);
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const projectId = project?.id;

  const stateRef = useRef(config);
  useEffect(() => {
    stateRef.current = config;
  }, [config]);

  const doSave = useCallback(() => {
    if (!section) return;
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { coverPageState: stateRef.current },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.coverPageState) {
      setConfig({ ...defaultConfig, ...cfg.coverPageState });
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
  }, [config, stateLoaded, doSave]);

  const updateField = useCallback(<K extends keyof CoverPageConfig>(key: K, value: CoverPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLogoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: "Le logo doit faire moins de 2 Mo.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updateField("logoBase64", base64);
        toast({ title: "Logo importé" });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleExport = () => {
    const html = generateCoverHTML(config);
    const plainText = [
      config.institutionName,
      config.programName,
      "",
      config.documentTitle,
      "",
      `Présenté par : ${config.studentName}`,
      config.supervisorName ? `Sous la direction de : ${config.supervisorName}` : "",
      "",
      config.academicYear,
    ].filter(Boolean).join("\n");

    exportToWord(
      "Page de couverture",
      [{ label: "Page de couverture", content: plainText }],
      `page_couverture_${projectId}`
    );
  };

  const handleSectionValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.sectionValidated") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const handleSectionUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.validationRemoved") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const isValidated = section?.status === "validated";
  const previewHTML = useMemo(() => generateCoverHTML(config), [config]);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">Page de couverture</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-cover-page">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-cover-page">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleSectionValidate} data-testid="button-validate-cover-page">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleSectionUnvalidate} data-testid="button-unvalidate-cover-page">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informations</h3>

            <div className="space-y-1.5">
              <Label htmlFor="cover-logo" className="text-sm">Logo de l'institution</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleLogoUpload} data-testid="button-upload-logo">
                  <Upload className="w-4 h-4 mr-1" />Importer un logo
                </Button>
                {config.logoBase64 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { updateField("logoBase64", ""); toast({ title: "Logo supprimé" }); }}
                    data-testid="button-remove-logo"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />Supprimer
                  </Button>
                )}
              </div>
              {config.logoBase64 && (
                <div className="mt-2 p-2 border rounded-md bg-muted/30 inline-block">
                  <img src={config.logoBase64} alt="Logo" className="max-h-16 max-w-[180px] object-contain" data-testid="img-logo-preview" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-institution" className="text-sm">Nom de l'institution</Label>
              <Input
                id="cover-institution"
                value={config.institutionName}
                onChange={e => updateField("institutionName", e.target.value)}
                placeholder="Université de Paris"
                data-testid="input-institution-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-program" className="text-sm">Programme / Département</Label>
              <Input
                id="cover-program"
                value={config.programName}
                onChange={e => updateField("programName", e.target.value)}
                placeholder="Master 2 Management"
                data-testid="input-program-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-title" className="text-sm">Titre du document</Label>
              <Input
                id="cover-title"
                value={config.documentTitle}
                onChange={e => updateField("documentTitle", e.target.value)}
                placeholder="Titre de votre mémoire / thèse"
                data-testid="input-document-title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-student" className="text-sm">Nom de l'étudiant(e)</Label>
              <Input
                id="cover-student"
                value={config.studentName}
                onChange={e => updateField("studentName", e.target.value)}
                placeholder="Prénom NOM"
                data-testid="input-student-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-supervisor" className="text-sm">Directeur de mémoire / Tuteur</Label>
              <Input
                id="cover-supervisor"
                value={config.supervisorName}
                onChange={e => updateField("supervisorName", e.target.value)}
                placeholder="Pr. Prénom NOM"
                data-testid="input-supervisor-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-year" className="text-sm">Année académique</Label>
              <Input
                id="cover-year"
                value={config.academicYear}
                onChange={e => updateField("academicYear", e.target.value)}
                placeholder="2025 - 2026"
                data-testid="input-academic-year"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Style de template</Label>
              <Select
                value={config.templateStyle}
                onValueChange={(v) => updateField("templateStyle", v as TemplateStyle)}
              >
                <SelectTrigger data-testid="select-template-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classique">Classique</SelectItem>
                  <SelectItem value="moderne">Moderne</SelectItem>
                  <SelectItem value="minimaliste">Minimaliste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Aperçu</h3>
            </div>
            <div
              className="border rounded-md bg-white dark:bg-slate-900 shadow-sm"
              style={{ aspectRatio: "210 / 297", maxHeight: "800px" }}
              data-testid="cover-page-preview"
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewHTML }}
                style={{ width: "100%", height: "100%", transform: "scale(1)", transformOrigin: "top center" }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
