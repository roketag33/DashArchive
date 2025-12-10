import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executePlan } from './executor'
import * as fs from 'fs/promises'
import { Plan, FileEntry } from '../../../shared/types'
import * as path from 'path'

vi.mock('fs/promises')

describe('Executor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute a plan by moving files', async () => {
    const mockPlan: Plan = {
      items: [
        {
          id: '1',
          file: { path: '/src/file1.jpg', name: 'file1.jpg' } as unknown as FileEntry,
          ruleId: 'r1',
          destinationPath: '/dest/file1.jpg',
          status: 'ok'
        },
        {
          id: '2',
          file: { path: '/src/file2.doc', name: 'file2.doc' } as unknown as FileEntry,
          ruleId: 'r2',
          destinationPath: '/dest/docs/file2.doc',
          status: 'ok'
        }
      ],
      totalFiles: 2,
      timestamp: new Date()
    }

    // Mock mkdir and rename
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    const result = await executePlan(mockPlan)

    expect(result.success).toBe(true)
    expect(result.processed).toBe(2)
    expect(result.errors).toHaveLength(0)

    // Verify mkdir called for directories
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname('/dest/file1.jpg'), { recursive: true })
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname('/dest/docs/file2.doc'), { recursive: true })

    // Verify rename called
    expect(fs.rename).toHaveBeenCalledWith('/src/file1.jpg', '/dest/file1.jpg')
    expect(fs.rename).toHaveBeenCalledWith('/src/file2.doc', '/dest/docs/file2.doc')
  })

  it('should report errors for individual failures but continue', async () => {
    const mockPlan: Plan = {
      items: [
        {
          id: '1',
          file: { path: '/src/bad.jpg', name: 'bad.jpg' } as unknown as FileEntry,
          ruleId: 'r1',
          destinationPath: '/dest/bad.jpg',
          status: 'ok'
        },
        {
          id: '2',
          file: { path: '/src/good.jpg', name: 'good.jpg' } as unknown as FileEntry,
          ruleId: 'r1',
          destinationPath: '/dest/good.jpg',
          status: 'ok'
        }
      ],
      totalFiles: 2,
      timestamp: new Date()
    }

    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockImplementation(async (src) => {
      if (src === '/src/bad.jpg') throw new Error('Permission denied')
      return undefined
    })

    const result = await executePlan(mockPlan)

    expect(result.success).toBe(false) // Overall success false if any error? Or partial?
    // Let's define: success = true if ALL succeed. execution result should have details.

    expect(result.processed).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].file).toBe('/src/bad.jpg')
  })

  it('should undo a plan by moving files back', async () => {
    const mockPlan: Plan = {
      items: [
        {
          id: '1',
          file: { path: '/src/file1.jpg', name: 'file1.jpg' } as unknown as FileEntry,
          ruleId: 'r1',
          destinationPath: '/dest/file1.jpg',
          status: 'ok'
        }
      ],
      totalFiles: 1,
      timestamp: new Date()
    }

    // Mock undo
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    const { undoPlan } = await import('./executor') // Re-import to get the new function if needed
    const result = await undoPlan(mockPlan)

    expect(result.success).toBe(true)
    expect(result.processed).toBe(1)

    // Verify reverse move
    expect(fs.rename).toHaveBeenCalledWith('/dest/file1.jpg', '/src/file1.jpg')
  })
})
