import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addEntry, markReverted, getEntry } from './journal'
import { Plan } from '../../../shared/types'
import { db } from '../../db'

// Mock database
vi.mock('../../db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Journal Manager', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  const mockPlan: Plan = {
    items: [],
    totalFiles: 0,
    timestamp: new Date()
  }

  it('should add an entry', () => {
    // Mock successful insert
    const mockRun = vi.fn()
    // @ts-ignore - Mocking complex Drizzle types
    db.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ run: mockRun }) })
    // Mock count check (active rules / journal count)
    // @ts-ignore - Mocking complex Drizzle types
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) })
    })

    const entry = addEntry(mockPlan)
    expect(entry.id).toBeDefined()
    expect(entry.status).toBe('revertible')
    expect(db.insert).toHaveBeenCalled()
  })

  it('should cleanup old entries if history > 50', () => {
    const mockRun = vi.fn()
    // @ts-ignore - Mocking complex Drizzle types
    db.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ run: mockRun }) })

    // Mock having 55 items
    const manyItems = Array(55).fill({ id: 'old', timestamp: 0 })
    // @ts-ignore - Mocking complex Drizzle types
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          // Add orderBy mock for correct chain
          all: vi.fn().mockReturnValue(manyItems)
        }),
        all: vi.fn().mockReturnValue(manyItems) // Fallback if no orderBy called
      })
    })

    // Mock delete
    // @ts-ignore - Mocking complex Drizzle types
    db.delete.mockReturnValue({ where: vi.fn().mockReturnValue({ run: mockRun }) })

    addEntry(mockPlan)

    // Should verify we tried to delete
    expect(db.delete).toHaveBeenCalled()
  })

  it('should retrieve specific entry', () => {
    const mockRecord = {
      id: '123',
      timestamp: 1000,
      plan: JSON.stringify(mockPlan),
      status: 'revertible'
    }

    // @ts-ignore - Mocking complex Drizzle types
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue(mockRecord)
        })
      })
    })

    const found = getEntry('123')
    expect(found).toEqual({
      id: '123',
      timestamp: 1000,
      plan: JSON.parse(mockRecord.plan),
      status: 'revertible'
    })
  })

  it('should mark entry as reverted', () => {
    const mockRun = vi.fn()
    // @ts-ignore - Mocking complex Drizzle types
    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          run: mockRun
        })
      })
    })

    markReverted('123')
    expect(db.update).toHaveBeenCalled()
  })
})
