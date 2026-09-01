import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SavedWorkspace } from '../types/jwt';

interface TokenLensDB extends DBSchema {
  workspaces: {
    key: string;
    value: SavedWorkspace;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'tokenlens_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TokenLensDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TokenLensDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TokenLensDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('workspaces', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export async function saveWorkspace(
  workspace: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }
): Promise<SavedWorkspace> {
  const db = await getDB();
  const now = Date.now();
  const id = workspace.id || `ws_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const saved: SavedWorkspace = {
    id,
    name: workspace.name,
    token: workspace.token,
    profile: workspace.profile,
    notes: workspace.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.put('workspaces', saved);
  return saved;
}

export async function getAllWorkspaces(): Promise<SavedWorkspace[]> {
  const db = await getDB();
  return db.getAllFromIndex('workspaces', 'by-updated');
}

export async function deleteWorkspace(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workspaces', id);
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  await db.clear('workspaces');
}
