import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, FileText, FileDown, RefreshCw } from "lucide-react";
import { exportToPdf } from "@/lib/export-utils";
import { saveAs } from "file-saver";

interface MermaidDiagramProps {
  code: string;
  title: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  hideExportPdf?: boolean;
}

export default function MermaidDiagram({ code, title, onRegenerate, isRegenerating, hideExportPdf }: MermaidDiagramProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [rendering, setRendering] = useState(true);

  const renderDiagram = useCallback(async () => {
    if (!code || !containerRef.current) return;
    setRendering(true);
    setError("");

    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: "sans-serif",
      });

      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvgContent(svg);
    } catch (err: any) {
      console.error("Mermaid render error:", err);
      setError(err.message || t("modules.common.diagramRenderError"));
      setSvgContent("");
    } finally {
      setRendering(false);
    }
  }, [code]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  const handleExportSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, `${title.replace(/\s+/g, "_")}.svg`);
  };

  const handleExportPng = async () => {
    if (!svgContent) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve) => {
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `${title.replace(/\s+/g, "_")}.png`);
          resolve();
        }, "image/png");
      };
      img.src = url;
    });
  };

  const handleExportPdf = async () => {
    if (!svgContent) return;
    await exportToPdf(title, [{ label: title, content: `\n${svgContent}\n` }], title.replace(/\s+/g, "_"));
  };

  if (rendering) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Rendu du diagramme...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-destructive mb-2">Erreur de rendu : {error}</p>
          <pre className="text-xs bg-muted rounded p-3 overflow-x-auto whitespace-pre-wrap">{code}</pre>
          {onRegenerate && (
            <Button variant="outline" size="sm" className="mt-2" onClick={onRegenerate} disabled={isRegenerating} data-testid="button-regenerate-diagram">
              <RefreshCw className="w-4 h-4 mr-1" /> Régénérer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-medium">{title}</h4>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleExportSvg} data-testid="button-export-svg">
              <Download className="w-4 h-4 mr-1" /> SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPng} data-testid="button-export-png">
              <Download className="w-4 h-4 mr-1" /> PNG
            </Button>
            {!hideExportPdf && (
              <Button variant="outline" size="sm" onClick={handleExportPdf} data-testid="button-export-diagram-pdf">
                <FileDown className="w-4 h-4 mr-1" /> PDF
              </Button>
            )}
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isRegenerating} data-testid="button-regenerate-diagram">
                {isRegenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Régénérer
              </Button>
            )}
          </div>
        </div>
        <div
          ref={containerRef}
          className="bg-white rounded-lg p-4 overflow-x-auto border"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          data-testid="diagram-container"
        />
      </CardContent>
    </Card>
  );
}
