import { getFolders, updateFolder, getFolderRules } from '../../db/folders'
import { scanDirectory } from '../fs/scanner'
import { buildPlan } from '../planning/planner'
import { executePlan } from '../fs/executor'
import { addEntry } from './journal'
import { Folder } from '../../../shared/types'
import { getSettings } from './settings'
import { extractText } from '../analysis/textExtractor'
import { aiService } from '../analysis/aiService'
import { sendNotification } from './notifications'

class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    // Optional: Auto-start?
  }

  public init(): void {
    this.refreshSchedules()
  }

  public refreshSchedules(): void {
    this.stopAll()
    const folders = getFolders()
    folders.forEach((folder) => {
      if (folder.scanFrequency) {
        this.scheduleFolder(folder)
      }
    })
  }

  private stopAll(): void {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
  }

  public scheduleFolder(folder: Folder): void {
    if (!folder.scanFrequency) return

    const ms = this.parseFrequency(folder.scanFrequency)
    if (ms <= 0) return

    console.log(`[Scheduler] Scheduling ${folder.name} every ${folder.scanFrequency} (${ms}ms)`)

    const interval = setInterval(() => {
      this.runJob(folder)
    }, ms)

    this.intervals.set(folder.id, interval)
  }

  private parseFrequency(freq: string): number {
    if (freq === '15m') return 15 * 60 * 1000
    if (freq === '30m') return 30 * 60 * 1000
    if (freq === '1h') return 60 * 60 * 1000
    if (freq === 'daily') return 24 * 60 * 60 * 1000
    return 0
  }

  private async runJob(folder: Folder): Promise<void> {
    console.log(`[Scheduler] Running job for ${folder.name}`)
    try {
      // 1. Scan
      const files = await scanDirectory(folder.path)
      if (files.length === 0) return

      // 2. Get Rules
      // Need helper to get rules for this folder + default rules logic?
      // Planner expects Rule[]
      // We have folder-specific rules in DB.
      // Current planner logic uses global rules passed from UI usually.
      // But now we need to fetch them.
      // Assuming getFolderRules returns Rule[]? NO, ipc/folders.ts says it returns string[] (IDs).
      // We need to fetch full rules.

      // Let's rely on a helper or fetch all rules and filter?
      // For now, let's grab global settings rules as basic fallback or mixed?
      // Task 25 (getFolderRules) returns IDs.
      // We need a way to resolved IDs to Rule objects.

      const allRules = getSettings().rules
      const folderRuleIds = await getFolderRules(folder.id)
      // folderRuleIds is Promise<string[]> ? NO, ipc calls it async, but db might be synchronous?
      // Checked db/folders.ts? waiting for view_file result.

      // Assuming we get IDs, filter allRules
      const activeRules = allRules.filter((r) => folderRuleIds.includes(r.id))

      // If no folder-specific rules, maybe use all? Or none?
      // Usually "Enable Folder Rules" implies specific ones.
      // If list empty, do nothing?
      if (activeRules.length === 0) {
        // Maybe fallback to all global rules if no specific ones set?
        // Or just log "No rules for folder"
        return
      }

      // 3. Build Plan
      const plan = await buildPlan(files, activeRules, extractText, (t, l) =>
        aiService.classify(t, l)
      )

      if (plan.items.length === 0) return

      // 4. Execute
      const result = await executePlan(plan)

      // 5. Update Last Scan
      updateFolder(folder.id, { lastScan: new Date() })

      // 6. Notify/Log
      if (result.success && result.processed > 0) {
        addEntry(plan)
        sendNotification(`Scheduled Scan: ${folder.name}`, `Organized ${result.processed} files.`)
      }
    } catch (e) {
      console.error(`[Scheduler] Job failed for ${folder.id}`, e)
    }
  }
}

export const schedulerService = new SchedulerService()
