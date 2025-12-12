import Store from 'electron-store'
import { AppSettings, Rule } from '../../../shared/types'
import { getDefaultRules } from '../../config/defaultRules'
import { ruleRepository } from '../../repositories/RuleRepository'

// Remove rules from defaults managed by electron-store
const defaults: Omit<AppSettings, 'rules'> = {
  theme: 'light',
  language: 'en',
  firstRun: true
}

const store = new Store<AppSettings>({
  // @ts-ignore - Partial defaults verify against full type, but we handle rules separately
  defaults,
  name: 'user-preferences'
})

export async function getSettings(): Promise<AppSettings> {
  const [dbRules, storedRules] = await Promise.all([
    ruleRepository.getAll(),
    store.get('rules') as Rule[] | undefined
  ])

  // Migration Check: If DB is empty but Store has rules, migrate them.
  // This happens once.
  let rules = dbRules
  if (rules.length === 0 && storedRules && storedRules.length > 0) {
    console.log('Migrating rules from electron-store to SQLite...')
    await ruleRepository.saveAll(storedRules)
    rules = await ruleRepository.getAll()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.delete('rules' as any) // Cleanup store
  } else if (rules.length === 0 && (!storedRules || storedRules.length === 0)) {
    // First run (fresh): Insert default rules into DB
    const defaults = getDefaultRules()
    await ruleRepository.saveAll(defaults)
    rules = await ruleRepository.getAll()
  }

  return {
    rules, // From DB
    theme: store.get('theme'),
    language: store.get('language'),
    firstRun: store.get('firstRun')
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  if (settings.rules) {
    // We assume the verified UI sends the full list or we handle updates.
    // However, repository.saveAll does "upsert".
    // If user DELETED a rule in UI, saveAll won't delete it from DB if we just upsert.
    // Ideally the UI sends the full state.
    // For "sync" behavior:
    // 1. Get all current DB IDs.
    // 2. Compare with incoming IDs.
    // 3. Delete missing, Upsert present.
    // BUT checking `saveSettings` usage: mostly used for saving ALL settings.

    // Let's implement robust sync:
    const incomingIds = new Set(settings.rules.map((r) => r.id))
    const currentRules = await ruleRepository.getAll()
    const deleteIds = currentRules.filter((r) => !incomingIds.has(r.id)).map((r) => r.id)

    // Delete removed
    for (const id of deleteIds) {
      await ruleRepository.delete(id)
    }

    // Upsert others
    await ruleRepository.saveAll(settings.rules)
  }

  if (settings.theme) store.set('theme', settings.theme)
  if (settings.language) store.set('language', settings.language)
  if (settings.firstRun !== undefined) store.set('firstRun', settings.firstRun)

  return getSettings()
}
