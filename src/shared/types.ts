export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'dev'
  | 'executable'
  | 'other'

export interface FileEntry {
  path: string
  name: string
  extension: string
  size: number
  createdAt: Date
  modifiedAt: Date
  category: FileCategory
}

export type RuleType = 'extension' | 'namePattern' | 'size' | 'date' | 'category' | 'fallback'

export interface Rule {
  id: string
  type: 'extension' | 'name' | 'size' | 'date' | 'category' | 'fallback'
  extensions?: string[]
  namePattern?: string // Regex string
  sizeMin?: number
  sizeMax?: number
  categories?: FileCategory[]
  description?: string

  // UI related
  name?: string // User-friendly name
  isActive: boolean
  priority: number // Higher matches first

  // Action
  destination: string // Destination path template
}

export interface PlanItem {
  id: string
  file: FileEntry
  ruleId: string
  destinationPath: string
  status: 'ok' | 'conflict' | 'error'
  conflictOriginalPath?: string
  warning?: string
}

export interface Plan {
  items: PlanItem[]
  totalFiles: number
  timestamp: Date
}

export interface ExecutionResult {
  success: boolean
  processed: number
  failed: number
  errors: Array<{ file: string; error: string }>
}
