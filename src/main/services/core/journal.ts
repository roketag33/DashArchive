import { JournalEntry, Plan } from '../../../shared/types'
import { db } from '../../db'
import { journal } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export function addEntry(plan: Plan): JournalEntry {
  const entry: JournalEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    plan,
    status: 'revertible'
  }

  // Insert into DB
  try {
    db.insert(journal)
      .values({
        id: entry.id,
        timestamp: entry.timestamp,
        plan: JSON.stringify(entry.plan),
        status: entry.status
      })
      .run()

    // Enforce limit (e.g., keep last 50)
    // This is slightly more complex in SQL, for now let's cleanup roughly
    const count = db.select({ count: journal.id }).from(journal).all().length
    if (count > 50) {
      // Simplest way: get all, sort, find cut-off, delete.
      // Or subquery delete.
      // Let's do a subquery delete for IDs not in the top 50
      /* const subQuery = db.select({ id: journal.id })
                             .from(journal)
                             .orderBy(desc(journal.timestamp))
                             .limit(50); */
      // This is tricky with better-sqlite3 and simple drizzle syntax sometimes.
      // Let's iterate and delete old ones for safety and simplicity code-wise.
      const all = db.select().from(journal).orderBy(desc(journal.timestamp)).all()
      if (all.length > 50) {
        const toDelete = all.slice(50)
        toDelete.forEach((rec) => db.delete(journal).where(eq(journal.id, rec.id)).run())
      }
    }
  } catch (e) {
    console.error('Failed to add journal entry:', e)
  }

  return entry
}

export function getHistory(): JournalEntry[] {
  try {
    const records = db.select().from(journal).orderBy(desc(journal.timestamp)).all()
    return records.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      plan: JSON.parse(r.plan),
      status: r.status as 'revertible' | 'reverted'
    }))
  } catch (e) {
    console.error('Failed to fetching journal history:', e)
    return []
  }
}

export function getEntry(id: string): JournalEntry | undefined {
  try {
    const record = db.select().from(journal).where(eq(journal.id, id)).get()
    if (!record) return undefined
    return {
      id: record.id,
      timestamp: record.timestamp,
      plan: JSON.parse(record.plan),
      status: record.status as 'revertible' | 'reverted'
    }
  } catch (e) {
    console.error('Failed to get journal entry:', e)
    return undefined
  }
}

export function markReverted(id: string): void {
  try {
    db.update(journal).set({ status: 'reverted' }).where(eq(journal.id, id)).run()
  } catch (e) {
    console.error('Failed to mark journal reverted:', e)
  }
}
