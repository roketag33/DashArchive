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
      priority: 10,
      type: 'extension',
      match: ['jpg', 'png'],
      destination: 'Images'
    }
    expect(matchRule(mockFile, rule)).toBe(true)

    const otherFile = { ...mockFile, extension: 'pdf', category: 'document' as const }
    expect(matchRule(otherFile, rule)).toBe(false)
  })

  it('should match category rule', () => {
    const rule: Rule = {
      id: '2',
      priority: 10,
      type: 'category',
      match: ['image'],
      destination: 'Images'
    }
    expect(matchRule(mockFile, rule)).toBe(true)

    const otherFile = { ...mockFile, category: 'document' as const }
    expect(matchRule(otherFile, rule)).toBe(false)
  })

  it('should match size rule (minBytes)', () => {
    const rule: Rule = {
      id: '3',
      priority: 10,
      type: 'size',
      minBytes: 1000,
      destination: 'Big'
    }
    expect(matchRule(mockFile, rule)).toBe(true) // 1024 > 1000

    const smallFile = { ...mockFile, size: 500 }
    expect(matchRule(smallFile, rule)).toBe(false)
  })

  it('should match fallback rule always', () => {
    const rule: Rule = {
      id: '4',
      priority: 0,
      type: 'fallback',
      destination: 'Other'
    }
    expect(matchRule(mockFile, rule)).toBe(true)
  })

  // Optional namePattern test if I implement it now
  it('should match namePattern (regex)', () => {
    const rule: Rule = {
      id: '5',
      priority: 10,
      type: 'namePattern',
      pattern: '^test', // Starts with test
      destination: 'Tests'
    }
    expect(matchRule(mockFile, rule)).toBe(true)

    const otherFile = { ...mockFile, name: 'other.jpg' }
    expect(matchRule(otherFile, rule)).toBe(false)
  })
})

describe('Rule Engine - resolveDestination', () => {
  it('should resolve static destination', () => {
    const rule: Rule = { id: '1', priority: 1, type: 'fallback', destination: 'Folder/Subfolder' }
    expect(resolveDestination(mockFile, rule)).toBe('Folder/Subfolder/test.jpg')
  })

  it('should resolve {ext}', () => {
    const rule: Rule = { id: '1', priority: 1, type: 'fallback', destination: 'ByExt/{ext}' }
    expect(resolveDestination(mockFile, rule)).toBe('ByExt/jpg/test.jpg')
  })

  it('should resolve {year} and {month}', () => {
    const rule: Rule = {
      id: '1',
      priority: 1,
      type: 'fallback',
      destination: 'Date/{year}/{month}'
    }
    // mockFile modifiedAt is 2023-05-15
    expect(resolveDestination(mockFile, rule)).toBe('Date/2023/05/test.jpg')
  })

  it('should resolve {category}', () => {
    const rule: Rule = { id: '1', priority: 1, type: 'fallback', destination: 'Cat/{category}' }
    expect(resolveDestination(mockFile, rule)).toBe('Cat/image/test.jpg')
  })
})
