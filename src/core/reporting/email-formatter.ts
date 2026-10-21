import { IEmailFormatter, ReportDocument } from './types';

/**
 * Production-Grade HTML Email Report Formatter
 * Generates responsive, beautifully styled HTML email reports with inline CSS.
 */
export class EmailFormatter implements IEmailFormatter {
  public formatEmailHtml(report: ReportDocument): string {
    const scoreColor =
      report.scorecard.overallScore >= 85
        ? '#10b981'
        : report.scorecard.overallScore >= 70
          ? '#3b82f6'
          : report.scorecard.overallScore >= 50
            ? '#f59e0b'
            : '#ef4444';

    const findingsRows = report.findings
      .slice(0, 8)
      .map((f) => {
        const severityBg =
          f.severity === 'CRITICAL'
            ? '#fee2e2; color: #991b1b;'
            : f.severity === 'HIGH'
              ? '#ffedd5; color: #9a3412;'
              : f.severity === 'MEDIUM'
                ? '#fef3c7; color: #92400e;'
                : '#e0f2fe; color: #075985;';

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111827;">${f.category}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #1f2937;">
            <strong>${f.title}</strong><br/>
            <span style="font-size: 12px; color: #4b5563;">${f.description}</span>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${severityBg}">${f.severity}</span>
          </td>
        </tr>`;
      })
      .join('');

    const scorecardRows = Object.entries(report.scorecard.dimensionScores)
      .map(([dim, details]) => {
        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 12px; font-size: 13px; font-weight: 600; color: #374151;">${dim}</td>
          <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #111827;">${details.score}/100</td>
          <td style="padding: 8px 12px; font-size: 12px; color: #6b7280;">${(details.weight * 100).toFixed(0)}%</td>
          <td style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: #2563eb;">${details.status}</td>
        </tr>`;
      })
      .join('');

    const actionPlanRows = report.actionPlan
      .slice(0, 6)
      .map((item) => {
        const priorityColor =
          item.priority === 'P0'
            ? '#ef4444'
            : item.priority === 'P1'
              ? '#f59e0b'
              : item.priority === 'P2'
                ? '#3b82f6'
                : '#6b7280';

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: ${priorityColor};">
            [${item.priority}] Step ${item.stepNumber}
          </td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827;">
            <strong>${item.title}</strong> (${item.platform})<br/>
            <span style="font-size: 12px; color: #4b5563;">${item.action}</span>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #059669; font-weight: 500;">
            ${item.expectedResult}
          </td>
        </tr>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #38bdf8; margin-bottom: 6px;">DIGIPORT AI OPERATING SYSTEM</div>
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #ffffff;">${report.title}</h1>
              <div style="font-size: 13px; color: #94a3b8;">
                Client: <strong>${report.clientId}</strong> &bull; Date Range: <strong>${report.dateRange.startDate} &rarr; ${report.dateRange.endDate}</strong> &bull; Channels: <strong>${report.platforms.join(', ')}</strong>
              </div>
            </td>
          </tr>

          <!-- Scorecard Banner -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: #64748b;">Overall Account Health Score</div>
                    <div style="font-size: 28px; font-weight: 800; color: ${scoreColor}; margin-top: 4px;">
                      ${report.scorecard.overallScore}/100 <span style="font-size: 16px; font-weight: 600;">(${report.scorecard.grade})</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Summary -->
          <tr>
            <td style="padding: 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Executive Brief</h2>
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #334155;">${report.executiveSummaryEnglish}</p>
              <div style="padding: 12px 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #166534;">
                <strong>বাংলা সারসংক্ষেপ:</strong> ${report.executiveSummaryBangla}
              </div>
            </td>
          </tr>

          <!-- Dimension Breakdown -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">2. Health Dimension Breakdown</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Dimension</th>
                    <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Score</th>
                    <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Weight</th>
                    <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${scorecardRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Findings Table -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">3. Key Diagnostic Findings</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Category</th>
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Finding & Impact</th>
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: center; color: #4b5563;">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  ${findingsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Action Plan -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">4. Recommended Implementation Action Plan</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Priority</th>
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Action Item</th>
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: left; color: #4b5563;">Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${actionPlanRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 32px; color: #94a3b8; font-size: 12px; text-align: center;">
              Generated automatically by <strong>DigiPort Universal Paid Media AI Operating System</strong>.<br/>
              Report ID: <code>${report.id}</code> &bull; Generated: ${new Date(report.generatedAt).toUTCString()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
