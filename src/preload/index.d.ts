import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  scanFolder: (pathOrId: string | { path?: string, id?: string }) => Promise<FileEntry[]>
  generatePlan: (files: FileEntry[]) => Promise<Plan>
  executePlan: (plan: Plan) => Promise<ExecutionResult>
  getSettings: () => Promise<AppSettings>
  getRules: () => Promise<import('../shared/types').Rule[]>
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getHistory: () => Promise<JournalEntry[]>
  undoPlan: (plan: Plan) => Promise<ExecutionResult>
  suggestAiCategories: (folderPath: string) => Promise<string[]>
  findDuplicates: (
    files: import('../shared/types').FileEntry[]
  ) => Promise<import('../shared/types').DuplicateGroup[]>
  deleteFiles: (paths: string[]) => Promise<boolean>
  markReverted: (id: string) => Promise<void>
  startWatcher: (path: string) => Promise<void>
  stopWatcher: () => Promise<void>
  onFileAdded: (callback: (path: string) => void) => void
  removeFileAddedListener: () => void

  // Folders
  getFolders: () => Promise<import('../shared/types').Folder[]>
  addFolder: (folder: { name: string; path: string; autoWatch: boolean }) => Promise<import('../shared/types').Folder>
  updateFolder: (id: string, updates: Partial<import('../shared/types').Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  getFolderRules: (folderId: string) => Promise<string[]>
  setFolderRules: (folderId: string, ruleIds: string[]) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
