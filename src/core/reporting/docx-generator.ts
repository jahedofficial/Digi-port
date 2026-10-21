import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { IDocxGenerator, ReportDocument } from './types';

/**
 * Production-Grade DOCX Generator using docx library
 */
export class DocxGenerator implements IDocxGenerator {
  public async generateDocx(report: ReportDocument): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        text: report.title,
        heading: HeadingLevel.TITLE,
      })
    );

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Client ID: ${report.clientId} | Generated: ${new Date(report.generatedAt).toISOString().split('T')[0]} | Date Range: ${report.dateRange.startDate} to ${report.dateRange.endDate}`,
            bold: true,
            color: '555555',
          }),
        ],
      })
    );
    children.push(new Paragraph({ text: '' })); // Spacing

    // 1. Executive Summary
    children.push(
      new Paragraph({
        text: '1. Executive Summary',
        heading: HeadingLevel.HEADING_1,
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Overall Health Score: ${report.scorecard.overallScore}/100 [Rating: ${report.scorecard.grade}]`,
            bold: true,
            color: '0052cc',
          }),
        ],
      })
    );
    children.push(
      new Paragraph({
        text: report.executiveSummaryEnglish,
      })
    );
    children.push(new Paragraph({ text: '' }));

    // 2. Findings Table
    children.push(
      new Paragraph({
        text: '2. Diagnostic Findings',
        heading: HeadingLevel.HEADING_1,
      })
    );

    const findingRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Title', bold: true })] })],
            width: { size: 35, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity', bold: true })] })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Impact', bold: true })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    for (const f of report.findings.slice(0, 10)) {
      findingRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: f.category })] }),
            new TableCell({ children: [new Paragraph({ text: f.title })] }),
            new TableCell({ children: [new Paragraph({ text: f.severity })] }),
            new TableCell({ children: [new Paragraph({ text: f.description })] }),
          ],
        })
      );
    }

    children.push(
      new Table({
        rows: findingRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    children.push(new Paragraph({ text: '' }));

    // 3. Action Plan
    children.push(
      new Paragraph({
        text: '3. Implementation Action Plan',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const item of report.actionPlan) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Step ${item.stepNumber}: ${item.title} (${item.platform}) [${item.priority}] - `,
              bold: true,
            }),
            new TextRun({ text: item.action }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    return Packer.toBuffer(doc);
  }
}
