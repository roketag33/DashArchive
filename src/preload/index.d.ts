import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  scanFolder: (path: string) => Promise<FileEntry[]>
  generatePlan: (files: FileEntry[]) => Promise<Plan>
  executePlan: (plan: Plan) => Promise<ExecutionResult>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getHistory: () => Promise<JournalEntry[]>
  undoPlan: (plan: Plan) => Promise<ExecutionResult>
  suggestAiCategories: (folderPath: string) => Promise<string[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
