import { ipcMain } from 'electron'
import { getSettings, saveSettings } from '../services/core/settings'
import { AppSettings } from '../../shared/types'

export function registerSettingsHandlers(): void {
  ipcMain.handle('get-settings', async () => {
    return await getSettings()
  })

  ipcMain.handle('save-settings', async (_, settings: Partial<AppSettings>) => {
    return await saveSettings(settings)
  })
}
