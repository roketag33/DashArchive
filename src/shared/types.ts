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
  isDirectory: boolean
  size: number
  createdAt: Date
  modifiedAt: Date
  content?: string
  hash?: string
  category: FileCategory
  aiLabel?: string
}

export interface DuplicateGroup {
  hash: string
  size: number
  files: FileEntry[]
}

export type RuleType = 'extension' | 'name' | 'size' | 'date' | 'category' | 'ai' | 'fallback'

export interface Rule {
  id: string
  type: RuleType
  extensions?: string[]
  namePattern?: string // Regex string
  sizeMin?: number
  sizeMax?: number
  categories?: FileCategory[]
  ageDays?: number // For 'date' rules: older than X days
  aiPrompts?: string[] // For 'ai' rules: candidate labels or description
  description?: string

  // UI related
  name?: string // User-friendly name
  isActive: boolean
  priority: number // Higher matches first

  // OS Tagging
  labelColor?: 'none' | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'Gray'

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
  labelColor?: string
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
  errors: { file: string; error: string }[]
}

export interface Folder {
  id: string
  name: string
  path: string
  autoWatch: boolean
  scanFrequency?: string
  lastScan?: Date
  createdAt: Date
  updatedAt: Date
}

export type ConflictResolution = 'skip' | 'overwrite' | 'rename'

export interface AppSettings {
  rules: Rule[]
  theme: 'light' | 'dark'
  language: string
  firstRun: boolean
  conflictResolution: ConflictResolution
}

export interface JournalEntry {
  id: string
  timestamp: number
  plan: Plan
  status: 'revertible' | 'reverted'
}

export interface ProposedMove {
  file: FileEntry
  ruleId: string
  targetFolder: string
  label: string
}

export interface UniversalScanResult {
  stats: {
    [key: string]: number // ruleId -> count
  }
  moves: ProposedMove[]
  totalDetected: number
}
export interface LearningSuggestion {
  type: 'LEARNING_SUGGESTION'
  file: string // Name of the file moved
  extension: string // e.g., 'pdf'
  targetFolder: string // Absolute path
  suggestedRuleName: string
}

export type NotificationData = UniversalScanResult | LearningSuggestion
