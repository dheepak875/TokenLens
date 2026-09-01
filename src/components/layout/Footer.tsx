import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileCode2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-md py-8 text-xs text-[var(--text-secondary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Shield className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-[family-name:var(--font-display)]">TokenLens Workbench</span>
          </div>
          <span className="hidden sm:inline text-[var(--text-muted)]">|</span>
          <p className="text-[var(--text-secondary)]">
            Zero-trust client-side JWT security inspector & validator.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[var(--text-secondary)] font-medium">
          <Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">
            Privacy & Threat Model
          </Link>
          <Link to="/docs" className="hover:text-[var(--accent)] transition-colors">
            Local Docs
          </Link>
          <Link to="/about" className="hover:text-[var(--accent)] transition-colors">
            About
          </Link>
          <a
            href="https://datatracker.ietf.org/doc/html/rfc8725"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
          >
            <span>RFC 8725</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/dheepak875/TokenLens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>MIT License</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

