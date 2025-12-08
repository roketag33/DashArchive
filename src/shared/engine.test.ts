import { describe, it, expect } from 'vitest'
import { matchRule, resolveDestination } from './engine'
import { Rule, FileEntry } from './types'

const mockFile: FileEntry = {
  path: '/Downloads/test.jpg',
  name: 'test.jpg',
  extension: 'jpg',
  size: 1024,
  createdAt: new Date('2023-01-01'),
  modifiedAt: new Date('2023-05-15'),
  category: 'image'
}

describe('Rule Engine - matchRule', () => {
  it('should match extension rule', () => {
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
    expect(matchRule(file, rule)).toBe(true)
  })

  it('should not match extension rule', () => {
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
    expect(matchRule(file, rule)).toBe(false)
  })

  it('should match name pattern rule', () => {
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
    expect(matchRule(file, rule)).toBe(true)
  })

  it('should match fallback rule', () => {
    const rule: Rule = {
      id: '99',
      name: 'Others',
      isActive: true,
      priority: 1,
      type: 'fallback',
      destination: 'Others'
    }
    const file = { name: 'anything' } as FileEntry
    expect(matchRule(file, rule)).toBe(true)
  })

  it('should ignore inactive rules', () => {
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
    expect(matchRule(file, rule)).toBe(false)
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
