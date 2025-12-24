// Mock electron before imports
vi.mock('electron', () => ({
  app: { getPath: vi.fn().mockReturnValue('/tmp') },
  ipcMain: { handle: vi.fn() }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { schedulerService } from './scheduler'
import * as foldersDb from '../../db/folders'
import { Folder } from '../../../shared/types'
import { scanDirectory } from '../fs/scanner'

// Mock dependencies
vi.mock('./journal', () => ({
  addEntry: vi.fn()
}))
vi.mock('../../db/folders', () => ({
  getFolders: vi.fn(),
  updateFolder: vi.fn(),
  getFolderRules: vi.fn()
}))

vi.mock('../fs/scanner', () => ({
  scanDirectory: vi.fn()
}))

vi.mock('../planning/planner', () => ({
  buildPlan: vi.fn()
}))

vi.mock('../fs/executor', () => ({
  executePlan: vi.fn()
}))

vi.mock('./settings', () => ({
  getSettings: vi.fn()
}))

describe('SchedulerService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // Default mock return
    vi.mocked(scanDirectory).mockResolvedValue([])
    vi.mocked(foldersDb.getFolderRules).mockReturnValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should schedule recurring jobs', async () => {
    const mockFolders: Folder[] = [
      {
        id: '1',
        name: 'Test',
        path: '/tmp/test',
        autoWatch: false,
        scanFrequency: '1h',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    vi.mocked(foldersDb.getFolders).mockReturnValue(mockFolders)
    vi.mocked(scanDirectory).mockResolvedValue([])

    schedulerService.init()

    expect(foldersDb.getFolders).toHaveBeenCalled()

    // 1 hour
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(scanDirectory).toHaveBeenCalled()
  })

  it('should not schedule if no frequency', async () => {
    const mockFolders: Folder[] = [
      {
        id: '2',
        name: 'NoFreq',
        path: '/tmp',
        autoWatch: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    vi.mocked(foldersDb.getFolders).mockReturnValue(mockFolders)
    schedulerService.init()

    await vi.advanceTimersByTimeAsync(999999)
    expect(scanDirectory).not.toHaveBeenCalled()
  })
})
