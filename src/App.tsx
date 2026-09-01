import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WorkspaceDrawer } from './components/workspace/WorkspaceDrawer';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { ComparePage } from './pages/ComparePage';
import { GeneratePage } from './pages/GeneratePage';
import { LearnPage } from './pages/LearnPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';
import { DocsPage } from './pages/DocsPage';
import { ValidationProfile } from './lib/types/jwt';

const MainLayout: React.FC = () => {
  const [workspaceDrawerOpen, setWorkspaceDrawerOpen] = useState(false);
  const [loadedToken, setLoadedToken] = useState<string | undefined>(undefined);
  const [loadedProfile, setLoadedProfile] = useState<ValidationProfile | undefined>(
    undefined
  );

  const location = useLocation();

  // If token was passed via navigation state (e.g. from Generator)
  const navToken = location.state && (location.state as { token?: string }).token;
  const activeToken = navToken || loadedToken || '';

  const handleLoadWorkspace = (token: string, profile: ValidationProfile) => {
    setLoadedToken(token);
    setLoadedProfile(profile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors relative selection:bg-[var(--primary-glow)] selection:text-[var(--accent)]">
      {/* Ambient Radial Mesh Gradient Layer matching Personal Hub */}
      <div className="bg-mesh" aria-hidden="true" />

      <Navbar onOpenWorkspaceDrawer={() => setWorkspaceDrawerOpen(true)} />

      <main className="flex-1 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <WorkbenchPage
                key={activeToken}
                initialToken={activeToken}
                initialProfile={loadedProfile}
              />
            }
          />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>

      <Footer />

      <WorkspaceDrawer
        isOpen={workspaceDrawerOpen}
        onClose={() => setWorkspaceDrawerOpen(false)}
        currentToken={activeToken}
        currentProfile={
          loadedProfile || {
            allowedAlgorithms: [],
            expectedIssuer: '',
            expectedAudience: '',
            requiredClaims: [],
            clockToleranceSeconds: 0,
            currentDifferenceSeconds: 0,
            nowOverrideTimestamp: null,
            redactSensitive: true,
          }
        }
        onLoadWorkspace={handleLoadWorkspace}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
