import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import {
  getAllWorkspaces,
  saveWorkspace,
  deleteWorkspace,
  clearAllLocalData,
} from '../../lib/db/indexedDB';
import { SavedWorkspace, ValidationProfile } from '../../lib/types/jwt';

interface WorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentToken: string;
  currentProfile: ValidationProfile;
  onLoadWorkspace: (token: string, profile: ValidationProfile) => void;
}

export const WorkspaceDrawer: React.FC<WorkspaceDrawerProps> = ({
  isOpen,
  onClose,
  currentToken,
  currentProfile,
  onLoadWorkspace,
}) => {
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadList = async () => {
    try {
      const list = await getAllWorkspaces();
      setWorkspaces(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error('Failed to load workspaces from IndexedDB:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen]);

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    if (!currentToken.trim()) {
      setMessage('Cannot save empty token workspace.');
      return;
    }

    try {
      await saveWorkspace({
        name: newWorkspaceName.trim(),
        token: currentToken,
        profile: currentProfile,
        notes: saveNotes.trim(),
      });
      setNewWorkspaceName('');
      setSaveNotes('');
      setShowSaveForm(false);
      setMessage('Workspace saved locally in IndexedDB.');
      await loadList();
    } catch (err) {
      setMessage(`Save failed: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkspace(id);
      await loadList();
      setMessage('Workspace deleted.');
    } catch (err) {
      setMessage(`Delete failed: ${(err as Error).message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllLocalData();
      await loadList();
      setShowConfirmClearAll(false);
      setMessage('All local workspace data cleared permanently.');
    } catch (err) {
      setMessage(`Clear failed: ${(err as Error).message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--card-bg-elevated)] border-l border-[var(--card-border)] h-full flex flex-col shadow-2xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4 mb-4">
          <div className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
              <FolderLock className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <span>Local Workspaces</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)]/40 transition-colors cursor-pointer"
            aria-label="Close Workspaces Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 mb-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5 font-[family-name:var(--font-display)]">Privacy Notice</span>
            Workspaces are saved strictly to your browser's local IndexedDB database. Never persist live production keys or shared secrets.
          </div>
        </div>

        {message && (
          <div className="bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-[var(--accent)] p-2.5 rounded-lg text-xs mb-4 flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[var(--accent)] hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {!showSaveForm ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent)] hover:opacity-90 text-slate-950 rounded-lg font-bold text-xs shadow-md shadow-cyan-500/20 mb-4 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current Workbench State</span>
          </button>
        ) : (
          <form
            onSubmit={handleSaveCurrent}
            className="bg-[var(--background)]/80 p-4 rounded-xl border border-[var(--card-border)] space-y-3 mb-4 text-xs"
          >
            <h4 className="font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
              Save New Workspace
            </h4>
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Auth Service Dev Token"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Testing HS256 algorithm validation"
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-slate-950 font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Save Local Workspace
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {workspaces.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-xs flex flex-col items-center gap-2">
              <HardDrive className="w-8 h-8 stroke-1 text-[var(--text-muted)]" />
              <span>No saved workspaces in IndexedDB.</span>
            </div>
          ) : (
            workspaces.map((ws) => (
              <div
                key={ws.id}
                className="p-3.5 rounded-xl bg-[var(--background)]/80 border border-[var(--card-border)] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
                      {ws.name}
                    </h5>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Saved {new Date(ws.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {ws.notes && (
                  <p className="text-[var(--text-secondary)] text-[11px] italic">
                    &ldquo;{ws.notes}&rdquo;
                  </p>
                )}

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      onLoadWorkspace(ws.token, ws.profile);
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] rounded-lg text-xs transition-all font-semibold border border-[var(--card-border)] cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Load into Workbench</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {workspaces.length > 0 && (
          <div className="pt-4 border-t border-[var(--card-border)] mt-4">
            {!showConfirmClearAll ? (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Clear All Local Saved Data
              </button>
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-rose-400 block font-[family-name:var(--font-display)]">
                  Permanently delete all saved workspaces?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Yes, Clear Data
                  </button>
                  <button
                    onClick={() => setShowConfirmClearAll(false)}
                    className="px-3 py-1.5 bg-[var(--card-bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg border border-[var(--card-border)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

