import { FileEntry, Plan, ExecutionResult } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  scanFolder: (path: string) => Promise<FileEntry[]>
  generatePlan: (files: FileEntry[]) => Promise<Plan>
  executePlan: (plan: Plan) => Promise<ExecutionResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
