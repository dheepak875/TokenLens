import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  FindingStatus,
  ParsedToken,
  SecurityReport,
  ValidationProfile,
} from '../../lib/types/jwt';
import {
  downloadFile,
  exportReportAsJson,
  exportReportAsMarkdown,
} from '../../lib/utils/export';

interface SecurityReportPanelProps {
  parsedToken: ParsedToken;
  report: SecurityReport;
  profile: ValidationProfile;
}

export const SecurityReportPanel: React.FC<SecurityReportPanelProps> = ({
  parsedToken,
  report,
  profile,
}) => {
  const handleExportMarkdown = () => {
    const content = exportReportAsMarkdown(parsedToken, report, profile);
    downloadFile('tokenlens-security-report.md', content, 'text/markdown');
  };

  const handleExportJson = () => {
    const content = exportReportAsJson(parsedToken, report, profile);
    downloadFile('tokenlens-security-report.json', content, 'application/json');
  };

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'pass':
        return (
          <span className="pill-badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> PASS
          </span>
        );
      case 'review':
        return (
          <span className="pill-badge bg-sky-500/10 text-sky-700 dark:text-cyan-400 border border-sky-500/30 text-[10px] font-bold">
            <Info className="w-3 h-3 text-sky-600 dark:text-cyan-400" /> REVIEW
          </span>
        );
      case 'warning':
        return (
          <span className="pill-badge bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> WARNING
          </span>
        );
      case 'cannot_determine':
        return (
          <span className="pill-badge bg-[var(--card-border)] text-[var(--text-muted)] border border-[var(--card-border)] text-[10px] font-bold">
            <HelpCircle className="w-3 h-3" /> CANNOT DETERMINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Summary Card */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
            <ShieldAlert className="w-4 h-4 text-[var(--accent)]" />
            Security & Compliance Audit
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] text-[11px] font-medium transition-all border border-[var(--card-border)] cursor-pointer"
            >
              <Download className="w-3 h-3 text-[var(--accent)]" />
              Markdown
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] text-[11px] font-medium transition-all border border-[var(--card-border)] cursor-pointer"
            >
              <Download className="w-3 h-3 text-[var(--accent)]" />
              JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">
              Pass Checks
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-display)]">
              {report.passCount}
            </span>
          </div>

          <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">
              Review Items
            </span>
            <span className="text-xl font-extrabold text-sky-600 dark:text-[var(--accent)] font-[family-name:var(--font-display)]">
              {report.reviewCount}
            </span>
          </div>

          <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">
              Warnings
            </span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-[family-name:var(--font-display)]">
              {report.warningCount}
            </span>
          </div>

          <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">
              Signature Proof
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)] block truncate mt-1">
              {report.signatureSummary}
            </span>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1 font-[family-name:var(--font-display)]">
          RFC 8725 & OWASP Rule Audits ({report.findings.length})
        </h4>

        {report.findings.map((f) => (
          <div
            key={f.id}
            className={`p-4 rounded-xl border space-y-2 text-xs transition-all ${
              f.status === 'warning'
                ? 'bg-amber-500/5 border-amber-500/30'
                : f.status === 'review'
                  ? 'glass-card'
                  : f.status === 'pass'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'glass-card'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)] text-sm">{f.title}</h5>
                  {f.field && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--background)]/80 text-[var(--accent)] font-mono text-[10px] border border-[var(--card-border)]">
                      {f.field}
                    </span>
                  )}
                </div>
              </div>
              <div>{getStatusBadge(f.status)}</div>
            </div>

            <p className="text-[var(--text-secondary)] leading-relaxed">{f.explanation}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
                <span className="font-semibold text-[var(--text-muted)] block mb-0.5">
                  Why it matters:
                </span>
                <span className="text-[var(--text-secondary)] leading-relaxed">
                  {f.whyItMatters}
                </span>
              </div>
              <div className="bg-[var(--card-bg-elevated)] p-2.5 rounded-lg border border-[var(--card-border)]">
                <span className="font-semibold text-[var(--text-muted)] block mb-0.5">
                  Recommended action:
                </span>
                <span className="text-[var(--text-secondary)] leading-relaxed">
                  {f.recommendedAction}
                </span>
              </div>
            </div>

            {f.reference && (
              <div className="pt-1 text-[11px]">
                <a
                  href={f.reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium"
                >
                  <span>Ref: {f.reference.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

