import Store from 'electron-store'
import { JournalEntry, Plan } from '../../shared/types'

interface JournalStore {
  history: JournalEntry[]
}

const store = new Store<JournalStore>({
  defaults: { history: [] },
  name: 'organization-journal'
})

export function addEntry(plan: Plan): JournalEntry {
  const entry: JournalEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    plan,
    status: 'revertible'
  }

  const history = getHistory()
  history.unshift(entry) // Add to beginning
  // Limit history size? Let's keep 50 for now
  if (history.length > 50) history.pop()

  store.set('history', history)
  return entry
}

export function getHistory(): JournalEntry[] {
  return store.get('history') || []
}

export function getEntry(id: string): JournalEntry | undefined {
  return getHistory().find((e) => e.id === id)
}

export function markReverted(id: string): void {
  const history = getHistory()
  const index = history.findIndex((e) => e.id === id)
  if (index !== -1) {
    history[index].status = 'reverted'
    store.set('history', history)
  }
}
