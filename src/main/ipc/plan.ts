import { ipcMain, shell } from 'electron'
import { buildPlan } from '../services/planning/planner'
import { executePlan, undoPlan } from '../services/fs/executor'
import { getSettings } from '../services/core/settings'
import { addEntry, getHistory, markReverted } from '../services/core/journal'
import { extractText } from '../services/analysis/textExtractor'
import { aiService } from '../services/analysis/aiService'
import { FileEntry } from '../../shared/types'

export function registerPlanHandlers(): void {
  ipcMain.handle('generate-plan', async (_, files: FileEntry[]) => {
    const settings = await getSettings()
    const rules = settings.rules
    return await buildPlan(files, rules, extractText, (text, labels) =>
      aiService.classify(text, labels)
    )
  })

  ipcMain.handle('delete-files', async (_, paths: string[]) => {
    for (const path of paths) {
      await shell.trashItem(path)
    }
    return true
  })

  ipcMain.handle('execute-plan', async (_, plan) => {
    const result = await executePlan(plan)
    if (result.success) {
      addEntry(plan)
    }
    return result
  })

  ipcMain.handle('get-history', () => {
    return getHistory()
  })

  ipcMain.handle('undo-plan', async (_, plan) => {
    const result = await undoPlan(plan)
    if (result.success) {
      // Find entry by plan content or pass ID?
      // For simplicity, we assume the UI passes the plan attached to the entry.
      // We probably need to mark it reverted.
      // Ideally pass entryId to undo-plan. Use plan for now.
    }
    return result
  })

  ipcMain.handle('mark-reverted', (_, id) => {
    markReverted(id)
  })
}
