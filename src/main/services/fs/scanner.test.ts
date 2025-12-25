import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scanDirectory } from './scanner'
import * as fsPromises from 'fs/promises'
import * as fs from 'fs'
import * as path from 'path'

const mocks = vi.hoisted(() => ({
  readdir: vi.fn(),
  stat: vi.fn()
}))

vi.mock('fs/promises', () => ({
  readdir: mocks.readdir,
  stat: mocks.stat,
  default: {
    readdir: mocks.readdir,
    stat: mocks.stat
  }
}))

describe('Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should scan a directory and return file entries', async () => {
    const mockDirents = [
      { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
      { name: 'image.jpg', isDirectory: () => false, isFile: () => true }
    ]

    const mockStats = {
      size: 1024,
      birthtime: new Date('2023-01-01'),
      mtime: new Date('2023-01-02')
    }

    // Mock readdir
    mocks.readdir.mockResolvedValue(mockDirents)
    // Mock stat
    mocks.stat.mockResolvedValue(mockStats)

    const result = await scanDirectory('/test/dir')

    expect(result).toHaveLength(2)

    expect(result[0]).toEqual({
      path: path.normalize('/test/dir/file1.txt'), // Normalize for OS specific separators
      name: 'file1.txt',
      extension: 'txt',
      isDirectory: false,
      size: 1024,
      createdAt: mockStats.birthtime,
      modifiedAt: mockStats.mtime,
      category: 'document' // Classified via our logic
    })

    expect(result[1].category).toBe('image')
  })

  it('should recursively scan subdirectories', async () => {
    // Mock structure:
    // /root
    //   - file1.txt
    //   - /sub
    //     - file2.jpg

    const rootDirents = [
      { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
      { name: 'sub', isDirectory: () => true, isFile: () => false }
    ]

    const subDirents = [{ name: 'file2.jpg', isDirectory: () => false, isFile: () => true }]

    vi.mocked(fsPromises.readdir).mockImplementation(async (dirPath) => {
      if (dirPath.toString().endsWith('sub')) return subDirents as any // eslint-disable-line @typescript-eslint/no-explicit-any
      return rootDirents as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })
    vi.mocked(fsPromises.stat).mockResolvedValue({
      size: 500,
      birthtime: new Date(),
      mtime: new Date()
    } as unknown as fs.Stats)

    const result = await scanDirectory('/root')

    expect(result).toHaveLength(2)
    expect(result.map((f) => f.name).sort()).toEqual(['file1.txt', 'file2.jpg'])
  })

  it('should ignore hidden files/directories (starting with dot)', async () => {
    const dirents = [
      { name: '.hidden', isDirectory: () => false, isFile: () => true },
      { name: 'visible.txt', isDirectory: () => false, isFile: () => true },
      { name: '.git', isDirectory: () => true, isFile: () => false }
    ]

    vi.mocked(fsPromises.readdir).mockResolvedValue(dirents as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.mocked(fsPromises.stat).mockResolvedValue({
      size: 100,
      birthtime: new Date(),
      mtime: new Date()
    } as unknown as fs.Stats)

    const result = await scanDirectory('/root')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('visible.txt')
  })
})
