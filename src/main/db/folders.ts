import { db } from './index';
import { folders, folderRules, FolderRecord } from './schema';
import { eq, and } from 'drizzle-orm';

export interface Folder {
  id: string;
  name: string;
  path: string;
  autoWatch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toFolder(record: FolderRecord): Folder {
  return {
    id: record.id,
    name: record.name,
    path: record.path,
    autoWatch: record.autoWatch || false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function getFolders(): Folder[] {
  try {
    const records = db.select().from(folders).all();
    return records.map(toFolder);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return [];
  }
}

export function getFolder(id: string): Folder | undefined {
  try {
    const record = db.select().from(folders).where(eq(folders.id, id)).get();
    return record ? toFolder(record) : undefined;
  } catch (error) {
    console.error('Failed to fetch folder:', error);
    return undefined;
  }
}

export function addFolder(folder: Omit<Folder, 'createdAt' | 'updatedAt'>): Folder {
  const newFolder = {
    ...folder,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.insert(folders).values(newFolder).run();
  return newFolder;
}

export function updateFolder(id: string, updates: Partial<Folder>): void {
  db.update(folders)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(folders.id, id))
    .run();
}

export function deleteFolder(id: string): void {
  db.delete(folders).where(eq(folders.id, id)).run();
}

export function getFolderRules(folderId: string): string[] {
  // Returns rule IDs active for this folder
  try {
    const records = db.select().from(folderRules).where(and(eq(folderRules.folderId, folderId), eq(folderRules.isActive, true))).all();
    return records.map(r => r.ruleId);
  } catch (error) {
      console.error('Failed to fetch folder rules:', error);
      return [];
  }
}

export function setFolderRules(folderId: string, ruleIds: string[]): void {
  db.transaction(() => {
    // Clear existing
    db.delete(folderRules).where(eq(folderRules.folderId, folderId)).run();
    
    // Insert new
    if (ruleIds.length > 0) {
        const values = ruleIds.map(ruleId => ({
            folderId,
            ruleId,
            isActive: true
        }));
        db.insert(folderRules).values(values).run();
    }
  });
}
