import { ipcMain, app } from 'electron'
import { runUniversalScan } from '../services/core/universal-scanner'
import { executePlan } from '../services/fs/executor'
import { addEntry } from '../services/core/journal'
import { incrementFilesOrganized } from '../services/core/stats'
import { notificationService } from '../services/core/notifications'
import type { UniversalScanResult, Plan, PlanItem } from '../../shared/types'
import path from 'path'
import log from 'electron-log'

export function registerUniversalHandlers(): void {
  ipcMain.handle('universal:scan', async (_, directories: string[]) => {
    try {
      log.info('[Universal Scan] Starting scan for directories:', directories)
      const result = await runUniversalScan(directories)
      log.info('[Universal Scan] Completed. Stats:', result.stats)
      return result
    } catch (error) {
      log.error('[Universal Scan] Failed:', error)
      throw error
    }
  })

  ipcMain.handle('universal:apply', async (_, result: UniversalScanResult) => {
    try {
      log.info('[Universal Apply] Starting execution for', result.totalDetected, 'files')

      const homeDir = app.getPath('home')

      // Convert to Plan
      const items: PlanItem[] = result.moves.map((move, idx) => {
        // Resolve target folder to absolute path relative to Home
        const absoluteTargetFolder = path.isAbsolute(move.targetFolder)
          ? move.targetFolder
          : path.join(homeDir, move.targetFolder)

        return {
          id: `universal-${Date.now()}-${idx}`,
          file: move.file,
          ruleId: move.ruleId,
          destinationPath: path.join(absoluteTargetFolder, move.file.name),
          status: 'ok',
          labelColor: 'none'
        }
      })

      const plan: Plan = {
        items,
        totalFiles: items.length,
        timestamp: new Date()
      }

      const executionResult = await executePlan(plan)

      if (executionResult.success && executionResult.processed > 0) {
        addEntry(plan)
        await incrementFilesOrganized(executionResult.processed)

        notificationService.send({
          title: 'Classement terminé',
          body: `${executionResult.processed} fichiers ont été rangés via Ghost Mode.`
        })
      }

      return executionResult
    } catch (error) {
      log.error('[Universal Apply] Failed:', error)
      throw error
    }
  })
}
