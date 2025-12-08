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
  priority: number
  type: RuleType
  // Specific fields based on type (optional for now, can be refined with discriminated union later if needed)
  match?: string[] // for extension
  pattern?: string // for namePattern
  minBytes?: number // for size
  destination: string
}

export type PlanItemStatus = 'ok' | 'conflict' | 'ignored'

export interface PlanItem {
  id: string // unique operation id
  file: FileEntry
  destinationPath: string
  ruleId: string
  status: PlanItemStatus
}

export interface Plan {
  items: PlanItem[]
  totalFiles: number
  timestamp: Date
}
