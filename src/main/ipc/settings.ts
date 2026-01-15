import { ipcMain } from 'electron'
import { getSettings, saveSettings } from '../services/core/settings'
import { getPresetsForProfile, LifeBlockId } from '../services/core/presets'
import { getDefaultRules } from '../config/defaultRules'
import { replaceRules } from '../db/rules'

export function registerSettingsHandlers(): void {
  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  ipcMain.handle('save-settings', (_, settings) => {
    return saveSettings(settings)
  })

  ipcMain.handle('settings:save-presets', (_, blockIds: LifeBlockId[]) => {
    const currentSettings = getSettings()
    const newRules = getPresetsForProfile(blockIds)

    // Merge rules: Keep existing rules unless they are replaced by new presets (same ID)
    // Actually, maybe we want to keep User customizations?
    // But this is "Applying Presets".
    // Strategy: Filter out any existing rule that has the same ID as a new rule, then append new rules.
    const existingRules = currentSettings.rules.filter(
      (existing) => !newRules.some((newR) => newR.id === existing.id)
    )

    const mergedRules = [...existingRules, ...newRules]

    return saveSettings({
      ...currentSettings,
      rules: mergedRules,
      firstRun: false // Implicitly finish onboarding
    })
  })

  ipcMain.handle('settings:reset-rules', () => {
    const defaults = getDefaultRules()
    replaceRules(defaults)
    return getSettings()
  })
}
