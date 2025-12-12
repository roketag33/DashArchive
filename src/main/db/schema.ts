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
