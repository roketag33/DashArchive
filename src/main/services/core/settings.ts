import Store from 'electron-store'
import { AppSettings } from '../../../shared/types'
import { getDefaultRules } from '../../config/defaultRules'

// Define the schema or default values
const defaults: AppSettings = {
  rules: getDefaultRules(),
  theme: 'light',
  language: 'en',
  firstRun: true
}

const store = new Store<AppSettings>({
  defaults,
  name: 'user-preferences'
})

export function getSettings(): AppSettings {
  return {
    rules: store.get('rules'),
    theme: store.get('theme'),
    language: store.get('language'),
    firstRun: store.get('firstRun')
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  if (settings.rules) store.set('rules', settings.rules)
  if (settings.theme) store.set('theme', settings.theme)
  if (settings.language) store.set('language', settings.language)
  if (settings.firstRun !== undefined) store.set('firstRun', settings.firstRun)

  return getSettings()
}
