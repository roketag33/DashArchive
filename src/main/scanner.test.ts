import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scanDirectory } from './scanner'
import * as fs from 'fs/promises'
import * as path from 'path'

vi.mock('fs/promises')

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
    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any)
    // Mock stat
    vi.mocked(fs.stat).mockResolvedValue(mockStats as any)

    const result = await scanDirectory('/test/dir')

    expect(result).toHaveLength(2)

    expect(result[0]).toEqual({
      path: path.normalize('/test/dir/file1.txt'), // Normalize for OS specific separators
      name: 'file1.txt',
      extension: 'txt',
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

    vi.mocked(fs.readdir).mockImplementation(async (dirPath) => {
      if (dirPath.toString().endsWith('sub')) return subDirents as any
      return rootDirents as any
    })
    vi.mocked(fs.stat).mockResolvedValue({
      size: 500,
      birthtime: new Date(),
      mtime: new Date()
    } as any)

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

    vi.mocked(fs.readdir).mockResolvedValue(dirents as any)
    vi.mocked(fs.stat).mockResolvedValue({ size: 100, birthtime: new Date(), mtime: new Date() } as any)

    const result = await scanDirectory('/root')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('visible.txt')
  })
})
