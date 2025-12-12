import { db } from '../../db/index'
import { settings } from '../../db/schema'
import { getMyRules, replaceRules } from '../../db/rules'
import { AppSettings } from '../../../shared/types'
import { getDefaultRules } from '../../config/defaultRules'
import { eq } from 'drizzle-orm'

// Helper to get a setting from DB
function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const record = db.select().from(settings).where(eq(settings.key, key)).get()
    return record ? JSON.parse(record.value) : defaultValue
  } catch (e) {
    console.error(`Failed to get setting ${key}:`, e)
    return defaultValue
  }
}

// Helper to set a setting in DB
function setSetting(key: string, value: unknown): void {
  try {
    db.insert(settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } })
      .run()
  } catch (e) {
    console.error(`Failed to set setting ${key}:`, e)
  }
}

export function migrateSettingsIfNeeded(): void {
  // Use a specific flag to track if we've seeded rules, rather than counting rules
  const initialized = getSetting('rulesInitialized', false)

  if (!initialized) {
    console.log('Initializing DB with default rules...')
    replaceRules(getDefaultRules())
    setSetting('rulesInitialized', true)

    // Initialize defaults for other settings if needed
    if (!getSetting('firstRun', false)) {
      setSetting('theme', 'light')
      setSetting('language', 'en')
      setSetting('firstRun', true)
    }

    console.log('Settings initialization complete.')
  }
}

export function getSettings(): AppSettings {
  return {
    rules: getMyRules(),
    theme: getSetting('theme', 'light'),
    language: getSetting('language', 'en'),
    firstRun: getSetting('firstRun', true) // Default to true if not found, but logic usually handles it
  }
}

export function saveSettings(newSettings: Partial<AppSettings>): AppSettings {
  if (newSettings.rules) replaceRules(newSettings.rules)
  if (newSettings.theme) setSetting('theme', newSettings.theme)
  if (newSettings.language) setSetting('language', newSettings.language)
  if (newSettings.firstRun !== undefined) setSetting('firstRun', newSettings.firstRun)

  return getSettings()
}
