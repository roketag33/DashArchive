import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  path: text('path').notNull(),
  content: text('content'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
})

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert

export const rules = sqliteTable('rules', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'extension', 'name', etc.
  extensions: text('extensions', { mode: 'json' }), // JSON string for array
  namePattern: text('name_pattern'),
  sizeMin: integer('size_min'),
  sizeMax: integer('size_max'),
  categories: text('categories', { mode: 'json' }), // JSON string for array
  ageDays: integer('age_days'),
  aiPrompts: text('ai_prompts', { mode: 'json' }), // JSON string for array
  description: text('description'),
  name: text('name'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  priority: integer('priority').notNull().default(0),
  destination: text('destination').notNull()
})

export type RuleRecord = typeof rules.$inferSelect // Naming conflict with shared Rule type, using RuleRecord
export type NewRuleRecord = typeof rules.$inferInsert

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull() // JSON string
})

export const journal = sqliteTable('journal', {
  id: text('id').primaryKey(), // Using UUID string
  timestamp: integer('timestamp').notNull(),
  plan: text('plan').notNull(), // JSON string of Plan object
  status: text('status').notNull() // 'revertible' | 'reverted'
})

export type JournalRecord = typeof journal.$inferSelect
export type NewJournalRecord = typeof journal.$inferInsert

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  path: text('path').notNull(),
  autoWatch: integer('auto_watch', { mode: 'boolean' }).notNull().default(true),
  scanFrequency: text('scan_frequency'), // '15m', '1h', 'daily', etc.
  lastScan: integer('last_scan', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
})

export const folderRules = sqliteTable('folder_rules', {
  folderId: text('folder_id')
    .notNull()
    .references(() => folders.id, { onDelete: 'cascade' }),
  ruleId: text('rule_id')
    .notNull()
    .references(() => rules.id, { onDelete: 'cascade' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

export type FolderRecord = typeof folders.$inferSelect
export type NewFolderRecord = typeof folders.$inferInsert
export type FolderRuleRecord = typeof folderRules.$inferSelect

export const globalStats = sqliteTable('global_stats', {
  key: text('key').primaryKey(),
  value: integer('value').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
})

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(),
  hash: text('hash'),
  size: integer('size'),
  lastModified: integer('last_modified', { mode: 'timestamp' }),
  status: text('status').notNull().default('pending'), // 'pending', 'processed', 'ignored'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
})

export type FileRecord = typeof files.$inferSelect
export type NewFileRecord = typeof files.$inferInsert

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // 'add', 'change', 'unlink'
  path: text('path').notNull(),
  details: text('details', { mode: 'json' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(new Date())
})

export type EventRecord = typeof events.$inferSelect
export type NewEventRecord = typeof events.$inferInsert
