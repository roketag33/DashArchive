import { ipcMain, shell } from 'electron'
import { buildPlan } from '../../shared/planner'
import { executePlan, undoPlan } from '../executor'
import { getSettings, saveSettings } from '../settings'
import { addEntry, getHistory, markReverted } from '../journal'
import { extractText } from '../textExtractor'
import { aiService } from '../aiService'
import { FileEntry } from '../../shared/types'

export function registerPlanHandlers(): void {
  ipcMain.handle('generate-plan', async (_, files: FileEntry[]) => {
    const rules = getSettings().rules
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

  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  ipcMain.handle('save-settings', (_, settings) => {
    return saveSettings(settings)
  })
}
