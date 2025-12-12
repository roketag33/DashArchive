import { ipcMain, shell } from 'electron'
import { buildPlan } from '../services/planning/planner'
import { executePlan, undoPlan } from '../services/fs/executor'
import { getSettings, saveSettings } from '../services/core/settings'
import { addEntry, getHistory, markReverted } from '../services/core/journal'
import { extractText } from '../services/analysis/textExtractor'
import { aiService } from '../services/analysis/aiService'
import { FileEntry } from '../../shared/types'

import { sendNotification } from '../services/core/notifications'
import { incrementFilesOrganized } from '../services/core/stats'

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
    if (result.success && result.processed > 0) {
      addEntry(plan)
      void incrementFilesOrganized(result.processed)

      const settings = getSettings()
      const lang = settings.language
      const title = lang === 'fr' ? 'Organisation terminée' : 'Organization Complete'
      const body =
        lang === 'fr'
          ? `${result.processed} fichiers organisés avec succès.`
          : `Successfully organized ${result.processed} files.`

      sendNotification(title, body)
    }
    return result
  })

  ipcMain.handle('get-history', () => {
    return getHistory()
  })

  ipcMain.handle(
    'undo-plan',
    async (_, { plan, entryId }: { plan: import('../../shared/types').Plan; entryId?: string }) => {
      // Legacy support: if arg is just plan (no entryId property checks, but strict typing helps)
      // Actually renderer sends one object. If we change signature, we must ensure renderer matches.
      const result = await undoPlan(plan)
      if (result.success && entryId) {
        markReverted(entryId)
      }
      return result
    }
  )

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
