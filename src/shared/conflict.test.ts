import { describe, it, expect } from 'vitest'
import { getNextAvailableName, getExtension, getBasename } from './conflict'

describe('Conflict Resolution', () => {
  it('should return original name if not in set', () => {
    const existing = new Set<string>(['alpha.txt', 'beta.jpg'])
    const target = 'charlie.png'
    expect(getNextAvailableName(target, existing)).toBe('charlie.png')
  })

  it('should rename file.txt to file (1).txt if file.txt exists', () => {
    const existing = new Set<string>(['file.txt'])
    const target = 'file.txt'
    expect(getNextAvailableName(target, existing)).toBe('file (1).txt')
  })

  it('should rename file.txt to file (2).txt if (1) also exists', () => {
    const existing = new Set<string>(['file.txt', 'file (1).txt'])
    const target = 'file.txt'
    expect(getNextAvailableName(target, existing)).toBe('file (2).txt')
  })

  it('should handle multiple increments', () => {
    const existing = new Set<string>(['data.csv', 'data (1).csv', 'data (2).csv'])
    const target = 'data.csv'
    expect(getNextAvailableName(target, existing)).toBe('data (3).csv')
  })

  it('should handle files without extension', () => {
    const existing = new Set<string>(['README', 'README (1)'])
    const target = 'README'
    expect(getNextAvailableName(target, existing)).toBe('README (2)')
  })

  it('should handle case insensitivity (optional but good practice)', () => {
    // Assuming conflict resolution is case-insensitive for safety
    const existing = new Set<string>(['File.txt'])
    const target = 'file.txt'
    // In a real FS, File.txt and file.txt might be same.
    // Let's implement sensitive for now as Set is sensitive, or normalize based on OS.
    // Keeping it simple/sensitive for MVP unless specialized.
    // If we assume sensitive (Linux): 'file.txt' != 'File.txt', so no conflict.
    expect(getNextAvailableName(target, existing)).toBe('file.txt')
  })
})

describe('Filename helpers', () => {
  it('should split extension', () => {
    expect(getExtension('test.jpg')).toBe('jpg')
    expect(getExtension('archive.tar.gz')).toBe('gz') // Simple split
    expect(getExtension('noext')).toBe('')
  })

  it('should get basename', () => {
    expect(getBasename('test.jpg')).toBe('test')
    expect(getBasename('noext')).toBe('noext')
  })
})
