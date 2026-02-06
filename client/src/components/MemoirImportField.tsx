import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, FileText, ChevronDown, ChevronRight } from "lucide-react";

interface MemoirImportFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MemoirImportField({ value, onChange }: MemoirImportFieldProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(!!value);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.bib,.md,.rtf";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const labeled = `--- ${file.name} ---\n${text}`;
        onChange(value ? `${value}\n\n${labeled}` : labeled);
        setExpanded(true);
        toast({ title: "Fichier importé", description: `"${file.name}" importé avec succès.` });
      } catch {
        toast({ title: "Erreur d'import", description: "Impossible de lire le fichier.", variant: "destructive" });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-2 rounded-md border border-dashed p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-2 hover-elevate rounded-md px-1 py-0.5"
          onClick={() => setExpanded(!expanded)}
          data-testid="button-toggle-memoir-section"
        >
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <FileText className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-semibold cursor-pointer">Importer un fichier mémoire (état d'avancement)</Label>
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleImport} data-testid="button-import-memoir">
            <Upload className="w-4 h-4 mr-1" />Importer
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
      {expanded && (
        <>
          <p className="text-xs text-muted-foreground">
            Si vous utilisez ce module indépendamment, importez ou collez votre mémoire en cours pour que l'IA récupère les données et s'adapte à votre contexte.
          </p>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className="min-h-[120px] text-xs font-mono"
            placeholder="Collez ici le contenu de votre mémoire ou importez un fichier..."
            data-testid="textarea-imported-memoir"
          />
        </>
      )}
    </div>
  );
}
