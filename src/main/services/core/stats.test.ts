import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '../../db/index'
import { getStats, incrementFilesOrganized, addSpaceSaved } from './stats'

// Mock database interactions
vi.mock('../../db/index', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn()
  }
}))

describe('Stats Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should get default stats if no records', async () => {
    // Mock empty result for both file/space stats and active rules
    const mockQueryBuilder = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue(undefined) // global_stats return undefined if not found
        })
      })
    }

    // @ts-ignore - Mocking complex Drizzle types
    db.select.mockReturnValue(mockQueryBuilder)

    const stats = await getStats()
    expect(stats.totalFiles).toBe(0)
    expect(stats.spaceSaved).toBe(0)
    expect(stats.activeRules).toBe(0)
  })

  it('should increment files organized count', async () => {
    // Mock existing value
    const mockRun = vi.fn()

    // We need to return a builder that handles both select (for getStats/check) and insert
    // But since we mock db.select and db.insert separately, it's fine.

    // @ts-ignore - Mocking complex Drizzle types
    db.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockReturnValue({
          run: mockRun
        })
      })
    })

    await incrementFilesOrganized(5)

    // We expect insert to be called to update 'filesOrganized'
    expect(db.insert).toHaveBeenCalled()
  })

  it('should add to space saved', async () => {
    const mockRun = vi.fn()

    // @ts-ignore - Mocking complex Drizzle types
    db.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockReturnValue({
          run: mockRun
        })
      })
    })

    await addSpaceSaved(1024)
    expect(db.insert).toHaveBeenCalled()
  })
})
