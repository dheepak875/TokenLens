import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Shield,
  Search,
  GitCompare,
  KeyRound,
  BookOpen,
  Info,
  FileText,
  Github,
  Sun,
  Moon,
  FolderLock,
  Menu,
  X,
} from 'lucide-react';
import { LocalOnlyBadge } from './LocalOnlyBadge';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  onOpenWorkspaceDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWorkspaceDrawer }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Workbench', icon: Search },
    { path: '/compare', label: 'Compare', icon: GitCompare },
    { path: '/generate', label: 'Generator', icon: KeyRound },
    { path: '/learn', label: 'Learn', icon: BookOpen },
    { path: '/privacy', label: 'Privacy', icon: Shield },
    { path: '/about', label: 'About', icon: Info },
    { path: '/docs', label: 'Docs', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Personal Hub Typography */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-all shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight font-[family-name:var(--font-display)] text-[var(--text-primary)]">
              Token<span className="text-[var(--accent)] font-extrabold">Lens</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[var(--card-border)] text-[var(--accent)] shadow-xs font-bold border border-[var(--card-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)]/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block shrink-0">
            <LocalOnlyBadge />
          </div>

          {/* Workspaces Drawer Toggle */}
          <button
            onClick={onOpenWorkspaceDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--card-bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] border border-[var(--card-border)] transition-all cursor-pointer"
            title="Saved Workspaces (IndexedDB)"
          >
            <FolderLock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden lg:inline">Workspaces</span>
          </button>

          {/* Direct Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/dheepak875/TokenLens"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="GitHub Repository"
            aria-label="TokenLens GitHub repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--card-border)] bg-[var(--card-bg-elevated)] px-4 pt-2 pb-4 space-y-1">
          <div className="pb-2">
            <LocalOnlyBadge />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--card-border)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--card-border)]/50 hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};


