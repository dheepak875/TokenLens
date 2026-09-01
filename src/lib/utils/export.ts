import { ParsedToken, SecurityReport, ValidationProfile } from '../types/jwt';
import { redactCompactToken, redactObject } from '../jwt/sensitive';

export function exportReportAsMarkdown(
  token: ParsedToken,
  report: SecurityReport,
  profile: ValidationProfile
): string {
  const lines: string[] = [];

  lines.push('# TokenLens Security Analysis Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Executive Summary');
  lines.push(`- **Signature Status**: ${report.signatureSummary}`);
  lines.push(`- **Claims Profile Status**: ${report.claimsProfileSummary}`);
  lines.push(`- **Findings Summary**: ${report.passCount} Pass, ${report.reviewCount} Review, ${report.warningCount} Warning`);
  lines.push('');

  lines.push('## Plain-English Explanation');
  lines.push(report.narrativeExplanation);
  lines.push('');

  lines.push('## Token Overview');
  lines.push(`- **Type**: ${token.type}`);
  lines.push(`- **Algorithm**: ${String(token.header.json?.alg || 'none')}`);
  lines.push(`- **Token Size**: ${token.sizeBytes} bytes`);
  lines.push(`- **Redacted Token**: \`${redactCompactToken(token.raw)}\``);
  lines.push('');

  lines.push('## Detailed Security Findings');
  lines.push('');

  for (const f of report.findings) {
    const badge =
      f.status === 'pass'
        ? '[PASS]'
        : f.status === 'review'
          ? '[REVIEW]'
          : f.status === 'warning'
            ? '[WARNING]'
            : '[CANNOT DETERMINE]';

    lines.push(`### ${badge} ${f.title}`);
    if (f.field) lines.push(`- **Field**: \`${f.field}\``);
    lines.push(`- **Status**: ${f.status.toUpperCase()}`);
    lines.push(`- **Explanation**: ${f.explanation}`);
    lines.push(`- **Why It Matters**: ${f.whyItMatters}`);
    lines.push(`- **Recommended Action**: ${f.recommendedAction}`);
    if (f.reference) {
      lines.push(`- **Reference**: [${f.reference.label}](${f.reference.url})`);
    }
    lines.push('');
  }

  lines.push('## Configured Validation Profile');
  lines.push(`- **Allowed Algorithms**: ${profile.allowedAlgorithms.length > 0 ? profile.allowedAlgorithms.join(', ') : 'None (Warning)'}`);
  lines.push(`- **Expected Issuer**: ${profile.expectedIssuer || '(Not set)'}`);
  lines.push(`- **Expected Audience**: ${profile.expectedAudience || '(Not set)'}`);
  lines.push(`- **Required Claims**: ${profile.requiredClaims.length > 0 ? profile.requiredClaims.join(', ') : 'None'}`);
  lines.push(`- **Clock Tolerance**: ${profile.clockToleranceSeconds} seconds`);
  lines.push('');

  lines.push('---');
  lines.push('*Report generated locally in browser by TokenLens. No data was transmitted.*');

  return lines.join('\n');
}

export function exportReportAsJson(
  token: ParsedToken,
  report: SecurityReport,
  profile: ValidationProfile
): string {
  const data = {
    meta: {
      tool: 'TokenLens',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      localProcessingOnly: true,
    },
    token: {
      type: token.type,
      sizeBytes: token.sizeBytes,
      redactedToken: redactCompactToken(token.raw),
      header: redactObject(token.header.json),
      payload: redactObject(token.payload.json),
    },
    validationProfile: profile,
    summary: {
      signatureStatus: report.signatureSummary,
      claimsProfileStatus: report.claimsProfileSummary,
      passCount: report.passCount,
      reviewCount: report.reviewCount,
      warningCount: report.warningCount,
      cannotDetermineCount: report.cannotDetermineCount,
    },
    narrativeExplanation: report.narrativeExplanation,
    findings: report.findings,
  };

  return JSON.stringify(data, null, 2);
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
