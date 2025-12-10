import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { join } from 'path'
import * as fs from 'fs/promises'
import { calculateFileHash, findDuplicates } from './hashService'
import { FileEntry } from '../../../shared/types'

const TEST_DIR = join(__dirname, '../../test_duplicates')

describe('hashService', () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true })
    // Create test files
    await fs.writeFile(join(TEST_DIR, 'file1.txt'), 'Content A')
    await fs.writeFile(join(TEST_DIR, 'file2.txt'), 'Content A') // Duplicate of file1
    await fs.writeFile(join(TEST_DIR, 'file3.txt'), 'Content B') // Different content, same size (maybe)
    await fs.writeFile(join(TEST_DIR, 'file4.txt'), 'Content C is longer') // Different size
  })

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true })
  })

  it('should calculate correct hash', async () => {
    const hash1 = await calculateFileHash(join(TEST_DIR, 'file1.txt'))
    const hash2 = await calculateFileHash(join(TEST_DIR, 'file2.txt'))
    const hash3 = await calculateFileHash(join(TEST_DIR, 'file3.txt'))

    expect(hash1).toBe(hash2) // Same content
    expect(hash1).not.toBe(hash3) // Different content
  })

  it('should find duplicates', async () => {
    const files: FileEntry[] = [
      {
        path: join(TEST_DIR, 'file1.txt'),
        name: 'file1.txt',
        size: 9,
        isDirectory: false,
        category: 'other',
        extension: '.txt',
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        path: join(TEST_DIR, 'file2.txt'),
        name: 'file2.txt',
        size: 9,
        isDirectory: false,
        category: 'other',
        extension: '.txt',
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        path: join(TEST_DIR, 'file3.txt'),
        name: 'file3.txt',
        size: 9,
        isDirectory: false,
        category: 'other',
        extension: '.txt',
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        path: join(TEST_DIR, 'file4.txt'),
        name: 'file4.txt',
        size: 19,
        isDirectory: false,
        category: 'other',
        extension: '.txt',
        createdAt: new Date(),
        modifiedAt: new Date()
      }
    ]

    const results = await findDuplicates(files)

    expect(results).toHaveLength(1) // Only one group (file1 + file2)
    expect(results[0].files).toHaveLength(2)
    expect(results[0].files.map((f) => f.name)).toContain('file1.txt')
    expect(results[0].files.map((f) => f.name)).toContain('file2.txt')
    expect(results[0].files.map((f) => f.name)).not.toContain('file3.txt')
  })
})
