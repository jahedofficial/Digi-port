import PDFDocument from 'pdfkit';
import { IPdfGenerator, ReportDocument } from './types';

/**
 * Production-Grade PDF Generator using PDFKit
 */
export class PdfGenerator implements IPdfGenerator {
  public async generatePdf(report: ReportDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // 1. Header & Title
        doc.fontSize(20).font('Helvetica-Bold').text(report.title, { underline: true });
        doc.moveDown(0.5);

        // Metadata
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Client ID: ${report.clientId} | Generated: ${new Date(report.generatedAt).toISOString().split('T')[0]}`
          );
        doc.text(
          `Date Range: ${report.dateRange.startDate} to ${report.dateRange.endDate} | Platforms: ${report.platforms.join(', ')}`
        );
        doc.moveDown(1);

        // 2. Scorecard Box
        doc
          .rect(40, doc.y, 515, 50)
          .fillAndStroke('#f0f4f8', '#0052cc');
        doc.fillColor('#0052cc').fontSize(14).font('Helvetica-Bold');
        doc.text(
          `Overall Score: ${report.scorecard.overallScore}/100 [Rating: ${report.scorecard.grade}]`,
          55,
          doc.y - 38
        );
        doc.moveDown(2);

        // 3. Executive Summary
        doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('1. Executive Summary');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(report.executiveSummaryEnglish, {
          align: 'justify',
          lineGap: 3,
        });
        doc.moveDown(1);

        // 4. Key Diagnostic Findings
        doc.fontSize(14).font('Helvetica-Bold').text('2. Key Diagnostic Findings');
        doc.moveDown(0.5);
        if (report.findings.length === 0) {
          doc.fontSize(10).font('Helvetica-Oblique').text('No critical issues detected.');
        } else {
          for (const finding of report.findings.slice(0, 5)) {
            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(`• [${finding.severity}] ${finding.title}`);
            doc.font('Helvetica').text(`  ${finding.description}`);
            doc.moveDown(0.3);
          }
        }
        doc.moveDown(1);

        // 5. Action Plan
        doc.fontSize(14).font('Helvetica-Bold').text('3. Recommended Action Plan');
        doc.moveDown(0.5);
        for (const item of report.actionPlan.slice(0, 5)) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`Step ${item.stepNumber}: ${item.title} (${item.platform}) [${item.priority}]`);
          doc.font('Helvetica').text(`Action: ${item.action}`);
          doc.moveDown(0.3);
        }

        // Finalize PDF
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
