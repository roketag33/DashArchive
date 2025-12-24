import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  fs: {
    rename: vi.fn(),
    copyFile: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn()
  }
}))

vi.mock('fs/promises', () => mocks.fs)
vi.mock('../core/settings', () => ({
  getSettings: vi.fn().mockReturnValue({ conflictResolution: 'rename' })
}))
vi.mock('./tagger', () => ({
  taggerService: { setLabel: vi.fn() }
}))

import { executePlan } from './executor'
import { Plan } from '../../../shared/types'

describe('ExecutorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.fs.access.mockRejectedValue(new Error('ENOENT')) // Default: File does not exist
  })

  it('should handle EXDEV by copying and unlinking', async () => {
    // Simulate EXDEV on rename
    mocks.fs.rename.mockRejectedValueOnce({ code: 'EXDEV' })

    const plan: Plan = {
      items: [
        {
          id: '1',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: { path: '/vol1/source.txt' } as any,
          ruleId: 'r1',
          destinationPath: '/vol2/dest.txt',
          status: 'ok'
        }
      ],
      totalFiles: 1,
      timestamp: new Date()
    }

    const result = await executePlan(plan)

    if (!result.success) {
      console.error('Test failed with errors:', JSON.stringify(result.errors, null, 2))
    }

    expect(result.success).toBe(true)
    expect(mocks.fs.rename).toHaveBeenCalledWith('/vol1/source.txt', '/vol2/dest.txt')
    // Fallback triggered
    expect(mocks.fs.copyFile).toHaveBeenCalledWith('/vol1/source.txt', '/vol2/dest.txt')
    expect(mocks.fs.unlink).toHaveBeenCalledWith('/vol1/source.txt')
  })

  it('should throw real errors', async () => {
    mocks.fs.rename.mockRejectedValueOnce(new Error('EPERM'))

    const plan: Plan = {
      items: [
        {
          id: '2',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: { path: '/source.txt' } as any,
          ruleId: 'r1',
          destinationPath: '/dest.txt',
          status: 'ok'
        }
      ],
      totalFiles: 1,
      timestamp: new Date()
    }

    const result = await executePlan(plan)

    expect(result.success).toBe(false)
    expect(result.failed).toBe(1)
    expect(mocks.fs.copyFile).not.toHaveBeenCalled()
  })
})
