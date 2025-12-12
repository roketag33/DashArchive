import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executePlan } from './executor'
import { Plan, FileEntry } from '../../../shared/types'
import * as fs from 'fs/promises'
import { getSettings } from '../core/settings'

// Mock dependencies
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp')
  }
}))
vi.mock('fs/promises')
vi.mock('../core/settings')
vi.mock('../../db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Executor Service - Conflict Resolution', () => {
  const mockFile: FileEntry = {
    path: '/src/file.txt',
    name: 'file.txt',
    extension: 'txt',
    isDirectory: false,
    size: 100,
    createdAt: new Date(),
    modifiedAt: new Date(),
    category: 'document'
  }

  const mockPlan: Plan = {
    totalFiles: 1,
    timestamp: new Date(),
    items: [
      {
        id: '1',
        file: mockFile,
        ruleId: 'rule1',
        destinationPath: '/dest/file.txt',
        status: 'ok'
      }
    ]
  }

  beforeEach(() => {
    vi.resetAllMocks()
    // Default: fs.rename resolves (success)
    vi.mocked(fs.rename).mockResolvedValue(undefined)
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
  })

  it('should OVERWRITE if strategy is "overwrite"', async () => {
    vi.mocked(getSettings).mockReturnValue({
      conflictResolution: 'overwrite',
      rules: [],
      theme: 'light',
      language: 'en',
      firstRun: false
    })

    // Mock that destination exists (access succeeds)
    vi.mocked(fs.access).mockResolvedValue(undefined)

    const result = await executePlan(mockPlan)

    expect(result.success).toBe(true)
    expect(result.processed).toBe(1)
    expect(fs.rename).toHaveBeenCalledWith('/src/file.txt', '/dest/file.txt')
  })

  it('should SKIP if strategy is "skip"', async () => {
    vi.mocked(getSettings).mockReturnValue({
      conflictResolution: 'skip',
      rules: [],
      theme: 'light',
      language: 'en',
      firstRun: false
    })

    // Mock that destination exists
    vi.mocked(fs.access).mockResolvedValue(undefined)

    const result = await executePlan(mockPlan)

    expect(result.success).toBe(true)
    expect(result.processed).toBe(0) // Skipped count as processed? Or effectively ignored?
    // Usually skipped means "handled but done nothing". Let's check logic.
    // If skipped, we might confusingly return processed=0 or success=true.
    // Ideally processed=1 but "skipped". For MVP, let's say "processed" means moved.
    // If we skip, we literally do nothing.
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should RENAME if strategy is "rename"', async () => {
    vi.mocked(getSettings).mockReturnValue({
      conflictResolution: 'rename',
      rules: [],
      theme: 'light',
      language: 'en',
      firstRun: false
    })

    // Mock that destination exists
    vi.mocked(fs.access)
      .mockResolvedValueOnce(undefined) // executor check: /dest/file.txt exists
      .mockResolvedValueOnce(undefined) // getUniquePath check 1: /dest/file.txt exists
      .mockRejectedValueOnce(new Error('ENOENT')) // getUniquePath check 2: /dest/file (1).txt does NOT exist

    const result = await executePlan(mockPlan)

    expect(result.success).toBe(true)
    // Should have renamed to ... (1).txt
    expect(fs.rename).toHaveBeenCalledWith('/src/file.txt', '/dest/file (1).txt')
  })

  it('should handle normal move if no conflict', async () => {
    vi.mocked(getSettings).mockReturnValue({
      conflictResolution: 'skip', // Strategy shouldn't matter if no conflict
      rules: [],
      theme: 'light',
      language: 'en',
      firstRun: false
    })

    // Mock dest does NOT exist
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))

    await executePlan(mockPlan)

    expect(fs.rename).toHaveBeenCalledWith('/src/file.txt', '/dest/file.txt')
  })
})
