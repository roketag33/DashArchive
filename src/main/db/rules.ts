import { db } from './index'
import { rules, RuleRecord } from './schema'
import { Rule } from '../../shared/types'
// Helper to convert DB record to App Rule type
function toRule(record: RuleRecord): Rule {
  return {
    id: record.id,
    type: record.type as Rule['type'],
    extensions: record.extensions ? JSON.parse(record.extensions as string) : undefined,
    namePattern: record.namePattern || undefined,
    sizeMin: record.sizeMin || undefined,
    sizeMax: record.sizeMax || undefined,
    categories: record.categories ? JSON.parse(record.categories as string) : undefined,
    ageDays: record.ageDays || undefined,
    aiPrompts: record.aiPrompts ? JSON.parse(record.aiPrompts as string) : undefined,
    description: record.description || undefined,
    name: record.name || undefined,
    isActive: record.isActive || false,
    priority: record.priority,
    destination: record.destination
  }
}

// Helper to convert App Rule type to DB record
function toRecord(rule: Rule): RuleRecord {
  return {
    id: rule.id,
    type: rule.type,
    extensions: rule.extensions ? JSON.stringify(rule.extensions) : null,
    namePattern: rule.namePattern || null,
    sizeMin: rule.sizeMin || null,
    sizeMax: rule.sizeMax || null,
    categories: rule.categories ? JSON.stringify(rule.categories) : null,
    ageDays: rule.ageDays || null,
    aiPrompts: rule.aiPrompts ? JSON.stringify(rule.aiPrompts) : null,
    description: rule.description || null,
    name: rule.name || null,
    isActive: rule.isActive,
    priority: rule.priority,
    destination: rule.destination
  }
}

export function getMyRules(): Rule[] {
  try {
    const records = db.select().from(rules).all()
    return records.map(toRule)
  } catch (error) {
    console.error('Failed to fetching rules:', error)
    return []
  }
}

export function saveRule(rule: Rule): void {
  const record = toRecord(rule)
  db.insert(rules).values(record).onConflictDoUpdate({ target: rules.id, set: record }).run()
}

export function replaceRules(newRules: Rule[]): void {
  // Transaction: delete all, insert all
  db.transaction(() => {
    db.delete(rules).run()
    if (newRules.length > 0) {
      // Drizzle insert many
      const records = newRules.map(toRecord)
      db.insert(rules).values(records).run()
    }
  })
}
