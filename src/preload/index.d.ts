import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry, Rule } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  openFile: () => Promise<string[]>
  scanFolder: (pathOrId: string | { path?: string; id?: string }) => Promise<FileEntry[]>
  generatePlan: (files: FileEntry[]) => Promise<Plan>
  executePlan: (plan: Plan) => Promise<ExecutionResult>
  getSettings: () => Promise<AppSettings>
  getRules: () => Promise<Rule[]>
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getHistory: () => Promise<JournalEntry[]>
  undoPlan: (plan: Plan, entryId?: string) => Promise<ExecutionResult>
  suggestAiCategories: (path: string) => Promise<string[]>
  markReverted: (id: string) => Promise<void>
  deleteFiles: (paths: string[]) => Promise<void>
  findDuplicates: (files: FileEntry[]) => Promise<FileEntry[][]>
  startWatcher: (path: string) => Promise<void>
  stopWatcher: () => Promise<void>
  onFileAdded: (callback: (path: string) => void) => void
  processDroppedFiles: (paths: string[]) => Promise<void>
  searchSemantic(query: string): Promise<any[]> // eslint-disable-line @typescript-eslint/no-explicit-any
  showInFolder: (path: string) => Promise<void>
  removeFileAddedListener: () => void

  // Folders
  getFolders: () => Promise<import('./shared/types').Folder[]>
  addFolder: (
    folder: Omit<import('./shared/types').Folder, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<import('./shared/types').Folder>
  updateFolder: (id: string, updates: Partial<import('./shared/types').Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  getFolderRules: (folderId: string) => Promise<import('./shared/types').Rule[]>
  setFolderRules: (folderId: string, ruleIds: string[]) => Promise<void>

  // Stats
  getStats: () => Promise<import('./main/services/core/stats').GlobalStats>

  // Vault
  vault: {
    unlock: (password: string) => Promise<boolean>
    lock: () => Promise<void>
    getStatus: () => Promise<boolean>
    encryptFile: (source: string, dest: string) => Promise<{ success: boolean }>
    decryptFile: (source: string, dest: string) => Promise<{ success: boolean }>
  }
  // Explicit Context API
  readFiles: (paths: string[]) => Promise<{ path: string; name: string; content: string }[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
