import { FileEntry, Plan, ExecutionResult, AppSettings } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  scanFolder: (path: string) => Promise<FileEntry[]>
  generatePlan: (files: FileEntry[]) => Promise<Plan>
  executePlan: (plan: Plan) => Promise<ExecutionResult>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
