import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, FileText, ChevronDown, ChevronRight, Loader2, Info } from "lucide-react";

interface MemoirImportFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasPreviousSections?: boolean;
  sectionKey?: string;
}

const SECTION_CONTEXT_HINTS: Record<string, string> = {
  subject: "Importez votre mémoire pour que l'IA propose un sujet adapté à votre travail existant.",
  problematic: "Importez votre mémoire pour que la problématique soit cohérente avec votre avancement.",
  hypotheses: "Importez votre mémoire pour que les hypothèses s'appuient sur votre contenu existant.",
  plan: "Importez votre mémoire pour que le plan reflète votre structure et votre progression.",
  conceptual_framework: "Importez votre mémoire pour que le cadre conceptuel s'articule avec vos travaux.",
  theoretical_framework: "Importez votre mémoire pour ancrer le cadre théorique dans votre contexte.",
  literature_review: "Importez votre mémoire pour que la revue de littérature complète vos recherches.",
  methodology: "Importez votre mémoire pour une méthodologie alignée avec votre approche.",
};

export default function MemoirImportField({ value, onChange, hasPreviousSections = true, sectionKey }: MemoirImportFieldProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(!!value);
  const [uploading, setUploading] = useState(false);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.bib,.md,.rtf,.docx,.pdf,.doc";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const ext = file.name.toLowerCase().split(".").pop();
      const binaryFormats = ["docx", "pdf", "doc"];

      try {
        let text = "";
        if (binaryFormats.includes(ext || "")) {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/parse-file", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Erreur serveur" }));
            throw new Error(err.message || "Erreur lors du traitement du fichier");
          }
          const data = await res.json();
          text = data.text;
          setUploading(false);
        } else {
          text = await file.text();
        }

        const labeled = `--- ${file.name} ---\n${text}`;
        onChange(value ? `${value}\n\n${labeled}` : labeled);
        setExpanded(true);
        toast({ title: "Mémoire importé", description: `"${file.name}" importé avec succès. L'IA utilisera ce contenu comme référence.` });
      } catch (err: any) {
        setUploading(false);
        toast({ title: "Erreur d'import", description: err.message || "Impossible de lire le fichier.", variant: "destructive" });
      }
    };
    input.click();
  };

  const contextHint = sectionKey ? SECTION_CONTEXT_HINTS[sectionKey] : undefined;

  const title = hasPreviousSections
    ? "Importer votre mémoire (optionnel)"
    : "Importer votre mémoire ou son état d'avancement";

  return (
    <div className={`space-y-2 rounded-md border p-4 ${!hasPreviousSections && !value ? "border-primary/40 bg-primary/5" : "border-dashed"}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-2 hover-elevate rounded-md px-1 py-0.5"
          onClick={() => setExpanded(!expanded)}
          data-testid="button-toggle-memoir-section"
        >
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{title}</span>
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleImport} disabled={uploading} data-testid="button-import-memoir">
            {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            {uploading ? "Traitement..." : "Importer mon mémoire"}
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                toast({ title: "Import supprimé" });
              }}
              data-testid="button-clear-memoir"
            >
              <Trash2 className="w-4 h-4 mr-1" />Effacer
            </Button>
          )}
        </div>
      </div>

      {!hasPreviousSections && !value && !expanded && (
        <div className="flex items-start gap-2 text-xs text-primary/80 bg-primary/5 rounded-md p-2 mt-1">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Vous n'avez pas encore validé les sections précédentes. Importez votre mémoire ou son état d'avancement (Word, PDF) pour que l'IA s'appuie sur votre travail existant et génère un contenu cohérent.
          </span>
        </div>
      )}

      {expanded && (
        <>
          <p className="text-xs text-muted-foreground">
            {contextHint || "Importez votre mémoire en cours (Word, PDF, texte) pour que l'IA s'adapte à votre contexte et génère un contenu cohérent avec votre travail."}
            {" "}En cas de divergence avec le paramétrage du projet, c'est le contenu importé qui fera référence.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Formats acceptés : Word (.docx), PDF (.pdf), texte (.txt), Markdown (.md), RTF, BibTeX (.bib)
          </p>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className="min-h-[120px] text-xs font-mono"
            placeholder="Collez ici le contenu de votre mémoire ou importez un fichier Word/PDF..."
            data-testid="textarea-imported-memoir"
          />
        </>
      )}
    </div>
  );
}
