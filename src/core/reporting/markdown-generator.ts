import { IMarkdownGenerator, ReportDocument } from './types';

/**
 * High-End Markdown Report Generator
 * Formats report documents into rich GitHub-flavored markdown with alerts, tables, and structured sections.
 */
export class MarkdownGenerator implements IMarkdownGenerator {
  public generateMarkdown(report: ReportDocument): string {
    const lines: string[] = [];

    // Header & Meta
    lines.push(`# ${report.title}`);
    lines.push(`**Client ID:** \`${report.clientId}\` | **Generated:** ${new Date(report.generatedAt).toISOString().split('T')[0]} | **Date Range:** ${report.dateRange.startDate} to ${report.dateRange.endDate}`);
    lines.push(`**Platforms Covered:** ${report.platforms.join(', ')}`);
    lines.push('\n---\n');

    // Section 1: Executive Summary & Overall Scorecard
    lines.push(`## 1. Executive Summary & Health Scorecard`);
    lines.push(`> [!NOTE]`);
    lines.push(`> **Overall Performance Score:** **${report.scorecard.overallScore}/100** [Rating: **${report.scorecard.grade}**]`);

    lines.push('\n### English Executive Brief');
    lines.push(report.executiveSummaryEnglish);

    lines.push('\n### বাংলা সারসংক্ষেপ (Bengali Executive Brief)');
    lines.push(report.executiveSummaryBangla);

    // Dimension Scorecard Table
    lines.push('\n### Diagnostic Dimension Breakdown');
    lines.push('| Dimension | Score | Weight | Status | Target Benchmark |');
    lines.push('|---|---|---|---|---|');
    for (const [dim, details] of Object.entries(report.scorecard.dimensionScores)) {
      lines.push(
        `| **${dim}** | ${details.score}/100 | ${(details.weight * 100).toFixed(0)}% | \`${details.status}\` | ${details.benchmark} |`
      );
    }

    // Section 2: Key Findings
    lines.push('\n## 2. Key Diagnostic Findings');
    if (report.findings.length === 0) {
      lines.push('*No negative findings observed; performance parameters within standard deviation.*');
    } else {
      lines.push('| Category | Title | Severity | Impact / Diagnostic Observation |');
      lines.push('|---|---|---|---|');
      for (const finding of report.findings) {
        lines.push(
          `| ${finding.category} | **${finding.title}** | \`${finding.severity}\` | ${finding.description} |`
        );
      }
    }

    // Section 3: Issues
    lines.push('\n## 3. Critical Issues & Spend Inefficiencies');
    if (report.issues.length === 0) {
      lines.push('*Zero critical budget bleeders or severe bottlenecks identified.*');
    } else {
      for (const issue of report.issues) {
        lines.push(`- ⚠️ ${issue}`);
      }
    }

    // Section 4: Prioritized Recommendations
    lines.push('\n## 4. Prioritized Recommendations');
    if (report.recommendations.length === 0) {
      lines.push('*Maintain active campaign parameters and monitor pacing.*');
    } else {
      for (const rec of report.recommendations) {
        if (typeof rec === 'string') {
          lines.push(`- 💡 ${rec}`);
        } else {
          lines.push(`- **[${rec.priority}] ${rec.title}** (${rec.platform})`);
          lines.push(`  - *Action:* Change from \`${rec.currentValue}\` to \`${rec.recommendedValue}\``);
          lines.push(`  - *Impact:* ${rec.explanationEnglish}`);
        }
      }
    }

    // Section 5: Priority Matrix
    lines.push('\n## 5. Strategic Priority Matrix');
    lines.push('| Priority Tier | Operational Directive & Scope |');
    lines.push('|---|---|');
    for (const pm of report.priorityMatrix) {
      lines.push(`| **${pm.priority}** | ${pm.items.join('; ')} |`);
    }

    // Section 6: Action Plan
    lines.push('\n## 6. Implementation Action Plan');
    if (report.actionPlan.length === 0) {
      lines.push('*No immediate actions required.*');
    } else {
      lines.push('| Step # | Action Item | Platform | Priority | Expected Outcome |');
      lines.push('|---|---|---|---|---|');
      for (const item of report.actionPlan) {
        lines.push(
          `| Step ${item.stepNumber} | **${item.title}** | ${item.platform} | \`${item.priority}\` | ${item.expectedResult} |`
        );
      }
    }

    // Section 7: Supporting Evidence
    lines.push('\n## 7. Supporting Evidence & Metric Snapshots');
    lines.push('```json');
    lines.push(JSON.stringify(report.supportingEvidence, null, 2));
    lines.push('```');

    // Section 8: Appendix
    lines.push('\n## 8. Appendix & Technical Disclosures');
    lines.push('- **Attribution Window:** Platform standard (7-day click, 1-day view where applicable).');
    lines.push('- **Currency:** USD.');
    lines.push('- **Governance Standard:** DigiPort Universal Paid Media AI Operating System (Phase 12 Compliance).');

    return lines.join('\n');
  }
}
