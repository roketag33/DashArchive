import { describe, it, expect } from 'vitest'
import { matchRule, resolveDestination } from './engine'
import { Rule, FileEntry } from '../../../shared/types'

const mockFile: FileEntry = {
  path: '/Downloads/test.jpg',
  name: 'test.jpg',
  extension: 'jpg',
  size: 1024,
  isDirectory: false,
  createdAt: new Date('2023-01-01'),
  modifiedAt: new Date('2023-05-15'),
  category: 'image'
}

describe('Rule Engine - matchRule', () => {
  it('should match extension rule', async () => {
    const rule: Rule = {
      id: '1',
      name: 'Images',
      isActive: true,
      priority: 10,
      type: 'extension',
      extensions: ['jpg', 'png'],
      destination: 'Images'
    }
    const file = { name: 'test.jpg', extension: 'jpg' } as FileEntry
    expect(await matchRule(file, rule)).toBe(true)
  })

  it('should not match extension rule', async () => {
    const rule: Rule = {
      id: '1',
      name: 'Images',
      isActive: true, // Should be checked first
      priority: 10,
      type: 'extension',
      extensions: ['jpg', 'png'],
      destination: 'Images'
    }
    const file = { name: 'test.txt', extension: 'txt' } as FileEntry
    // Inactive check logic is inside matchRule
    expect(await matchRule(file, rule)).toBe(false)
  })

  it('should match name pattern rule', async () => {
    const rule: Rule = {
      id: '2',
      name: 'Logs',
      isActive: true,
      priority: 10,
      type: 'name',
      namePattern: '^log_.*',
      destination: 'Logs'
    }
    const file = { name: 'log_2023.txt' } as FileEntry
    expect(await matchRule(file, rule)).toBe(true)
  })

  it('should match fallback rule', async () => {
    const rule: Rule = {
      id: '99',
      name: 'Others',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'Others'
    }
    const file = { name: 'anything' } as FileEntry
    expect(await matchRule(file, rule)).toBe(true)
  })

  it('should ignore inactive rules', async () => {
    const rule: Rule = {
      id: '1',
      name: 'Images',
      isActive: false,
      priority: 10,
      type: 'extension',
      extensions: ['jpg'],
      destination: 'Images'
    }
    const file = { name: 'test.jpg', extension: 'jpg' } as FileEntry
    expect(await matchRule(file, rule)).toBe(false)
  })

  it('should match AI rule', async () => {
    const rule: Rule = {
      id: 'ai1',
      name: 'Invoices',
      isActive: true,
      priority: 10,
      type: 'ai',
      aiPrompts: ['Invoice', 'Contract'],
      destination: 'Financial'
    }
    const file = { path: '/test/invoice.pdf', name: 'invoice.pdf' } as FileEntry

    const mockFetcher = async (): Promise<string> => 'This is an invoice for $500'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockClassifier = async (text: string, _labels: string[]): Promise<string> => {
      if (text.includes('invoice')) return 'Invoice'
      return 'Other'
    }

    expect(await matchRule(file, rule, mockFetcher, mockClassifier)).toBe(true)
  })
})

describe('Rule Engine - resolveDestination', () => {
  it('should resolve static destination', () => {
    const rule: Rule = {
      id: '1',
      name: 'Static',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'Folder/Subfolder'
    }
    expect(resolveDestination(mockFile, rule)).toBe('Folder/Subfolder/test.jpg')
  })

  it('should resolve {ext}', () => {
    const rule: Rule = {
      id: '1',
      name: 'ByExt',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'ByExt/{ext}'
    }
    expect(resolveDestination(mockFile, rule)).toBe('ByExt/jpg/test.jpg')
  })

  it('should resolve {year} and {month}', () => {
    const rule: Rule = {
      id: '1',
      name: 'ByDate',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'Date/{year}/{month}'
    }
    // mockFile modifiedAt is 2023-05-15
    expect(resolveDestination(mockFile, rule)).toBe('Date/2023/05/test.jpg')
  })

  it('should resolve {category}', () => {
    const rule: Rule = {
      id: '1',
      name: 'ByCategory',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'Cat/{category}'
    }
    expect(resolveDestination(mockFile, rule)).toBe('Cat/image/test.jpg')
  })

  it('should resolve destination placeholders', () => {
    const rule: Rule = {
      id: '1',
      name: 'Images',
      isActive: true,
      priority: 10,
      type: 'extension',
      extensions: ['jpg'],
      destination: 'Images/{year}/{month}'
    }
    // Mock date
    const date = new Date('2023-05-15T12:00:00Z')
    const file = {
      name: 'photo.jpg',
      extension: 'jpg',
      createdAt: date,
      modifiedAt: date
    } as FileEntry

    const dest = resolveDestination(file, rule)
    // engine logic appends filename if not present?
    // Let's check implementation of resolveDestination.
    // It appends filename if {name} is NOT in destination.

    // expected: Images/2023/05/photo.jpg
    expect(dest).toBe('Images/2023/05/photo.jpg')
  })

  it('should respect extension placeholder', () => {
    const rule: Rule = {
      id: '1',
      name: 'Docs',
      isActive: true,
      priority: 10,
      type: 'extension',
      extensions: ['txt'],
      destination: 'Docs/{ext}'
    }
    const file = { name: 'notes.txt', extension: 'txt' } as FileEntry
    expect(resolveDestination(file, rule)).toBe('Docs/txt/notes.txt')
  })

  it('should respect explicit name placeholder', () => {
    const rule: Rule = {
      id: '1',
      name: 'Docs',
      isActive: true,
      priority: 10,
      type: 'extension',
      extensions: ['txt'],
      destination: 'Docs/{name}.{ext}'
    }
    const file = { name: 'notes.txt', extension: 'txt' } as FileEntry
    expect(resolveDestination(file, rule)).toBe('Docs/notes.txt')
  })
})

describe('Size Rules', () => {
  it('should match file larger than sizeMin', async () => {
    const rule: Rule = {
      id: '1',
      type: 'size',
      sizeMin: 1000,
      isActive: true,
      priority: 0,
      destination: '/large'
    }
    const smallFile = { ...mockFile, size: 500 }
    const largeFile = { ...mockFile, size: 1500 }

    expect(await matchRule(smallFile, rule)).toBe(false)
    expect(await matchRule(largeFile, rule)).toBe(true)
  })

  it('should match file smaller than sizeMax', async () => {
    const rule: Rule = {
      id: '2',
      type: 'size',
      sizeMax: 1000,
      isActive: true,
      priority: 0,
      destination: '/small'
    }
    const smallFile = { ...mockFile, size: 500 }
    const largeFile = { ...mockFile, size: 1500 }

    expect(await matchRule(smallFile, rule)).toBe(true)
    expect(await matchRule(largeFile, rule)).toBe(false)
  })

  it('should match file within range', async () => {
    const rule: Rule = {
      id: '3',
      type: 'size',
      sizeMin: 1000,
      sizeMax: 2000,
      isActive: true,
      priority: 0,
      destination: '/medium'
    }
    const small = { ...mockFile, size: 500 }
    const medium = { ...mockFile, size: 1500 }
    const large = { ...mockFile, size: 2500 }

    expect(await matchRule(small, rule)).toBe(false)
    expect(await matchRule(medium, rule)).toBe(true)
    expect(await matchRule(large, rule)).toBe(false)
  })
})

describe('Date Rules', () => {
  it('should match file older than ageDays', async () => {
    const rule: Rule = {
      id: '4',
      type: 'date',
      ageDays: 10,
      isActive: true,
      priority: 0,
      destination: '/old'
    }
    const now = new Date()
    const fiveDaysOld = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const fifteenDaysOld = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)

    const newFile = { ...mockFile, modifiedAt: fiveDaysOld }
    const oldFile = { ...mockFile, modifiedAt: fifteenDaysOld }

    expect(await matchRule(newFile, rule)).toBe(false)
    expect(await matchRule(oldFile, rule)).toBe(true)
  })

  it('should not match if ageDays is missing', async () => {
    const rule: Rule = {
      id: '5',
      type: 'date',
      isActive: true,
      priority: 0,
      destination: '/old'
    }
    const now = new Date()
    const oldFile = { ...mockFile, modifiedAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000) }
    expect(await matchRule(oldFile, rule)).toBe(false)
  })
})
