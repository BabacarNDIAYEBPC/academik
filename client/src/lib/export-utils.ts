import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table as DocxTable, TableRow, TableCell, WidthType, BorderStyle,
  Header, Footer, PageNumber, NumberFormat,
} from "docx";
import { saveAs } from "file-saver";

const WORD_FONT = "Calibri";
const WORD_COLOR_TITLE = "1A3A5C";
const WORD_COLOR_SECTION = "2B579A";
const WORD_COLOR_H2 = "1F497D";
const WORD_COLOR_H3 = "2E74B5";
const WORD_COLOR_MUTED = "595959";

type BlockType = "heading1" | "heading2" | "heading3" | "paragraph" | "bullet" | "numbered" | "table" | "blockquote";

interface Block {
  type: BlockType;
  text: string;
  tableRows?: string[][];
}

type InlineRun = { text: string; bold?: boolean; italic?: boolean; code?: boolean };

function parseInlineRuns(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      runs.push({ text: match[1], bold: true, italic: true });
    } else if (match[2] !== undefined) {
      runs.push({ text: match[2], bold: true });
    } else if (match[3] !== undefined) {
      runs.push({ text: match[3], italic: true });
    } else if (match[4] !== undefined) {
      runs.push({ text: match[4], italic: true });
    } else if (match[5] !== undefined) {
      runs.push({ text: match[5], code: true });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  return runs.filter(r => r.text.length > 0);
}

function inlineToTextRuns(text: string, baseSize: number = 22): TextRun[] {
  const runs = parseInlineRuns(text);
  if (runs.length === 0) return [new TextRun({ text: "", size: baseSize, font: WORD_FONT })];
  return runs.map(r => new TextRun({
    text: r.text,
    bold: r.bold,
    italics: r.italic,
    font: r.code ? "Courier New" : WORD_FONT,
    size: r.code ? Math.max(baseSize - 2, 16) : baseSize,
    color: r.code ? "C7254E" : undefined,
  }));
}

function cleanHeadingText(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "").replace(/`/g, "").trim();
}

function isTableSeparatorRow(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c =>
    c.trim().replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "").replace(/`/g, "")
  );
}

function markdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  let numberedCounter = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) { i++; numberedCounter = 0; continue; }

    if (trimmed === "---" || trimmed === "***" || trimmed === "___") { i++; continue; }

    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1]?.trim() || "")) {
      const headerCells = parseTableRow(trimmed);
      i += 2;
      const dataRows: string[][] = [headerCells];
      while (i < lines.length && lines[i].trim().startsWith("|") && !isTableSeparatorRow(lines[i].trim())) {
        dataRows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", text: "", tableRows: dataRows });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      blocks.push({ type: "blockquote", text: trimmed.replace(/^>\s?/, "") });
    } else if (trimmed.startsWith("#### ") || trimmed.startsWith("### ")) {
      blocks.push({ type: "heading3", text: cleanHeadingText(trimmed.replace(/^#{3,4}\s/, "")) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading2", text: cleanHeadingText(trimmed.replace(/^## /, "")) });
    } else if (trimmed.startsWith("# ")) {
      blocks.push({ type: "heading1", text: cleanHeadingText(trimmed.replace(/^# /, "")) });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const bulletText = trimmed.replace(/^[-*•]\s/, "");
      blocks.push({ type: "bullet", text: bulletText });
    } else if (/^\d+\.\s/.test(trimmed)) {
      numberedCounter++;
      const numText = trimmed.replace(/^\d+\.\s/, "");
      blocks.push({ type: "numbered", text: numText });
    } else if (trimmed.startsWith("|")) {
      const cells = parseTableRow(trimmed);
      blocks.push({ type: "paragraph", text: cells.join(" | ") });
    } else {
      blocks.push({ type: "paragraph", text: trimmed });
    }

    i++;
  }

  return blocks;
}

function createDocxTable(rows: string[][]): DocxTable {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" };
  return new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((cells, rowIdx) =>
      new TableRow({
        tableHeader: rowIdx === 0,
        children: cells.map(cell =>
          new TableCell({
            width: { size: Math.floor(100 / Math.max(cells.length, 1)), type: WidthType.PERCENTAGE },
            shading: rowIdx === 0 ? { fill: "EBF3FB" } : rowIdx % 2 === 0 ? { fill: "F8FBFE" } : undefined,
            children: [
              new Paragraph({
                children: [new TextRun({
                  text: cell,
                  bold: rowIdx === 0,
                  size: rowIdx === 0 ? 19 : 18,
                  font: WORD_FONT,
                  color: rowIdx === 0 ? WORD_COLOR_SECTION : undefined,
                })],
                spacing: { before: 60, after: 60 },
              }),
            ],
            borders: { top: border, bottom: border, left: border, right: border },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
          })
        ),
      })
    ),
  });
}

function createDocxElements(blocks: Block[]): (Paragraph | DocxTable)[] {
  return blocks.map(block => {
    switch (block.type) {
      case "heading1":
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: block.text, bold: true, size: 30, color: WORD_COLOR_H2, font: WORD_FONT })],
          spacing: { before: 360, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DAE9F6", space: 4 } },
        });
      case "heading2":
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: block.text, bold: true, size: 26, color: WORD_COLOR_H3, font: WORD_FONT })],
          spacing: { before: 280, after: 100 },
        });
      case "heading3":
        return new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.text, bold: true, italics: true, size: 23, color: WORD_COLOR_MUTED, font: WORD_FONT })],
          spacing: { before: 200, after: 80 },
        });
      case "bullet":
        return new Paragraph({
          bullet: { level: 0 },
          children: inlineToTextRuns(block.text, 22),
          spacing: { before: 40, after: 40 },
          indent: { left: 360 },
        });
      case "numbered":
        return new Paragraph({
          numbering: { reference: "academik-numbering", level: 0 },
          children: inlineToTextRuns(block.text, 22),
          spacing: { before: 40, after: 40 },
        });
      case "blockquote":
        return new Paragraph({
          children: [new TextRun({ text: block.text, italics: true, size: 21, color: WORD_COLOR_MUTED, font: WORD_FONT })],
          indent: { left: 720, right: 360 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: WORD_COLOR_SECTION, space: 8 } },
          spacing: { before: 120, after: 120 },
        });
      case "table":
        if (block.tableRows && block.tableRows.length > 0) {
          return createDocxTable(block.tableRows);
        }
        return new Paragraph({ children: [new TextRun({ text: block.text, size: 22, font: WORD_FONT })] });
      default:
        return new Paragraph({
          children: inlineToTextRuns(block.text, 22),
          spacing: { before: 80, after: 80 },
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
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const children: (Paragraph | DocxTable)[] = [
    new Paragraph({
      children: [new TextRun({ text: "Academik", size: 24, color: WORD_COLOR_MUTED, font: WORD_FONT, italics: true })],
      spacing: { before: 0, after: 120 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: " ", size: 40 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 44, color: WORD_COLOR_TITLE, font: WORD_FONT })],
      spacing: { before: 400, after: 200 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: dateStr, size: 20, color: WORD_COLOR_MUTED, font: WORD_FONT })],
      spacing: { before: 0, after: 0 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: " ", size: 24 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: WORD_COLOR_SECTION, space: 8 } },
      spacing: { before: 400, after: 600 },
    }),
  ];

  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: section.label, bold: true, size: 32, color: WORD_COLOR_SECTION, font: WORD_FONT })],
        spacing: { before: 520, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DAE9F6", space: 6 } },
      })
    );

    const blocks = markdownToBlocks(section.content);
    const elements = createDocxElements(blocks);
    children.push(...elements);
  }

  const footerParagraph = new Paragraph({
    children: [
      new TextRun({ text: "Academik — ", size: 16, color: WORD_COLOR_MUTED, font: WORD_FONT }),
      new TextRun({ text: "academik.fr", size: 16, color: WORD_COLOR_SECTION, font: WORD_FONT }),
      new TextRun({ text: "   |   Page ", size: 16, color: WORD_COLOR_MUTED, font: WORD_FONT }),
      new PageNumber({ style: NumberFormat.DECIMAL }),
    ],
    alignment: AlignmentType.CENTER,
  });

  const headerParagraph = new Paragraph({
    children: [
      new TextRun({ text: title, size: 16, color: WORD_COLOR_MUTED, font: WORD_FONT, italics: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0", space: 6 } },
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "academik-numbering",
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1701 },
          size: { width: 11906, height: 16838 },
        },
      },
      headers: {
        default: new Header({ children: [headerParagraph] }),
      },
      footers: {
        default: new Footer({ children: [footerParagraph] }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
