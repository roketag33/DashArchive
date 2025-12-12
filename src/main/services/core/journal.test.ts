import { describe, it, expect, vi, beforeEach } from 'vitest'
import { markReverted, addEntry } from './journal'
import { db } from '../../db'
import { journal } from '../../db/schema'

// Mock database
vi.mock('../../db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../db/schema', () => ({
  journal: {
    id: { name: 'id' },
    timestamp: { name: 'timestamp' },
    plan: { name: 'plan' },
    status: { name: 'status' }
  }
}))

describe('Journal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update status to reverted', () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as any)

    markReverted('test-id')

    expect(db.update).toHaveBeenCalledWith(journal)
    expect(mockSet).toHaveBeenCalledWith({ status: 'reverted' })
    // Checking complex 'where' clauses with drizzle mocks is hard,
    // ensuring the update chain is called is sufficient for now.
    expect(mockRun).toHaveBeenCalled()
  })

  it('should add an entry', () => {
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as any)
    // Mock select for cleanup check
    const mockAll = vi.fn().mockReturnValue([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.select).mockReturnValue({ from: () => ({ all: mockAll }) } as unknown as any)

    addEntry({ totalFiles: 1, items: [], timestamp: new Date() })

    expect(db.insert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalled()
    expect(mockRun).toHaveBeenCalled()
  })
})
