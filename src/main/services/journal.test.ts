import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addEntry, getHistory, markReverted, getEntry } from './journal'
import { Plan } from '../../shared/types'

// Mock electron-store
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStore = new Map<string, any>()
vi.mock('electron-store', () => {
  return {
    default: class Store {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      get(key: string) {
        return mockStore.get(key)
      }
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
      set(key: string, val: any) {
        mockStore.set(key, val)
      }
    }
  }
})

describe('Journal Manager', () => {
  beforeEach(() => {
    mockStore.clear()
  })

  const mockPlan: Plan = {
    items: [],
    totalFiles: 0,
    timestamp: new Date()
  }

  it('should add an entry', () => {
    const entry = addEntry(mockPlan)
    expect(entry.id).toBeDefined()
    expect(entry.status).toBe('revertible')

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toEqual(entry)
  })

  it('should limit history size', () => {
    for (let i = 0; i < 60; i++) {
      addEntry(mockPlan)
    }
    expect(getHistory()).toHaveLength(50)
  })

  it('should retrieve specific entry', () => {
    const entry = addEntry(mockPlan)
    const found = getEntry(entry.id)
    expect(found).toEqual(entry)
  })

  it('should mark entry as reverted', () => {
    const entry = addEntry(mockPlan)
    markReverted(entry.id)
    const updated = getEntry(entry.id)
    expect(updated?.status).toBe('reverted')
  })
})
