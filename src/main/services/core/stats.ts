import { db } from '../../db/index'
import { globalStats, folderRules } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

export interface DashboardStats {
  totalFiles: number
  spaceSaved: number
  activeRules: number
}

export async function getStats(): Promise<DashboardStats> {
  const fileStat = await db
    .select()
    .from(globalStats)
    .where(eq(globalStats.key, 'files_organized'))
    .get()
  const spaceStat = await db
    .select()
    .from(globalStats)
    .where(eq(globalStats.key, 'space_saved'))
    .get()

  // Count active rules across all folders
  const activeRulesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(folderRules)
    .where(eq(folderRules.isActive, true))
    .get()

  return {
    totalFiles: fileStat?.value || 0,
    spaceSaved: spaceStat?.value || 0,
    activeRules: activeRulesCount?.count || 0
  }
}

export async function incrementFilesOrganized(count: number): Promise<void> {
  await db
    .insert(globalStats)
    .values({
      key: 'files_organized',
      value: count,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: globalStats.key,
      set: {
        value: sql`${globalStats.value} + ${count}`,
        updatedAt: new Date()
      }
    })
    .run()
}

export async function addSpaceSaved(bytes: number): Promise<void> {
  await db
    .insert(globalStats)
    .values({
      key: 'space_saved',
      value: bytes,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: globalStats.key,
      set: {
        value: sql`${globalStats.value} + ${bytes}`,
        updatedAt: new Date()
      }
    })
    .run()
}
