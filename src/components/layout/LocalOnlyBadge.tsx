import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const LocalOnlyBadge: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer shrink-0 focus:outline-none"
        aria-label="100% Local Browser Sandbox"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap font-medium">100% Local Sandbox</span>
        <Info className="w-3 h-3 text-emerald-400/80 shrink-0" />
      </button>

      {showTooltip && (
        <div
          role="tooltip"
          className="absolute right-0 top-full mt-2 w-72 p-3.5 glass-dropdown rounded-xl z-50 animate-in fade-in slide-in-from-top-1"
        >
          <div className="flex items-center justify-between font-semibold text-emerald-400 mb-1.5 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Zero Network Exfiltration
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
            All JWT parsing, cryptographic signature verification, claim
            validation, and key operations execute locally inside your browser via Web Crypto APIs.
          </p>
          <div className="mt-2 pt-2 border-t border-[var(--card-border)] text-[10px] text-emerald-400/90 font-mono">
            No analytics &bull; No remote telemetry
          </div>
        </div>
      )}
    </div>
  );
};

