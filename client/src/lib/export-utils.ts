import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

function markdownToPlainBlocks(markdown: string): { type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet"; text: string }[] {
  const lines = markdown.split("\n");
  const blocks: { type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet"; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading3", text: trimmed.replace(/^### /, "").replace(/\*\*/g, "") });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading2", text: trimmed.replace(/^## /, "").replace(/\*\*/g, "") });
    } else if (trimmed.startsWith("# ")) {
      blocks.push({ type: "heading1", text: trimmed.replace(/^# /, "").replace(/\*\*/g, "") });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-*]\s/, "").replace(/^\d+\.\s/, "");
      blocks.push({ type: "bullet", text: bulletText.replace(/\*\*/g, "") });
    } else {
      blocks.push({ type: "paragraph", text: trimmed.replace(/\*\*/g, "") });
    }
  }

  return blocks;
}

function createDocxParagraphs(blocks: { type: string; text: string }[]): Paragraph[] {
  return blocks.map(block => {
    switch (block.type) {
      case "heading1":
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: block.text, bold: true, size: 32 })],
          spacing: { before: 400, after: 200 },
        });
      case "heading2":
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: block.text, bold: true, size: 28 })],
          spacing: { before: 300, after: 150 },
        });
      case "heading3":
        return new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.text, bold: true, size: 24 })],
          spacing: { before: 200, after: 100 },
        });
      case "bullet":
        return new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: block.text, size: 22 })],
          spacing: { before: 60, after: 60 },
        });
      default:
        return new Paragraph({
          children: [new TextRun({ text: block.text, size: 22 })],
          spacing: { before: 100, after: 100 },
          alignment: AlignmentType.JUSTIFIED,
        });
    }
  });
}

export async function exportToWord(
  title: string,
  sections: { label: string; content: string }[],
  filename: string
) {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: title, bold: true, size: 36 })],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    }),
  ];

  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: section.label, bold: true, size: 32, color: "2B579A" })],
        spacing: { before: 600, after: 200 },
      })
    );

    const blocks = markdownToPlainBlocks(section.content);
    children.push(...createDocxParagraphs(blocks));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

export async function exportToPdf(
  title: string,
  sections: { label: string; content: string }[],
  filename: string
) {
  const html2pdf = (await import("html2pdf.js")).default;

  let htmlContent = `
    <div style="font-family: 'Times New Roman', serif; padding: 20px; max-width: 700px; margin: 0 auto;">
      <h1 style="text-align: center; color: #1a1a1a; font-size: 24px; margin-bottom: 30px;">${escapeHtml(title)}</h1>
  `;

  for (const section of sections) {
    htmlContent += `<h2 style="color: #2B579A; font-size: 18px; border-bottom: 2px solid #2B579A; padding-bottom: 5px; margin-top: 30px;">${escapeHtml(section.label)}</h2>`;
    htmlContent += markdownToHtml(section.content);
  }

  htmlContent += `</div>`;

  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  let html = "";
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) { html += `</${listType}>`; listType = null; }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html += `<h4 style="font-size: 14px; margin: 12px 0 6px;">${formatInline(trimmed.slice(4))}</h4>`;
    } else if (trimmed.startsWith("## ")) {
      closeList();
      html += `<h3 style="font-size: 15px; margin: 15px 0 8px;">${formatInline(trimmed.slice(3))}</h3>`;
    } else if (trimmed.startsWith("# ")) {
      closeList();
      html += `<h2 style="font-size: 16px; margin: 18px 0 10px;">${formatInline(trimmed.slice(2))}</h2>`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (listType !== "ul") { closeList(); html += '<ul style="margin: 8px 0; padding-left: 20px;">'; listType = "ul"; }
      html += `<li style="font-size: 12px; margin: 4px 0;">${formatInline(trimmed.slice(2))}</li>`;
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== "ol") { closeList(); html += '<ol style="margin: 8px 0; padding-left: 20px;">'; listType = "ol"; }
      html += `<li style="font-size: 12px; margin: 4px 0;">${formatInline(trimmed.replace(/^\d+\.\s/, ""))}</li>`;
    } else {
      closeList();
      html += `<p style="font-size: 12px; line-height: 1.6; margin: 6px 0; text-align: justify;">${formatInline(trimmed)}</p>`;
    }
  }

  closeList();
  return html;
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}
